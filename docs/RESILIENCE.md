# Resiliência: timeout, retry, rate limit

## Timeout

Default **10s** por tentativa (não pelo total — isso é `deadlineMs`, adiante). Três grupos de exceção, porque o contrato deixa três casos com duração real desconhecida (Q9/Q10):

| Operação | Timeout | Motivo |
|---|---|---|
| padrão (31 operações) | `10_000` ms | pedido do produto |
| `POST /api/send-template-bulk` | `120_000` ms | Q10: `to` sem `maxItems`, processamento por número |
| `POST /api/upload-temp` | `60_000` ms | upload multipart |
| `POST /api/send/{type}/{to}`, `POST /api/tickets/{id}/send/{type}`, `POST /api/tickets/{id}/send-and-close` | `60_000` ms | idem, corpo binário |

Precedência: **override por chamada** > **default da operação** (quando ela tem motivo técnico próprio, acima) > **config global** > `10s`.

```ts
const zdk = new Zdk({ baseUrl, token, defaultTimeoutMs: 15_000 }); // vale só onde não há motivo técnico
await zdk.contacts.list({ pageSize: 50_000 }, { timeoutMs: 180_000 }); // override desta chamada, vence tudo
```

Implementação: `AbortSignal.timeout(ms)` composto com o `AbortSignal` do consumidor via `AbortSignal.any([...])` — os dois nativos do Node ≥ 20. Uma ressalva: o timeout é do **corpo inteiro da tentativa**, incluindo upload — `fetch` nativo não separa connect-timeout de read-timeout sem trocar o dispatcher do undici. Upload lento de arquivo grande estoura o mesmo relógio de um servidor travado; os overrides de 60s acima mitigam isso.

## Retry

Segurança de retry não se decide pelo método HTTP — decide-se por **o que já pode ter acontecido no servidor**. Toda operação do contrato tem uma classe fixa (`operation-metadata.ts`):

| Classe | Quantas operações | O que é |
|---|---|---|
| `safe` | 31 (os 24 GETs, os 6 PUTs, `DELETE /api/webhooks/{id}`) | idempotente por semântica |
| `guarded` | 2 (`transfer`, `upload-temp`) | repetir converge ao mesmo estado |
| `unsafe` | 15 (os 9 "send", `resolve`, e as 5 criações) | efeito externo ou criação duplicada |

`resolve` é `unsafe` por um motivo específico: `feedbackOption: "send-end-message"` **dispara mensagem de encerramento ao contato** — repetir manda a mensagem de novo.

### A tabela

| Falha | `safe` | `guarded` | `unsafe` |
|---|---|---|---|
| DNS (`ENOTFOUND`, `EAI_AGAIN`) / `ECONNREFUSED` | repete | repete | **repete** — provadamente pré-envio |
| `ECONNRESET` / socket derrubado | repete | repete | **não** — ambíguo, pode ter sido no meio da resposta |
| Timeout da tentativa | só se `retryOnTimeout: true` | não | não |
| `429` | repete (`retryOnRateLimit`, default `true`) | repete | não por default (`retryUnsafeOnRateLimit`, opt-in) |
| `503` | repete | repete | não |
| `500`/`502`/`504` | repete | não | não |
| `400`/`401`/`403`/`404` e afins | não | não | não |
| `AbortSignal` do consumidor | não | não | não |

`retryOnTimeout` é `false` por default **mesmo pra `safe`** — timeout é ambíguo por natureza (a resposta pode ter sido processada no servidor e só não chegou a tempo).

```ts
const zdk = new Zdk({
  baseUrl, token,
  retryConfig: {
    attempts: 3,
    baseDelayMs: 250,
    maxDelayMs: 8_000,
    maxRetryAfterMs: 30_000,
    retryOnTimeout: false,
    retryOnRateLimit: true,
    retryUnsafeOnRateLimit: false,
    deadlineMs: null,
    onRetry: ({ attempt, delayMs, error, operation }) => { /* log/métrica */ },
    shouldRetry: (context) => undefined, // undefined delega ao default da tabela
  },
});
```

Backoff é exponencial com **full jitter** (`delay = random(0, min(maxDelayMs, baseDelayMs · 2^tentativa))`) — jitter fixo ou "equal" sincronizaria as retentativas de vários workers do mesmo tenant, produzindo exatamente o pico de carga que o backoff existe pra evitar.

`error.attempts`/`error.retryable` (em todo `ZdkError`) descrevem o resultado do processo, não "sobrou orçamento": um `ECONNRESET` numa operação `safe` que esgota as 3 tentativas ainda é `retryable: true` (nunca deixou de ser o tipo que se repete, só ficou sem orçamento); um `404` é `retryable: false` já na 1ª.

### Quando o retry é proibido (`unsafe`)

Sem `Idempotency-Key` (Q11), a lib não pode adivinhar se uma falha ambígua chegou a sair. Em vez de arriscar duplicar, **reconcilie** — ver a receita completa em [RECIPES.md](./RECIPES.md#reconciliação-após-falha-ambígua).

### O pior caso de wall clock

> `timeoutMs × attempts + Σ(backoff)` — com os defaults, `10s × 3 + (~0,25s + ~2s) ≈ 32s`.

Isso quebra handler serverless de 30s que hoje falha em 10s (sem retry nenhum, porque a v0.7 nunca teve). `retryConfig.deadlineMs` limita o total:

```ts
retryConfig: { deadlineMs: 8_000 } // desiste sem dormir se o próximo delay estouraria o teto
```

Default `null` — sem teto implícito escondendo o número; o pior caso fica documentado aqui, não adivinhado.

## Rate limit

A Zappy expõe o orçamento em **toda** resposta (`x-ratelimit-limit`/`-remaining`/`-reset`, headers não documentados — Q14). Observado, não assumido: o limitador roda **antes da autenticação** (headers presentes até em `401`) e o contador cai **mesmo em requisição rejeitada**.

```ts
const zdk = new Zdk({
  baseUrl, token,
  onRateLimit: (snapshot) => console.log(snapshot.remaining, snapshot.resetAt),
});

await zdk.connections.list();
zdk.rateLimit; // { limit, remaining, resetAt, observedAt } | null — reflete a última resposta
```

Dois modos (`rateLimit.mode`):

| Modo | Comportamento |
|---|---|
| `"observe"` (default) | nunca dorme sozinho — só expõe o snapshot via `onRateLimit`/`zdk.rateLimit`. Latência escondida em SDK é pior que erro visível. |
| `"throttle"` | pausa **antes da próxima chamada** se a resposta anterior mostrou `remaining <= reserve` (default `0`) — pra job em lote, onde esperar é melhor que tomar `429`. |

```ts
const zdk = new Zdk({ baseUrl, token, rateLimit: { mode: "throttle", reserve: 50 } });
```

`x-ratelimit-reset` é epoch **absoluto do servidor**, não delta — todo cálculo de espera usa o header `date` da resposta, nunca `Date.now()` do cliente (imune a relógio local errado, testado com o relógio deslocado em 1h). A duração da janela não é derivável de uma amostra e a lib nunca tenta inferir — só usa o instante final.

Em `429`, a ordem de prioridade pra calcular a espera: `Retry-After` do header → `x-ratelimit-reset` → backoff exponencial. Acima de `maxRetryAfterMs` (default 30s), desiste em vez de dormir uma espera enorme.

## Por que não há circuit breaker

Cinco razões, nessa ordem de peso:

1. **Não paga onde a lib mais roda.** Breaker é estado acumulado em processo; em Lambda/Vercel/Cloud Run cada invocação é processo novo — o circuito nunca sai de fechado.
2. **Cria indisponibilidade que a API não teve.** Por host, bloquearia 47 operações saudáveis por causa de 1 com problema; por operação, a janela quase nunca enche.
3. **Torna a falha não-determinística** — mesmo código, mesma entrada, resultado diferente conforme estado escondido. Caro de depurar em produção de terceiro.
4. **O servidor já informa o orçamento exato** (`x-ratelimit-*`) — breaker é heurística pra adivinhar sobrecarga; com o número real disponível, adivinhar é desnecessário.
5. **Quem precisa, precisa acima da lib** — no orquestrador/fila, onde se vê o sistema inteiro. Dois breakers em série são mais difíceis de sintonizar que um.

Substituto de custo quase nulo, já embutido: `maxConcurrent` (semáforo opcional, sem estado entre chamadas), `Retry-After` honrado, e `onRetry`/`shouldRetry` + `HttpClient` injetável — o suficiente pra plugar `opossum` ou um breaker próprio por fora, sem quebrar nada, se a telemetria um dia pedir.

```ts
import { ConcurrencyLimiter } from "zdk";
const zdk = new Zdk({ baseUrl, token, semaphore: new ConcurrencyLimiter(10) });
```
