# ZDK (Kit de Desenvolvimento Zappy) v1

[![NPM Version](https://img.shields.io/npm/v/zdk)](https://www.npmjs.com/package/zdk)
[![License](https://img.shields.io/npm/l/zdk)](https://github.com/innovtech-developers/zdk/blob/main/LICENSE)

SDK TypeScript para a API da Zappy, **derivado do contrato OpenAPI real** (`/swagger.json`) em vez de escrito à mão. Só existe método pra operação que de fato existe na API; body e resposta são tipados a partir do schema, com os defeitos reais do contrato corrigidos e documentados (ver [docs/API-QUIRKS.md](./docs/API-QUIRKS.md)).

Vindo da v0.7? Veja [docs/MIGRATION.md](./docs/MIGRATION.md) — é um break limpo, sem shims.

**Zero dependências de runtime.** `fetch`/`FormData`/`AbortController` nativos, Node ≥ 20.

## Instalação

```sh
npm install zdk
```

## Configuração

```ts
import { Zdk } from "zdk";

const zdk = new Zdk({
  baseUrl: "https://api-<tenant>.zapcontabil.chat", // ou .zapplataforma.chat
  token: "<sua chave de API, 250 caracteres>",
});
```

`new Zdk(...)` é **síncrono e sem I/O** — só valida o formato de `baseUrl`/`token`. `baseUrl` precisa ter host `api-<tenant>` num dos dois domínios da Zappy (allowlist sem exceção — protege o token, que vai no header `Authorization` de toda chamada); veja [docs/AUTH.md](./docs/AUTH.md) pros detalhes e como afrouxar as checagens de ergonomia (`strictApiHost`/`strictTokenLength`) sem abrir mão da allowlist.

Alternativa, com fallback de variável de ambiente (`ZAPPY_URL`/`ZAPPY_TOKEN`):

```ts
const zdk = new Zdk(); // lê ZAPPY_URL/ZAPPY_TOKEN do process.env
```

A lib **não** carrega `.env` sozinha — se usa `dotenv` ou similar, carregue antes de instanciar.

### Provando a credencial

```ts
// new Zdk() nunca faz requisição. Pra provar que baseUrl/token realmente
// funcionam contra a API, use connect() (1 requisição) ou verify() depois:
const zdk = await Zdk.connect({ baseUrl, token });

// ou, se já tem uma instância:
const { connections, rateLimit } = await zdk.verify();
```

`verify()` reusa `GET /api/connections` — não é health check desperdiçado, é a mesma chamada que qualquer envio precisaria de qualquer forma (pra saber o `connectionFrom`).

## Quickstart

```ts
import { Zdk, ZdkOfficialApiWindowError } from "zdk";

const zdk = await Zdk.connect({ baseUrl: "...", token: "..." });

// conexão utilizável pra enviar (CONNECTED ou WHATSAPP_AUTH)
const connection = await zdk.connections.findUsable();

try {
  const message = await zdk.messages.sendText("5511999999999", {
    body: "Olá! Como posso ajudar?",
    connectionFrom: connection.id,
  });
  console.log(message.id);
} catch (error) {
  if (error instanceof ZdkOfficialApiWindowError) {
    // API Oficial: 24h sem o contato responder — precisa de template.
    // Ver seção "API Oficial" abaixo.
  } else {
    throw error;
  }
}
```

## Os 12 recursos

Cada um é uma propriedade `readonly` de `Zdk`, mapeando 1:1 pras 48 operações do contrato (`docs/API-DIVERGENCE.md` documenta a divergência entre instâncias — nem toda operação existe em toda versão implantada da API).

| Propriedade | Cobre | Métodos |
|---|---|---|
| `zdk.connections` | Conexões do WhatsApp | `list`, `get` (estrito), `findUsable` |
| `zdk.contacts` | Contatos | `list`, `get`, `create`, `update`, `setTags` |
| `zdk.tags` | Tags | `list`, `get`, `create`, `update` |
| `zdk.queues` | Setores | `list`, `get`, `create`, `update`, `createMany`, `listWithUsers` |
| `zdk.users` | Usuários do sistema | `list`, `get` |
| `zdk.messages` | Mensagens avulsas | `list`, `get`, `sendText`, `sendMedia`, `sendMediaByUrl`, `sendMany` |
| `zdk.tickets` | Atendimentos (o maior: 11 operações) | `list`, `searchByContact`, `get`, `update`, `transfer`, `resolve`, `sendText`, `sendMedia`, `sendMediaByUrl`, `sendAndClose`, `info`, `sendTemplate` |
| `zdk.templates` | Templates da API Oficial | `list`, `send`, `sendBulk` |
| `zdk.storage` | Armazenamento | `signedUrl`, `uploadTemp` |
| `zdk.webhooks` | Webhooks | `list`, `get`, `create`, `update`, `delete` |
| `zdk.dashboard` | Relatórios agregados | `ticketsByAgent`, `ticketsByQualification`, `ticketsGrouped` |
| `zdk.metrics` | Métricas de mensagens | `messages` |

Receitas prontas (envio de mídia por arquivo/URL, template com header de imagem, bulk com reprocesso, paginação, etc.) em [docs/RECIPES.md](./docs/RECIPES.md).

## Erros tipados

Todo método lança — nunca devolve `T | { error }`. Hierarquia completa em [docs/RESILIENCE.md](./docs/RESILIENCE.md); os principais:

```ts
import {
  ZdkError, // base — instanceof pega qualquer erro do ZDK
  ZdkConfigError, // baseUrl/token inválido — nunca chega a fazer requisição
  ZdkNetworkError, // DNS, conexão recusada, socket derrubado
  ZdkTimeoutError, // estourou o timeout desta tentativa
  ZdkAbortError, // seu próprio AbortSignal disparou
  ZdkUnsupportedOperationError, // operação não existe NESTA instância (§ versão implantada)
  ZdkValidationError, // 400
  ZdkOfficialApiWindowError, // 400 + janela de 24h fechada (API Oficial)
  ZdkAuthError, // 401/403 — .code distingue token errado de bug do SDK
  ZdkNotFoundError, // 404
  ZdkRateLimitError, // 429 — .retryAfterMs quando disponível
  ZdkServerError, // 5xx
} from "zdk";

try {
  await zdk.tickets.resolve(id, { feedbackOption: "send-end-message" });
} catch (error) {
  if (error instanceof ZdkNotFoundError) {
    // ticket não existe
  } else if (error instanceof ZdkError) {
    console.error(error.code, error.attempts, error.retryable);
  }
}
```

`attempts`/`retryable` existem em todo erro: dizem quantas tentativas o retry automático já fez e se aquela CLASSE de falha é do tipo que se repete — não confundir com "sobrou orçamento". Ver a matriz completa (o que repete e o que não repete, e por quê) em [docs/RESILIENCE.md](./docs/RESILIENCE.md).

### O cálculo que importa antes de configurar timeout curto

> **Pior caso de wall clock de uma chamada, com os defaults:**
> `timeoutMs × attempts + Σ(backoff) ≈ 10s × 3 + (~0,25s + ~2s) ≈ 32s`
>
> Um handler serverless de 30s que hoje falha em 10s passaria a falhar (com um erro melhor explicado) perto dos 30s. `retryConfig.deadlineMs` limita o total; ver [docs/RESILIENCE.md](./docs/RESILIENCE.md#deadline).

## `supports()` — a API não é a mesma em toda instância

O contrato varia por **versão implantada**, não por tenant: a mesma operação pode existir numa instância e não na outra (ex.: Webhooks, ausente em algumas). Chamar uma operação inexistente vira `ZdkUnsupportedOperationError` explicando isso — nunca um `404` cru.

```ts
if (zdk.supports("GET /api/webhooks")) {
  // habilita a tela de webhook só se a instância tiver a feature
}

await zdk.capabilities(); // carrega e cacheia o swagger da instância (1x)
```

Por padrão isso só é checado **sob demanda** (quando um 404 real acontece, custo zero em toda chamada bem-sucedida). `verifyCapabilities: true` na config faz a checagem prévia, sempre — útil em job longo, onde uma leitura amortiza sobre milhares de chamadas.

## API Oficial (WhatsApp Cloud API)

Conexões do tipo API Oficial aparecem com `status: "WHATSAPP_AUTH"` (valor real, não documentado no swagger — ver Q1 em [docs/API-QUIRKS.md](./docs/API-QUIRKS.md)). Fora da janela de 24h, texto livre é rejeitado (`ZdkOfficialApiWindowError`) e é preciso enviar **template**:

```ts
// confere a janela antes de decidir o caminho
const info = await zdk.tickets.info(ticketId);

if (info.canSendMessageWithOficialApi) {
  await zdk.messages.sendText(to, { body, connectionFrom });
} else {
  const templates = await zdk.templates.list(connection.id);
  const template = templates.find((t) => t.status === "APPROVED" && t.id !== undefined);
  if (!template?.id) throw new Error("nenhum template aprovado disponível");

  await zdk.templates.send(to, {
    connectionFrom: connection.id,
    templateId: template.id.toString(),
  });
}
```

Envio em massa de template devolve falha parcial por número — nunca lança pro lote inteiro:

```ts
const { results = [] } = await zdk.templates.sendBulk({
  to: ["5511999999999", "5511888888888"],
  connectionFrom: connection.id,
  templateId: "160",
});
const failed = results.filter((r) => r.status === "error");
```

## Documentação completa

- [docs/MIGRATION.md](./docs/MIGRATION.md) — vindo da v0.7
- [docs/API-QUIRKS.md](./docs/API-QUIRKS.md) — os 24 desvios reais do contrato
- [docs/API-DIVERGENCE.md](./docs/API-DIVERGENCE.md) — divergência entre instâncias (gerado por `sync:api`)
- [docs/RESILIENCE.md](./docs/RESILIENCE.md) — timeout, retry, rate limit, por que não há circuit breaker
- [docs/AUTH.md](./docs/AUTH.md) — allowlist de domínio, formato do token, `new Zdk` vs `connect` vs `verify`
- [docs/RECIPES.md](./docs/RECIPES.md) — receitas prontas por caso de uso
- [CONTRIBUTING.md](./CONTRIBUTING.md) — fluxo de `sync:api`, como adicionar recurso, política de quirk
- [Referência de API (typedoc)](./docs/api/README.md)

## Licença

ISC
