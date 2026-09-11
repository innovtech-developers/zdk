# Spec: ZDK v1 — SDK derivado do Swagger

> Status: **aprovada (Fase 1)** · Autor: Lucas Bogos · Data: 2026-09-10 · Substitui: v0.7.17

## 1. Objective

Reescrever o ZDK como um SDK **derivado do contrato OpenAPI da Zappy**, publicado como `zdk@1.0.0`.

**Problema atual (v0.7.17):** a superfície da lib foi escrita à mão e divergiu da API. Ela expõe **14 das 48 operações** existentes, tem tipos inventados que não correspondem aos schemas reais, engole todo erro em `console.error` + string genérica, e carrega bugs silenciosos (`/api/messages` envia `dateToo=` em vez de `dateTo` — [src/lib/message.ts:70](../src/lib/message.ts#L70)).

**Objetivo:** a lib passa a expor **somente e exatamente** o que o `swagger.json` declara, com tipos gerados a partir dele, mais uma camada auditável de correções para os defeitos conhecidos do contrato.

### Usuário

Desenvolvedor Node/TypeScript integrando um sistema próprio ao atendimento Zappy (envio de mensagem, template da API Oficial, gestão de atendimento, webhooks, métricas).

### Sucesso é

- Toda operação do swagger acessível por um método tipado; nenhuma operação inexistente acessível.
- `zdk.messages.send(...)` autocompleta body e retorno sem cast manual.
- Erro `ERR_OFFICIAL_API_WINDOW_CLOSED` capturável por `instanceof`, não por comparação de string.
- `WHATSAPP_AUTH` tipado como status válido apesar de ausente do swagger.
- Regerar tipos contra qualquer tenant = um comando.

### Fora de escopo (YAGNI)

Cliente de webhooks (receber/validar assinatura), cache de resposta, browser bundle, CLI interativa, wrapper de socket.io, **circuit breaker** (§5.8.5 justifica), fila/dedup de envio.

## 2. Tech Stack

| Item | Escolha | Motivo |
|---|---|---|
| Linguagem | TypeScript 5.9+, `strict: true` | inferência via template literal types exige TS moderno |
| Runtime | **Node 20+** (`.tool-versions` e `engines.node` atualizados; 18 está em EOL) | `fetch`/`FormData`/`AbortController`/`AbortSignal.any` nativos, sem polyfill nem composição manual |
| HTTP | `fetch` nativo | **remove `axios`** → zero dependência de runtime |
| Multipart | `FormData`/`Blob` nativos | **remove `form-data`** |
| Codegen | `openapi-typescript` (dev) | gera `paths`/`components` de OpenAPI 3.0 |
| Build | `tsup` (CJS + ESM + d.ts) | mantido |
| Testes | `vitest` + `@vitest/coverage-v8` | pedido do produto |
| Docs | `typedoc` + `typedoc-plugin-markdown` | mantido |
| Script runner | `tsx` (dev) | roda `scripts/sync-api.ts` |
| Timeout / abort | `AbortSignal.timeout` + `AbortSignal.any` | nativo no Node 20 (§5.8.1) |
| Retry | implementação própria em `core/retry.ts` | política é por operação (§5.8.3); nenhuma lib genérica sabe disso |
| Rate limit | leitura dos headers da resposta | `express-rate-limit` legacy no servidor; orçamento vem pronto (§5.8.4) |

**Dependências de runtime: nenhuma.** `dotenv` sai do caminho de import (era `import "dotenv/config"` dentro de `src/zdk.ts`, efeito colateral inaceitável numa lib — quem quiser carrega antes).

## 3. Commands

```sh
npm run dev              # tsup --watch
npm run build            # rm -rf dist && tsup
npm run typecheck        # tsc --noEmit
npm run lint             # eslint .
npm run lint:fix         # eslint --fix .
npm run format           # prettier --write .
npm test                 # vitest run
npm run test:watch       # vitest
npm run test:coverage    # vitest run --coverage
npm run test:types       # vitest --typecheck run
npm run sync:api         # tsx scripts/sync-api.ts \
                         #   --url https://api-zapcontabil.zapcontabil.chat \
                         #   --url https://api-safiracosmeticos.zapplataforma.chat
npm run docs:generate    # typedoc
npm run verify           # npm run typecheck && npm run lint && npm test && npm run build
```

`npm run verify` é o gate de commit e o job de CI.

## 4. Project Structure

```
specs/                      → especificações versionadas (este arquivo)
scripts/
  sync-api.ts               → baixa N swaggers, gera a união, emite relatório de divergência de versão
src/
  index.ts                  → barrel público (única superfície exportada)
  zdk.ts                    → facade Zdk: composição dos recursos
  core/
    config.ts               → ZdkConfig congelada + parseBaseUrl/parseToken (§5.6)
    http-client.ts          → interface HttpClient + FetchHttpClient
    request-builder.ts      → path params, query string, headers, body/multipart
    api-client.ts           → ApiClient: request<K extends OperationKey>()
    errors.ts               → hierarquia ZdkError
    error-mapper.ts         → status + payload → instância de ZdkError
    capabilities.ts         → descoberta em runtime das operações do tenant
    retry.ts                → executor de retry + classificação de falha (§5.8.3)
    backoff.ts              → cálculo de delay (exponencial + full jitter) — puro
    semaphore.ts            → limite de concorrência (maxConcurrent)
    rate-limit.ts           → parse dos headers x-ratelimit-* + espera server-relative (§5.8.4)
    operation-metadata.ts   → por OperationKey: retryClass + timeout default
    pagination.ts           → Page<T> + paginate() (async iterator)
    operation.ts            → tipos utilitários OperationKey/ApiBody/ApiResponse
  generated/
    openapi.d.ts            → GERADO por sync:api — não editar à mão
    operations.ts           → GERADO: Set das operações do snapshot
  schema/
    overrides.ts            → correções dos defeitos do contrato (registry auditável)
    types.ts                → tipos públicos derivados (Connection, Ticket, …)
  resources/
    resource.ts             → classe base abstrata
    connections.ts  contacts.ts  messages.ts  tickets.ts
    queues.ts       tags.ts      users.ts     templates.ts
    webhooks.ts     dashboard.ts metrics.ts   storage.ts
tests/                      → TODOS os testes, fora de src/ (pedido do produto)
  unit/                     → core puro, sem I/O
  integration/              → recursos contra HttpClient fake
  contract/                 → swagger snapshot × registry de overrides
  types/                    → asserções de tipo (expectTypeOf)
  fixtures/
    swagger-zapcontabil.json    → snapshot real, 48 ops (commitado)
    swagger-zapplataforma.json  → snapshot real, 43 ops (commitado)
  helpers/                  → fake HttpClient, builders de resposta
docs/                       → SAÍDA do typedoc (não editar; ver §10)
```

**Regra:** `src/generated/` nunca é editado à mão e é excluído de lint, coverage e review.

## 5. Arquitetura

### 5.1 Tipos vindos do swagger (build-time)

`openapi-typescript` gera `paths` e `components`. Sobre isso, `src/core/operation.ts` deriva chaves `"MÉTODO /path"` e extrai body/params/response por chave:

```ts
import type { paths } from "../generated/openapi";

type HttpVerb = "get" | "post" | "put" | "patch" | "delete";

/**
 * `openapi-typescript` emite TODO verbo em TODO path, marcando os inexistentes
 * como `put?: never`. Um `Extract<keyof paths[P], HttpVerb>` cru aceitaria
 * "PUT /api/connections", que não existe. Filtrar por valor `undefined` é obrigatório.
 */
type VerbsOf<P extends keyof paths> = {
  [M in Extract<keyof paths[P], HttpVerb>]-?: paths[P][M] extends undefined ? never : M;
}[Extract<keyof paths[P], HttpVerb>];

/** Toda operação que existe de fato no contrato. Ex: "POST /api/send/{to}". */
export type OperationKey = {
  [P in keyof paths]: `${Uppercase<VerbsOf<P>>} ${P & string}`;
}[keyof paths];

type Operation<K extends OperationKey> = K extends `${infer M} ${infer P}`
  ? P extends keyof paths
    ? Lowercase<M> extends keyof paths[P]
      ? paths[P][Lowercase<M>]
      : never
    : never
  : never;

/** `requestBody` sai OPCIONAL do gerador (o swagger não o marca obrigatório) → NonNullable. */
type Content<K extends OperationKey> =
  NonNullable<Operation<K>> extends { requestBody?: infer RB }
    ? NonNullable<RB> extends { content: infer C } ? C : never
    : never;

/** Três operações aceitam dois content-types (Q20), então ele é parâmetro. */
export type ApiContentType<K extends OperationKey> = keyof Content<K>;

type DefaultContentType<K extends OperationKey> =
  "application/json" extends ApiContentType<K> ? "application/json" : ApiContentType<K>;

export type ApiBody<
  K extends OperationKey,
  CT extends ApiContentType<K> = DefaultContentType<K>,
> = CT extends keyof Content<K> ? Content<K>[CT] : never;

export type ApiResponse<K extends OperationKey> =
  NonNullable<Operation<K>> extends {
    responses: { 200: { content: { "application/json": infer R } } };
  }
    ? R
    : never;

export type ApiParams<K extends OperationKey> =
  NonNullable<Operation<K>> extends { parameters: infer P } ? P : never;
```

Esse trecho não é esboço: foi compilado com `tsc --strict` contra a saída real de `openapi-typescript@7.13` sobre o snapshot da `api-zapcontabil`, com asserções `Expect<Eq<...>>` verificando que `"PUT /api/connections"` é rejeitado, que `"DELETE /api/webhooks/{id}"` é aceito, que o body de `POST /api/send/{to}` infere `SendMessage`, e que os dois content-types de `POST /api/send/{type}/{to}` resolvem para schemas diferentes. Vira `tests/types/operation.test-d.ts`.

Consequência: um método de recurso que cite uma chave inexistente **não compila**. É assim que "só o que existe na API" passa a ser garantido pelo compilador, não por disciplina.

O baseline é a **união** dos snapshots amostrados, não uma instância única (Q15). Tipo é promessa de compilação, não garantia de disponibilidade — quem responde por disponibilidade é §5.2. A união existe para que nenhuma instância perca superfície tipada por acidente de amostragem.

#### 5.1.1 O que "tipo derivado do swagger" entrega — e o que não entrega

Vale fixar o modelo mental, porque "tipos dinâmicos" comporta duas leituras e só uma é possível.

**Em desenvolvimento: estático, derivado, regenerável.** O autocomplete lê `src/generated/openapi.d.ts`, um arquivo em disco que viaja no pacote npm. TypeScript resolve tipo em tempo de compilação e **não faz I/O de rede durante typecheck** — o editor não tem como saber a qual instância o código vai conectar em runtime.

| Em dev, você tem | |
|---|---|
| autocomplete dos 12 recursos e seus métodos | sim |
| body, params e response tipados por operação | sim |
| chave de operação inexistente | **erro de compilação** |
| saber que uma operação não está em toda instância | sim, via `docs/API-DIVERGENCE.md` — doc, não tipo |
| o tipo encolher porque *esta* instância não tem webhooks | **não** |

O ganho de "derivado" não é reatividade: é que nenhum tipo é escrito à mão nem deduzido de exemplo. Sai do contrato, e atualizar é um comando (§5.1.2).

**Em runtime: dinâmico de fato.** `zdk.supports(key)` e `await zdk.capabilities()` respondem pela instância real; `404` em path conhecido vira `ZdkUnsupportedOperationError` explicando que é diferença de versão (§5.2).

**Descartado: fachada genérica por instância.** Existiria como `new Zdk<MinhaInstancia>()`, com recursos condicionais por mapped type e um `npx zdk sync` do lado do consumidor. É TypeScript padrão e funcionaria — declaration merging não serve, porque **só adiciona, nunca remove**, então não há augmentation que apague `zdk.webhooks` do editor; teria de ser genérico de verdade.

Fora por três razões:

1. Compraria um erro de compilação onde já existe erro de runtime preciso e acionável.
2. Custaria genérico em **12** classes de recurso, e mensagem de erro de mapped type profundo é o tipo de coisa que o consumidor não consegue depurar.
3. **Não elimina o drift, move.** A instância faz deploy sem avisar o repositório do consumidor, então o tipo gerado localmente também é um retrato — mais estreito, igualmente datado.

Se algum dia a divergência entre versões virar rotina de suporte, isso entra numa v1.x por trás do mesmo `sync:api`, sem quebrar o default.

#### 5.1.2 `sync:api` na prática

Comando de **manutenção da lib**, não do consumidor: `src/generated/openapi.d.ts` vai commitado e viaja dentro do pacote npm. Quem instala `zdk` nunca roda isso nem precisa de rede em build.

```sh
npm run sync:api -- \
  --url https://api-zapcontabil.zapcontabil.chat \
  --url https://api-safiracosmeticos.zapplataforma.chat
```

Passos:

1. Valida cada URL por `parseBaseUrl` (§5.6) e baixa o `/swagger.json` de cada instância.
2. Salva cada snapshot em `tests/fixtures/swagger-<label>.json` — é o insumo do teste de contrato.
3. **Une** os documentos: união de operações e de propriedades de schema, alargando o que existe em um e não em outro.
4. Roda `openapi-typescript` sobre o documento unido → `src/generated/openapi.d.ts`.
5. Imprime o relatório de divergência (e grava em `docs/API-DIVERGENCE.md`).

Relatório, com os dois hosts amostrados hoje:

```
api-zapcontabil.zapcontabil.chat        48 ops, 47 schemas
api-safiracosmeticos.zapplataforma.chat 43 ops, 43 schemas
união: 48 ops, 47 schemas

só em api-zapcontabil (5):
  GET|POST /api/webhooks, GET|PUT|DELETE /api/webhooks/{id}
propriedades só em api-safiracosmeticos (2):
  SendMediaMessage.ticketStrategy, SendMediaMessageJson.ticketStrategy
```

**Não é necessário saber de antemão qual instância roda qual versão** — o relatório descobre e informa. O fluxo é: passar os hosts disponíveis, ver quais divergem, manter no comando os que contribuem operação ou campo próprio. Instância que não acrescenta nada sai.

| Hosts amostrados | Efeito |
|---|---|
| 1 | funciona; superfície tipada = daquela instância |
| 2 nos extremos (versão mais nova e mais antiga em uso) | cobertura quase completa — feature costuma ser adicionada, raramente removida |
| 5 da mesma versão | idêntico a 1, só mais lento |

Risco a registrar: se uma versão nova **remover** um campo, a união o mantém e a lib deixaria enviá-lo para uma instância que o ignora. Impacto baixo (a API tende a ignorar campo desconhecido) e o relatório expõe o caso, então a decisão fica consciente em vez de silenciosa.

### 5.2 Features dinâmicas (runtime)

Tipo não existe em runtime, então a checagem de disponibilidade é separada. `src/core/capabilities.ts` busca `/swagger.json` do tenant, monta `ReadonlySet<string>` de `"MÉTODO /path"` e responde:

```ts
const zdk = new Zdk({ baseUrl, token });

await zdk.capabilities();                                  // carrega e cacheia (1x)
zdk.supports("POST /api/send-template-bulk");              // boolean
```

**Essa camada não é conforto, é requisito.** Os contratos divergem entre instâncias (Q15): `api-zapcontabil.zapcontabil.chat` publica 48 operações incluindo Webhooks; `api-safiracosmeticos.zapplataforma.chat` publica 43 e **não tem Webhooks** — mas tem `ticketStrategy` em `SendMediaMessage`, que o outro não tem. A divergência é bidirecional e **os dois se declaram `info.version: 2.1.0`**, então nem a versão detecta.

A divergência é por **versão implantada**, não por identidade de tenant: webhooks existe em algumas versões e não em outras, e o mesmo vale para o resto. Logo **qualquer** operação pode faltar em **qualquer** instância, e um flag estático de "é universal" seria só um retrato da amostra — envelheceria a cada deploy da Zappy. Descartado.

O único juiz de disponibilidade é o swagger que a própria instância serve. Duas portas para ele, ambas sem custo no caminho feliz:

**1. Diagnóstico sob demanda (default, custo zero).** Nenhuma pré-checagem. Quando um `404` volta de um path que existe na união de tipos, isso é evidência forte de diferença de versão — não de erro de uso. Aí, e só aí, o `ApiClient` busca o swagger uma vez (cacheado) e reergue o erro como `ZdkUnsupportedOperationError`: *"esta operação não existe na versão desta instância"*, em vez de um `404` cru do Express. Requisição que ia falhar de qualquer forma passa a falhar explicando o motivo, e nenhuma requisição bem-sucedida paga nada.

**2. Gate proativo (opt-in).** `await zdk.capabilities()` e `zdk.supports(key)` para quem precisa decidir antes — habilitar tela de webhook, escolher caminho de código. `verifyCapabilities: true` faz a pré-checagem em todas as chamadas; útil em job longo, onde uma leitura amortiza sobre milhares de operações.

Falha ao buscar o swagger nunca bloqueia a chamada: registra e assume suportado. `404` sem swagger disponível permanece `ZdkNotFoundError`.

### 5.3 Camada de overrides — defeitos do contrato

O swagger tem divergências reais. Cada uma vira entrada num registry versionado, com motivo e teste de contrato associado.

| # | Divergência | Correção no ZDK |
|---|---|---|
| Q1 | `Connection.status` enum sem `WHATSAPP_AUTH` (conexão com API Oficial ativa) | adiciona ao union; `isOfficialApi(conn)` derivado |
| Q2 | 42 de 47 schemas sem array `required` → codegen marca tudo opcional | `Required<>`/`RequiredBy<>` por schema de resposta |
| Q3 | 12 properties com `required: true` **inline** (inválido em OpenAPI 3): `SendTemplate.connectionFrom`, `ContactPostData.name`/`number`, `TagPostData.name`, `UploadTemp.media`, `ContactExtraInfo.name`/`value`, `SendMediaMessage.media`, `SendMediaMessageJson.url`, `UploadTempResponse.url`/`filename`/`success` | promovidas a obrigatórias no tipo de entrada |
| Q4 | `POST /api/tickets/{id}/send-template` declara `id` de path como opcional | `id` obrigatório na assinatura |
| Q5 | `GET /api/messages`: `ticketId`/`contactId`/`dateFrom`/`dateTo` sem `type` | tipados como `string` |
| Q6 | Erro `ERR_OFFICIAL_API_WINDOW_CLOSED` chega como 400 genérico | mapeado para `ZdkOfficialApiWindowError` |
| Q7 | `POST /api/messages/multiple/{to}` recebe `messages` como **JSON stringificado** | método aceita `readonly MessageData[]` e serializa internamente |
| Q8 | Contrato **não documenta `429`, `Retry-After` nem `503/502/504`** (só 200/400/401/404/500), mas o rate limit **existe** e é anunciado nos headers. Observado: o limitador roda **antes da autenticação** (headers presentes num `401`) e **consome orçamento em requisição rejeitada** | política de retry trata esses status por RFC 9110, não pelo contrato; `ZdkRateLimitError` existe apesar de ausente do swagger |
| Q9 | `pageSize` declarado **sem limite** ("pode ser feito uma chamada para trazer todos os contatos") | resposta de duração ilimitada → exige `timeout` por chamada (§5.8.1) |
| Q10 | `SendTemplateBulk.to` **sem `maxItems`** e resposta é 200 com **falha parcial** por número | bulk nunca entra em retry automático (§5.8.3); consumidor reprocessa pelos `results[].status` |
| Q11 | Nenhum `Idempotency-Key` em nenhuma operação | impossível retry seguro de POST com efeito externo; no lugar do retry, a receita de reconciliação (§5.8.3) |
| Q18 | **`GET /api/connections` declara `Connection` (objeto único) na resposta 200**, mas a resposta real é `{ connections: Connection[] }` — não existe schema `ConnectionList`, ao contrário de todos os outros recursos que têm `XxxList`. Provado no tipo: `ApiResponse<"GET /api/connections">` não tem a chave `connections` | override de resposta em `schema/overrides.ts`; `verify()` e `connections.*` dependem disso |
| Q19 | **Suspeita de wrapper nas respostas de envio.** Swagger declara `Message` puro em `POST /api/send/{to}`; a v0.7 tipava `{ message: Message }` e `SendTemplateBulkResult.results[].message` também é aninhado. Um dos dois está errado e não dá para decidir sem uma chamada real com credencial | resolver na Tarefa de `messages` com uma chamada real; até então o tipo segue o swagger e o override fica preparado |
| Q20 | **Três operações aceitam dois content-types** — `POST /api/send/{type}/{to}`, `POST /api/tickets/{id}/send/{type}`, `POST /api/messages/multiple/{to}`: `multipart/form-data` (`SendMediaMessage.media`, binário) **ou** `application/json` (`SendMediaMessageJson.url`). Não é defeito, é capacidade — e a v0.7 implementava só multipart, então **enviar mídia por URL nunca existiu na lib** | `ApiBody` recebe content-type como parâmetro (§5.1); métodos separados por variante (§5.5) |
| Q21 | `Message.subtype` é `integer` no contrato; a v0.7 tipava `string` | tipo segue o contrato |
| Q17 | Corpo de erro real é `{"error":"ERR_*","errorData":{}}`, mas o schema `Error` do swagger declara **só** `error: string` — `errorData` não existe no contrato. Códigos observados e não documentados: `ERR_NO_AUTH_HEADER_PRESENT`, `ERR_INVALID_API_KEY` | `ZdkHttpError` expõe `readonly code` (o `ERR_*`) e `readonly payload` completo, preservando `errorData` sem tipá-lo além de `unknown` |
| Q16 | Host de API segue `api-<tenant>.<apex>` — padrão observado em 2 tenants, não documentado | `strictApiHost` (default `true`) valida o rótulo; desligável porque o falso positivo bloqueia cliente legítimo e a checagem não tem valor de segurança (§5.6.1) |
| Q12 | Token tem **250 caracteres** — não documentado em lugar nenhum | `parseToken` valida comprimento e ASCII imprimível, com flag `strictTokenLength` para não quebrar o consumidor se o formato mudar (§5.6.2) |
| Q13 | **`401` documentado em 1 das 48 operações** (`POST /api/messages/multiple/{to}`); `GET /api/connections` declara só `200` | `ErrorMapper` trata `401` em qualquer rota; `verify()` depende desse comportamento não-contratado (§5.7) |
| Q15 | **O contrato varia por versão da instância, e `info.version` não acompanha.** zapcontabil: 48 ops (com Webhooks); safira/zapplataforma: 43 ops (sem Webhooks, mas **com** `ticketStrategy` em `SendMediaMessage`/`SendMediaMessageJson`). Ambos se declaram `2.1.0`. Não é diferença de produto — os dois domínios são o mesmo sistema, separados por marketing; é diferença de **versão implantada**, e qualquer operação pode faltar em qualquer instância | tipos = união dos snapshots amostrados; disponibilidade = **swagger da própria instância em runtime**, nunca um flag estático (§5.1, §5.2) |
| Q14 | Headers `x-ratelimit-limit` / `-remaining` / `-reset` **ausentes do contrato**; `reset` é epoch absoluto do servidor | parser lê legacy `x-ratelimit-*` e draft `ratelimit-*`; espera calculada contra o header `date`, nunca contra o relógio local (§5.8.4) |

```ts
// src/schema/overrides.ts
export const CONNECTION_STATUS = Object.freeze({
  connected: "CONNECTED",
  disconnected: "DISCONNECTED",
  timeout: "TIMEOUT",
  /** Q1 — não documentado: conexão com API Oficial (Meta Cloud API) autenticada. */
  whatsappAuth: "WHATSAPP_AUTH",
} as const);

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

/** Registry auditável: cada quirk tem id, motivo e ponto do contrato. */
export const API_QUIRKS = Object.freeze([
  { id: "Q1", at: "components.schemas.Connection.status", reason: "enum omite WHATSAPP_AUTH" },
  // …
] as const);
```

`tests/contract/` valida o registry contra `tests/fixtures/swagger.json`: se a Zappy corrigir um defeito, o teste **falha** avisando que o override virou dívida — o registry não apodrece em silêncio.

### 5.4 Erros tipados

```
ZdkError                        (abstract; readonly code, readonly cause?)
├─ ZdkConfigError               baseUrl/token ausente ou inválido
├─ ZdkNetworkError              falha de transporte (readonly cause.code: ENOTFOUND, ECONNREFUSED, …)
├─ ZdkTimeoutError              estourou o timeout da tentativa (readonly timeoutMs)
├─ ZdkAbortError                AbortSignal do consumidor — nunca sofre retry
├─ ZdkUnsupportedOperationError operação ausente no swagger do tenant
└─ ZdkHttpError                 readonly status, payload, requestId?
   ├─ ZdkValidationError            400
   ├─ ZdkOfficialApiWindowError     400 + ERR_OFFICIAL_API_WINDOW_CLOSED (Q6)
   ├─ ZdkAuthError                  401 / 403
   ├─ ZdkNotFoundError              404
   ├─ ZdkRateLimitError             429 (+ readonly retryAfterMs) — Q8
   └─ ZdkServerError                5xx
```

Todo erro carrega `readonly attempts: number` e `readonly retryable: boolean`, para o consumidor distinguir "falhou de primeira" de "falhou após esgotar as tentativas".

`ZdkHttpError.code` vem do campo `error` do corpo — os códigos `ERR_*` da Zappy, que são o discriminante útil (`ERR_OFFICIAL_API_WINDOW_CLOSED`, `ERR_INVALID_API_KEY`, `ERR_NOT_OFICIAL_CONNECTION`). O corpo inteiro fica em `readonly payload: unknown`, o que preserva o `errorData` não documentado (Q17) sem inventar tipo para ele.

Métodos retornam `T` puro e **lançam**. Fim do `T | IError` e do `console.error` dentro da lib (a lib não decide política de log do consumidor; `Logger` é injetável e no-op por padrão).

```ts
try {
  const { message } = await zdk.messages.sendText("5511999999999", {
    body: "Olá",
    connectionFrom: 1,
  });
  console.log(message.id);
} catch (error) {
  if (error instanceof ZdkOfficialApiWindowError) {
    await zdk.templates.send("5511999999999", { connectionFrom: 1, templateId: "abc" });
  } else if (error instanceof ZdkValidationError) {
    console.error(error.payload);
  } else {
    throw error;
  }
}
```

### 5.5 Mapa completo: 48 operações → API pública

Total = **união** dos snapshots amostrados (Q15). A instância que você chama pode não ter todas: quem faltar responde `404`, reerguido como `ZdkUnsupportedOperationError` (§5.2). Nenhuma operação é garantida por contrato estático.

**Conexões (2)**

| Operação | Método público |
|---|---|
| `GET /api/connections` | `connections.list()` |
| `GET /api/connections/{id}/templates` | `templates.list(connectionId)` |

**Não existe `GET /api/connections/{id}` no contrato.** Os dois métodos abaixo são helpers derivados de `list()`, resolvidos no cliente — declarados aqui para não se confundirem com operações da API:

| Helper | Comportamento |
|---|---|
| `connections.get(id)` | **estrito**: devolve a conexão com aquele `id`, seja qual for o `status`. `ZdkNotFoundError` se não existir. Nunca devolve outra |
| `connections.findUsable(preferredId?)` | devolve `preferredId` se ele estiver utilizável (`CONNECTED` ou `WHATSAPP_AUTH`); senão a primeira utilizável da lista; `ZdkNotFoundError` se nenhuma estiver. Sem `preferredId`, devolve a primeira utilizável |

`findUsable` é a lógica que a v0.7 escondia dentro de `get(id)` — devolver silenciosamente uma conexão diferente da pedida é surpresa quando o nome diz `get`. Separar os dois deixa a escolha explícita no call site: `get` quando o `id` importa, `findUsable` quando o que importa é conseguir enviar.

**Contatos (5)**

| Operação | Método público |
|---|---|
| `GET /api/contacts` | `contacts.list(params?)` |
| `GET /api/contacts/{id}` | `contacts.get(id)` |
| `POST /api/contacts/` | `contacts.create(data)` |
| `PUT /api/contacts/{id}` | `contacts.update(id, data)` |
| `PUT /api/contacts/{id}/tags` | `contacts.setTags(id, tagIds)` |

**Mensagens (5)**

| Operação | Método público |
|---|---|
| `GET /api/messages` | `messages.list(params?)` |
| `GET /api/messages/{id}` | `messages.get(id)` |
| `POST /api/send/{to}` | `messages.sendText(to, data)` |
| `POST /api/send/{type}/{to}` | `messages.sendMedia(to, type, data)` — multipart, arquivo |
| ↳ mesma operação, `application/json` | `messages.sendMediaByUrl(to, type, data)` — sem subir bytes pelo SDK (Q20) |
| `POST /api/messages/multiple/{to}` | `messages.sendMany(to, messages, files?)` — multipart quando há `files`, json quando não (Q20); serializa `messages` como JSON string (Q7) |

**Atendimentos (11)**

| Operação | Método público |
|---|---|
| `GET /api/tickets` | `tickets.list(params?)` |
| `GET /api/tickets/search-by-contact` | `tickets.searchByContact(contactNumber, params?)` |
| `GET /api/tickets/{id}` | `tickets.get(id)` |
| `PUT /api/tickets/{id}` | `tickets.update(id, data)` |
| `POST /api/tickets/{id}/transfer` | `tickets.transfer(id, data)` |
| `POST /api/tickets/{id}/resolve` | `tickets.resolve(id, data)` |
| `POST /api/tickets/{id}/send` | `tickets.sendText(id, data)` |
| `POST /api/tickets/{id}/send/{type}` | `tickets.sendMedia(id, type, data)` — multipart, arquivo |
| ↳ mesma operação, `application/json` | `tickets.sendMediaByUrl(id, type, data)` (Q20) |
| `POST /api/tickets/{id}/send-and-close` | `tickets.sendAndClose(id, data)` |
| `GET /api/tickets/{id}/info` | `tickets.info(id)` |
| `POST /api/tickets/{id}/send-template` | `tickets.sendTemplate(id, data)` |

**API Oficial (6)** — 3 destas têm tag dupla e já aparecem acima; contam uma vez no total de 48.

| Operação | Método público |
|---|---|
| `POST /api/send-template/{to}` | `templates.send(to, data)` |
| `POST /api/send-template-bulk` | `templates.sendBulk(data)` |
| `POST /api/upload-temp` | `storage.uploadTemp(file)` *(tag `API Oficial`, mas é armazenamento)* |
| `GET /api/connections/{id}/templates` | `templates.list(connectionId)` *(dupla)* |
| `GET /api/tickets/{id}/info` | `tickets.info(id)` *(dupla)* |
| `POST /api/tickets/{id}/send-template` | `tickets.sendTemplate(id, data)` *(dupla)* |

**Setores (6)**

| Operação | Método público |
|---|---|
| `GET /api/queues` | `queues.list(params?)` |
| `GET /api/queues/{id}` | `queues.get(id)` |
| `POST /api/queues` | `queues.create(data)` |
| `PUT /api/queues/{id}` | `queues.update(id, data)` |
| `POST /api/many-queues` | `queues.createMany(data)` |
| `GET /api/queue-users` | `queues.listWithUsers(params?)` |

**Tags (4)**

| Operação | Método público |
|---|---|
| `GET /api/tags` | `tags.list(params?)` |
| `GET /api/tags/{id}` | `tags.get(id)` |
| `POST /api/tags/` | `tags.create(data)` |
| `PUT /api/tags/{id}` | `tags.update(id, data)` |

**Usuários (2)**

| Operação | Método público |
|---|---|
| `GET /api/users` | `users.list(params?)` |
| `GET /api/users/{id}` | `users.get(id)` |

**Webhooks (5)** — ausentes no snapshot de `api-safiracosmeticos`, presentes no de `api-zapcontabil`. É diferença de versão implantada (Q15), então valem para qualquer operação desta lista; webhooks só é o caso onde a amostragem pegou.

| Operação | Método público |
|---|---|
| `GET /api/webhooks` | `webhooks.list(params?)` |
| `GET /api/webhooks/{id}` | `webhooks.get(id)` |
| `POST /api/webhooks` | `webhooks.create(data)` |
| `PUT /api/webhooks/{id}` | `webhooks.update(id, data)` |
| `DELETE /api/webhooks/{id}` | `webhooks.delete(id)` |

**Dashboard (3)**

| Operação | Método público |
|---|---|
| `GET /api/dashboard/tickets-por-atendente` | `dashboard.ticketsByAgent(params)` |
| `GET /api/dashboard/tickets-por-qualificacao` | `dashboard.ticketsByQualification(params)` |
| `GET /api/dashboard/tickets-agrupados` | `dashboard.ticketsGrouped(params)` |

**Métricas (1)**

| Operação | Método público |
|---|---|
| `GET /api/metrics/messages` | `metrics.messages(params?)` |

**Storage (2)**

| Operação | Método público |
|---|---|
| `GET /api/storage/signed-url/{filekey}` | `storage.signedUrl(fileKey, { expiresInSeconds? })` |
| `POST /api/upload-temp` | `storage.uploadTemp(file)` — tag `API Oficial` no swagger, mas a operação é de armazenamento e o retorno (`url`) serve a qualquer `headerParams` |

### 5.6 Validação de formato: baseUrl e token

`baseUrl` e `token` vêm do objeto de config ou, na ausência dele, de `ZAPPY_URL`/`ZAPPY_TOKEN` (decidido). As variáveis são lidas **só aqui**, em `core/config.ts`, e passam pelas mesmas validações — nenhum `import "dotenv/config"` dentro da lib: quem quiser `.env` carrega antes de instanciar.

A `baseUrl` **só** aceita host dentro de `zapcontabil.chat` ou `zapplataforma.chat`. Não é conveniência, é contenção de exfiltração: o token vai no header `Authorization` de toda requisição, então uma `baseUrl` sob controle de terceiro entrega a credencial do tenant.

```ts
// src/core/config.ts
const ALLOWED_APEX_DOMAINS = Object.freeze(["zapcontabil.chat", "zapplataforma.chat"] as const);

/** @throws {ZdkConfigError} quando a URL não é HTTPS ou está fora da allowlist. */
export function parseBaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ZdkConfigError(`baseUrl inválida: ${raw}`);
  }

  if (url.protocol !== "https:") throw new ZdkConfigError("baseUrl exige HTTPS");
  if (url.username || url.password) throw new ZdkConfigError("baseUrl não pode conter credenciais");
  if (url.port && url.port !== "443") throw new ZdkConfigError("baseUrl não pode declarar porta");
  if (url.search || url.hash) throw new ZdkConfigError("baseUrl não pode conter query nem fragmento");
  if (url.pathname !== "/") throw new ZdkConfigError("baseUrl não pode conter caminho");

  // `new URL` já normalizou caixa, %-escapes e IDN (punycode). Resta o ponto final de FQDN,
  // que precisa cair ANTES da comparação e também do valor retornado.
  const host = url.hostname.replace(/\.$/, "");

  const allowed = ALLOWED_APEX_DOMAINS.some(
    (apex) => host === apex || host.endsWith(`.${apex}`),
  );
  if (!allowed) throw new ZdkConfigError(`domínio não permitido: ${host}`);

  return `https://${host}`;
}
```

Retornar `https://${host}` em vez de `url.origin` não é estética: `new URL("https://api.zapcontabil.chat.").origin` **preserva o ponto final**, e todo path passaria a ser montado sobre um host não-canônico.

**Por que `new URL` e não regex.** Comportamento verificado no Node 18.20.6:

Vetores que a allowlist bloqueia — cada um casa com `/zapcontabil\.chat/` na string crua e nenhum é a Zappy:

| Entrada | Host resolvido | Vetor |
|---|---|---|
| `https://zapcontabil.chat.evil.com` | `zapcontabil.chat.evil.com` | sufixo falso |
| `https://evil.com/?x=zapcontabil.chat` | `evil.com` | query |
| `https://evil.com#zapcontabil.chat` | `evil.com` | fragmento |
| `https://zapcontabil.chat@evil.com` | `evil.com` | userinfo |
| `https://zapcontabil.chat%2f@evil.com` | `evil.com` | barra escapada no userinfo |
| `https://api.zаpcontabil.chat` (`а` cirílico **no apex**) | `api.xn--zpcontabil-zqi.chat` | homóglifo IDN |
| `https://api.zapcontabil.chаt` (`а` cirílico no TLD) | `api.zapcontabil.xn--cht-7cd` | homóglifo IDN |
| `http://api-x.zapcontabil.chat` | — | token em claro |
| `https://api-x.zapcontabil.chat:8443` | — | porta arbitrária |
| `https://api-x.zapcontabil.chat/prefixo` | — | confusão de prefixo de path |
| `https://127.0.0.1`, `https://[::1]` | — | literal IP (cai na checagem de domínio, sem caso especial) |

Formas **equivalentes** que passam depois de normalizadas — não são ataque, e é justamente o que a regex erraria (falso negativo):

| Entrada | Host normalizado | Nota |
|---|---|---|
| `https://API-SAFIRACOSMETICOS.ZAPPLATAFORMA.CHAT` | `api-safiracosmeticos.zapplataforma.chat` | caixa |
| `https://api-x.zapcontabil.chat.` | `api-x.zapcontabil.chat` | ponto final de FQDN |
| `https://аpi.zapcontabil.chat` (`а` cirílico **no subdomínio**) | `xn--pi-6kc.zapcontabil.chat` | apex íntegro — subdomínio de `zapcontabil.chat` só existe na zona DNS da Zappy. Cai depois na §5.6.1, que exige rótulo `api-<tenant>` |
| `https://evil.com%2ezapcontabil.chat` | `evil.com.zapcontabil.chat` | `%2e` vira `.`; segue sendo subdomínio da zona da Zappy. Cai depois na §5.6.1 |

Regra: `host === apex || host.endsWith("." + apex)` — nunca `includes`, nunca `startsWith`. Sem escape hatch: teste de integração usa `https://api-test.zapcontabil.chat` com `HttpClient` fake, então dev não precisa de exceção (KISS + zero superfície de bypass).

O mesmo `parseBaseUrl` valida o `--url` de `scripts/sync-api.ts` e a busca de swagger em `capabilities.ts`. Uma função, três chamadores (DRY).

#### 5.6.1 Host de API vs. host de painel

O header CORS de resposta da Zappy (`access-control-allow-origin: https://admin1.zapcontabil.chat`) mostra que painel e API convivem no mesmo apex. Apontar a `baseUrl` para o painel é o erro de configuração mais provável — e passaria pela allowlist de domínio.

Padrão de host de API confirmado nos dois domínios, com DNS resolvido:

| Host | IP | Papel |
|---|---|---|
| `api-zapcontabil.zapcontabil.chat` | 154.12.229.133 | API |
| `api-safiracosmeticos.zapplataforma.chat` | 207.244.236.85 | API |
| `admin1.zapcontabil.chat` | 207.244.229.222 | painel |

Dois apexes, mesmo formato `api-<tenant>` — e o mesmo sistema por trás: a separação de domínio é marketing e espaço para outros negócios, não produto diferente. Por isso uma allowlist cobre os dois, e um domínio novo é uma linha em `ALLOWED_APEX_DOMAINS`. Com isso a checagem é allowlist do primeiro rótulo, não deny-list de nomes de frontend:

```ts
/** Primeiro rótulo do host: `api-<tenant>` nos dois domínios; `api` puro tolerado. */
const API_LABEL_PATTERN = /^api(-[a-z0-9-]+)?$/;

const firstLabel = host.split(".")[0];
if (strictApiHost && !API_LABEL_PATTERN.test(firstLabel)) {
  throw new ZdkConfigError(
    `${host} não é host de API Zappy. Esperado api-<tenant>.${ALLOWED_APEX_DOMAINS.join(" ou api-<tenant>.")}`,
  );
}
```

**`strictApiHost` é desligável, default `true`** — mesma política de `strictTokenLength` (§5.6.2), pelo mesmo motivo. O padrão saiu de **duas amostras**, então rejeita `apiapenasteste.zapcontabil.chat` (sem hífen) e `api-apenas_teste.zapcontabil.chat` (underscore). Se a Zappy provisionar um tenant nesses formatos, o modo de falha é **rejeitar cliente legítimo**, bloqueado até sair release nosso.

Peso da decisão: a checagem de rótulo tem valor de segurança **zero** — o apex já é a fronteira, e terceiro não cria subdomínio na zona DNS da Zappy. Ela é guarda de ergonomia contra apontar para o painel. Guarda de ergonomia não deve ser insuperável, porque o custo do falso positivo cai inteiro sobre quem está certo. A allowlist de **domínio** e o `https:` obrigatório, esses sim, não têm escape hatch: são controle de segurança, protegem o token.

Allowlist em vez de deny-list porque agora há evidência do formato correto em ambos os domínios: bloqueia `admin1`, `app`, `www` e qualquer rótulo futuro de frontend sem precisar enumerá-los. `verify()` (§5.7) segue como prova final.

Consequência a registrar: **o apex passa a ser rejeitado** — `https://zapcontabil.chat` satisfaz a allowlist de domínio mas falha na de rótulo. Correto (apex não é host de API; o apex da `zapplataforma.chat` nem resolve em DNS), mas é mudança de comportamento em relação à checagem de domínio isolada, então tem teste próprio.

**Formato não é existência.** `https://api-apenasteste.zapcontabil.chat` passa toda a §5.6 e o host **não existe** (NXDOMAIN, verificado). É por construção: a validação de formato não tem como conhecer a lista de tenants, e tentar enumerá-la seria errado — tenant novo aparece a qualquer momento. Quem prova existência e credencial é `verify()` (§5.7), que devolve `ZdkNetworkError` nesse caso. Também vale lembrar que a `baseUrl` exige o esquema: `api-apenasteste.zapcontabil.chat` sem `https://` cai como URL inválida.

#### 5.6.2 Token

O token da Zappy tem **250 caracteres**. Formato não documentado no swagger — entra no registry como Q12.

```ts
const TOKEN_LENGTH = 250;
/** ASCII imprimível sem espaço: barra injeção de header via CR/LF e erro opaco do fetch. */
const TOKEN_PATTERN = /^[!-~]+$/;

export function parseToken(raw: string, strictLength = true): string {
  const token = raw.trim(); // newline de copy-paste é a falha real mais comum
  if (!token) throw new ZdkConfigError("token ausente");
  if (!TOKEN_PATTERN.test(token)) {
    throw new ZdkConfigError("token contém caractere inválido (espaço, CR/LF ou não-ASCII)");
  }
  if (strictLength && token.length !== TOKEN_LENGTH) {
    throw new ZdkConfigError(
      `token deve ter ${TOKEN_LENGTH} caracteres, recebeu ${token.length}`,
    );
  }
  return token;
}
```

Três decisões dentro disso:

- **`trim` antes de validar.** `ZAPPY_TOKEN` vindo de `.env` ou de `kubectl create secret` carrega `
` com frequência; sem `trim`, o erro aparece como 401 confuso três camadas adiante.
- **A mensagem nunca ecoa o token**, só o comprimento — mensagem de erro vaza para log, e log vaza.
- **`strictLength` é desligável.** Travar em 250 acopla a lib a um detalhe não documentado: se a Zappy rotacionar o formato, *todo consumidor* quebra e só um release conserta. O flag custa três linhas e evita indisponibilidade de terceiro por decisão nossa. Default `true`, como pedido.


### 5.7 Verificação de credenciais

Pergunta era: onde testar as credenciais contra `GET /api/connections`. Resposta: **não no construtor, e não em toda requisição.** Três camadas, cada uma com um trabalho.

| Camada | Custo | Quando usar |
|---|---|---|
| `new Zdk(config)` | zero I/O, síncrono | DI, teste, cold start de serverless. Valida só formato (§5.6) |
| `await Zdk.connect(config)` | 1 requisição | bootstrap de app — devolve instância já provada |
| `await zdk.verify()` | 1 requisição | health check explícito, idempotente, chamável quando quiser |

```ts
// caminho síncrono: falha de formato não precisa de rede
const zdk = new Zdk({ baseUrl, token });

// caminho verificado: valida formato, prova credencial e já entrega o que você ia pedir
const zdk = await Zdk.connect({ baseUrl, token });
```

**Por que não no construtor.** Construtor não pode ser `async`; forçar I/O nele significaria ou `Promise` no lugar de instância, ou validação em background com erro emergindo em lugar imprevisível. Ainda arrasta rede para dentro de todo teste e de todo cold start.

**Por que não em toda requisição.** "Sempre testar" ao pé da letra dobra o número de requisições e **queima metade do orçamento de rate limit** — 10000 por janela viram 5000 efetivos. E o orçamento é consumido **mesmo quando a requisição é rejeitada** (§5.8.4, observado), então nem a verificação que falha sai de graça. Custo permanente para detectar uma vez um token errado que já falharia com `401` na primeira chamada real, agora tipada como `ZdkAuthError`.

**Por que `GET /api/connections` é o probe certo:** é o único `GET` com **zero parâmetros** (verificado no contrato), e a própria descrição dele diz *"pode ser utilizado para selecionar conexões para enviar mensagens"*.

O detalhe que faz valer a pena: `verify()` **não devolve boolean**. Devolve o que o caller ia pedir logo depois de qualquer forma — todo envio precisa de `connectionFrom`.

```ts
export interface VerifyResult {
  readonly connections: readonly Connection[];
  readonly rateLimit: RateLimitSnapshot | null;
}

/**
 * Prova as credenciais contra `GET /api/connections`.
 * @throws {ZdkAuthError} 401 (não documentado nesta rota, Q13). `code` distingue a causa:
 *   `ERR_INVALID_API_KEY` = token errado (problema do consumidor);
 *   `ERR_NO_AUTH_HEADER_PRESENT` = header não foi enviado (bug do SDK).
 * @throws {ZdkConfigError} respondeu 2xx sem `connections`: host não é a API Zappy (§5.6.1).
 * @throws {ZdkNetworkError} host inalcançável (ex.: tenant que passa o formato mas não existe).
 */
async verify(): Promise<VerifyResult>
```

Não é health check desperdiçado, é a chamada de bootstrap que já era necessária. `verify()` reusa `connections.list()` — nenhuma rota nova, nenhum caminho paralelo (DRY).

`Zdk.connect()` é literalmente `new Zdk(config)` seguido de `verify()`, descartando o resultado. Zero lógica duplicada.

### 5.8 Resiliência: timeout, retry, e por que não circuit breaker

#### 5.8.1 Timeout — vale a pena, com ressalva

**Veredito: sim, sem trade-off relevante.** Hoje a lib não tem timeout nenhum: uma conexão pendurada trava o caller para sempre. É defeito, não escolha.

Default **10s**, mas 10s fixo global quebraria três casos que o contrato deixa ilimitados:

| Operação | Default | Motivo |
|---|---|---|
| padrão | `10_000` | pedido do produto |
| `POST /api/send-template-bulk` | `120_000` | Q10: `to` sem `maxItems`, processamento por número |
| `POST /api/upload-temp` | `60_000` | upload multipart de mídia |
| `POST /api/send/{type}/{to}`, `POST /api/tickets/{id}/send/{type}`, `POST /api/tickets/{id}/send-and-close` | `60_000` | idem, corpo binário |
| listagens com `pageSize` alto | `10_000` + override por chamada | Q9: `pageSize` sem limite |

Precedência: `opção da chamada` > `default da operação` > `config global` > `10s`. O timeout é **por tentativa**, não pelo total (§5.8.3 trata o total).

```ts
const zdk = new Zdk({ baseUrl, token, timeoutMs: 15_000 });
await zdk.contacts.list({ pageSize: 50_000 }, { timeoutMs: 180_000 });
```

Implementação: `AbortSignal.timeout(ms)` composto com o signal do consumidor via `AbortSignal.any([...])`, ambos nativos no Node 20. Uma ressalva honesta:

- O timeout é **total da tentativa**, incluindo upload do corpo — `fetch` nativo não expõe connect-timeout separado sem trocar o dispatcher do undici. Consequência: upload lento de arquivo grande estoura o mesmo relógio de um servidor travado. Aceito em nome do KISS; documentado, com os overlays de 60s acima como mitigação.

#### 5.8.2 Retry com backoff — vale a pena, mas restrito

**Veredito: sim, com política por operação. Retry cego em `POST` seria dano real, não bug de conveniência.**

O contrato não tem `Idempotency-Key` (Q11). Então repetir `POST /api/send/{to}` cuja resposta não chegou pode entregar **duas mensagens de WhatsApp ao cliente final** e, em template de API Oficial, gerar **duas conversas cobradas pela Meta**. O custo do falso-positivo de retry é externo, visível e cobrado — assimetria que decide o desenho.

Pior em bulk: `send-template-bulk` responde 200 com falha parcial (Q10). Um retry por timeout re-envia para **todos** os números, inclusive os que já tiveram `status: "success"`.

Parâmetros de backoff:

```ts
export const DEFAULT_RETRY = Object.freeze({
  attempts: 3,              // 1 tentativa + 2 retries
  baseDelayMs: 250,
  maxDelayMs: 8_000,
  jitter: "full",           // delay = random(0, min(max, base * 2^n))
  maxRetryAfterMs: 30_000,  // Retry-After acima disso: falha rápido em vez de dormir
  retryOnTimeout: false,    // ambíguo por natureza — opt-in
  retryOnRateLimit: true,   // `safe` e `guarded`: 429 = rejeitado antes do processamento (RFC 9110)
  retryUnsafeOnRateLimit: false, // `unsafe`: opt-in, ver §5.8.4
} as const);
```

**Full jitter** (não jitter fixo nem "equal"): com vários workers do mesmo tenant, delay determinístico sincroniza as retentativas e produz exatamente o pico que se quer evitar na Zappy.

#### 5.8.3 A tabela que sustenta tudo

Segurança de retry não se decide por método HTTP, e sim por *o que já pode ter acontecido no servidor*. Classificação por operação, derivada de `OperationKey` (conjunto fechado → auditável e testável):

| Classe | Operações | O que é |
|---|---|---|
| `safe` | as 24 `GET`, todos os `PUT`, `DELETE /api/webhooks/{id}` | idempotente por semântica |
| `guarded` | `POST /api/tickets/{id}/transfer`, `POST /api/upload-temp` | repetir converge ao mesmo estado (ou gera arquivo temporário órfão) |
| `unsafe` | os 9 `POST` de envio, `POST /api/tickets/{id}/resolve`, `POST /api/contacts/`, `POST /api/tags/`, `POST /api/queues`, `POST /api/many-queues`, `POST /api/webhooks` | efeito externo ou criação duplicada |

`resolve` é `unsafe` por um motivo específico: com `feedbackOption: "send-end-message"` ele **dispara mensagem ao contato**.

| Falha | `safe` | `guarded` | `unsafe` |
|---|---|---|---|
| DNS (`ENOTFOUND`, `EAI_AGAIN`) e `ECONNREFUSED` | retry | retry | **retry** — provadamente pré-envio, os bytes não saíram |
| `ECONNRESET` / socket derrubado | retry | retry | **não** — ambíguo, pode ter sido no meio da resposta |
| Timeout da tentativa | retry | não | **não** |
| `429` | retry | retry | **não** por default (`retryUnsafeOnRateLimit`) |
| `503` | retry | retry | não |
| `500`, `502`, `504` | retry | não | não |
| `400`, `401`, `403`, `404`, `409` | não | não | não |
| `ZdkAbortError` (signal do consumidor) | não | não | não |

Duas armadilhas de implementação que a política obriga a tratar:

- **`fetch` nativo esconde o código do erro.** Falha de transporte vem como `TypeError: fetch failed`; o código real está em `error.cause.code` (undici). Sem ler `cause`, DNS e `ECONNRESET` ficam indistinguíveis — e a linha 1 da tabela desaba na linha 2. Classificador lê `cause.code` e, na dúvida, **trata como ambíguo**.
- **Corpo não-rebobinável.** Se o body for `ReadableStream`, a segunda tentativa manda corpo vazio. O `RequestBuilder` marca a requisição como não-retryável quando o corpo não é `string`/`Blob`/`Buffer`/`FormData` com partes em memória. Falha silenciosa se esquecido.

**O que fazer quando o retry é proibido.** Sem `Idempotency-Key` (Q11), uma falha ambígua num envio deixa o consumidor sem saber se a mensagem saiu. A lib não pode adivinhar — mas a API dá como descobrir: `GET /api/messages` aceita `contactId`, `ticketId`, `dateFrom` e `dateTo`. O padrão recomendado, documentado em `docs/RECIPES.md`, é reconciliar em vez de repetir:

```ts
const startedAt = new Date().toISOString();
try {
  await zdk.messages.sendText(to, { body, connectionFrom });
} catch (error) {
  if (error instanceof ZdkTimeoutError || error instanceof ZdkNetworkError) {
    // Ambíguo: pode ter saído. Conferir antes de reenviar.
    const { messages } = await zdk.messages.list({ contactId, dateFrom: startedAt });
    const alreadySent = messages.some((m) => m.fromMe && m.body === body);
    if (!alreadySent) await zdk.messages.sendText(to, { body, connectionFrom });
  } else throw error;
}
```

Fica como receita, não como comportamento automático: só o consumidor sabe o que conta como "mesma mensagem" no domínio dele, e errar essa comparação dentro da lib duplicaria mensagem exatamente como o retry cego que a §5.8.3 evita.

**Custo em wall clock.** Com `attempts: 3` e timeout de 10s, o pior caso de um `GET` é `10 + ~0.25 + 10 + ~2 + 10 ≈ 32s`. Isso quebra handler serverless de 30s que hoje falharia em 10s. Mitigação: `retry.deadlineMs` limita o total. **Default `null`** (decidido): o pior caso fica explícito na doc em vez de escondido num teto implícito, e o README documenta o cálculo `timeout × attempts + Σbackoff` em destaque.

Ganchos (DIP/OCP, sem estado no core): `onRetry({ attempt, delayMs, error, operation })` e `shouldRetry(context): boolean | undefined` — `undefined` delega ao default. É por aí que o consumidor liga métrica, log ou breaker próprio.

#### 5.8.4 Rate limit: orçamento vem do servidor

A Zappy expõe o orçamento em **toda** resposta. Nomes de header e `x-powered-by: Express` sugerem `express-rate-limit` com legacy headers:

```
x-ratelimit-limit: 10000
x-ratelimit-remaining: 7668
x-ratelimit-reset: 1789060936
date: Thu, 10 Sep 2026 17:22:14 GMT
```

Isso é melhor do que reagir a `429`: dá para **não chegar lá**. E é informação por resposta, sem estado acumulado — exatamente o oposto do que um breaker exigiria.

```ts
export interface RateLimitSnapshot {
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: Date;
  readonly observedAt: Date;
}
```

Exposto como `zdk.rateLimit` (última leitura, `readonly`), no retorno de `verify()`, e pelo hook `onRateLimit(snapshot)`.

**`x-ratelimit-reset` é epoch absoluto do servidor, não delta.** Na amostra, `reset − date` = 2s (janela estava fechando; 2332 de 10000 consumidos). Duas consequências:

- Calcular espera com `Date.now()` importa o **desvio de relógio do cliente** para dentro da lógica de retry. O `date` da resposta é a hora do servidor, então `esperaMs = (reset − dateDaResposta) × 1000`. Skew eliminado sem NTP.
- Uma amostra não revela a **duração da janela** (pode ser 15min ou 1h). Só o instante do fim. A lib nunca assume duração — só usa `resetAt` absoluto.

Modos, opt-in:

```ts
rateLimit: {
  mode: "observe",  // default: só lê, expõe e chama o hook. A lib nunca dorme sozinha.
  reserve: 0,       // em mode "throttle": pausa até resetAt quando remaining <= reserve
}
```

`observe` é default porque latência escondida em SDK é pior que erro visível: quem chama não entende por que a requisição levou 8 minutos. `throttle` existe para job em lote, onde esperar é melhor que tomar `429` — e aí a decisão é de quem escreveu o job.

Fallback de `429` (Q8): usa `Retry-After` quando houver; sem ele, deriva de `x-ratelimit-reset − date`; sem os dois, cai no backoff exponencial. Sempre limitado por `maxRetryAfterMs`. O parser lê **as duas grafias** — `x-ratelimit-*` (legacy, o que a Zappy manda hoje) e `ratelimit-*` (draft RFC), para sobreviver a uma troca de versão do limitador.

**O que foi observado.** Duas requisições sem credencial a `GET /api/connections` (uma sem header `Authorization`, uma com Bearer inválido), 1s de intervalo:

```
HTTP/1.1 401 Unauthorized          HTTP/1.1 401 Unauthorized
X-RateLimit-Limit: 10000           X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999        X-RateLimit-Remaining: 9998
X-RateLimit-Reset: 1789069746      X-RateLimit-Reset: 1789069746
{"error":"ERR_NO_AUTH_HEADER_PRESENT","errorData":{}}
                                   {"error":"ERR_INVALID_API_KEY","errorData":{}}
```

Três fatos, não inferências:

1. **O limitador roda antes da autenticação.** Os headers vêm num `401`, logo o limitador é middleware global, montado antes das rotas. O `429` *dele* precede qualquer handler — nada foi enviado.
2. **Requisição rejeitada também consome orçamento** (9999 → 9998 em dois `401`). Chamada que falha custa igual. Isso reforça §5.7: verificar credencial a cada requisição queima metade do teto mesmo quando a verificação falha.
3. **`reset` é instante compartilhado, não "início da janela + `windowMs`".** A primeira requisição pegou janela virgem (`remaining: 9999`) e ainda assim faltavam **31s** para o reset; entre a amostra do produto (2s restantes) e a minha, os dois `reset` distam 8810s, que não é múltiplo de 60. Conclusão: `windowMs` **não é derivável**, e proximidade do reset não diz nada sobre orçamento.

Daí a regra da §5.8.4 se sustentar: usar `resetAt` absoluto e **nunca** inferir duração de janela. Se for 15min ou 1h, o código é o mesmo. Só a frase do `docs/RESILIENCE.md` fica sem o número.

**Por que `429` ainda não sofre retry em operação `unsafe` por default.** A dúvida encolheu, mas não fechou. Está provado que **existe** um limitador global antes da autenticação, e o `429` dele é seguro para repetir. O que não está descartado é um **segundo** limitador dentro do fluxo de envio — por número de destino, por conexão — respondendo `429` depois de já ter criado o atendimento e despachado a mensagem. Num produto de mensageria isso não é exótico, e nenhuma evidência que eu consiga coletar sem credencial distingue os dois.

**Não vou testar isso empiricamente.** Provocar o `429` exigiria esgotar 10000 requisições contra a API de produção do cliente — negação de serviço, não experimento.

Custos assimétricos decidem o default: `false` custa um erro que o consumidor trata com o contexto dele; `true` errado custa mensagem duplicada no WhatsApp do cliente final e conversa cobrada duas vezes pela Meta. Fica `retryUnsafeOnRateLimit: false`.

**Caminho concreto para virar `true` com segurança**, sem depender de resposta de ninguém: o corpo de erro da Zappy é `{"error":"ERR_*","errorData":{}}` (Q17). Quando um `429` real acontecer em produção, o hook `onRateLimit`/`onRetry` registra o código dele. Com o código do limitador global identificado, a regra passa a ser *retry de `unsafe` apenas quando o `429` traz aquele código* — e um `429` de origem desconhecida continua sem retry. Allowlist por código, conservadora por construção, e verificável.

#### 5.8.5 Circuit breaker — não vale a pena na v1

**Veredito: fora. Entrego o encaixe, não a implementação.**

A favor: durante indisponibilidade da Zappy, abrir o circuito corta carga inútil e devolve erro na hora.

Contra, e é o que pesa:

1. **Não paga onde essa lib mais roda.** Breaker é estado acumulado em processo. Em Lambda/Vercel/Cloud Run cada invocação é processo novo — o circuito nunca sai de fechado. Custo de config e complexidade com ganho zero justamente no cenário mais comum de integração Node.
2. **Cria indisponibilidade que a API não teve.** Escopo é decisão sem resposta boa: por host, o `500` de um endpoint bloqueia os outros 47 saudáveis; por operação, a janela quase nunca enche e o breaker não dispara. Ambos os extremos são ruins.
3. **Torna a falha não-determinística.** Mesmo código, mesma entrada, resultado diferente conforme estado escondido. Custo de suporte e de teste alto para uma lib — é a antítese do que se quer depurar em produção do cliente.
4. **O servidor já informa o orçamento exato** (§5.8.4). Breaker é heurística: conta falhas para *adivinhar* que o servidor está sobrecarregado. Com `x-ratelimit-remaining` em toda resposta, adivinhar é desnecessário — há o número. Somado a `attempts` finito, full jitter, `Retry-After` honrado e `unsafe` sem retry em 5 das 8 classes de falha, a defesa já está de pé sem nenhum estado escondido.
5. **Quem precisa, precisa acima da lib.** Um consumidor de alto volume tem breaker no orquestrador/fila, onde ele vê o sistema inteiro. Um breaker dentro do SDK compete com esse, e dois breakers em série são mais difíceis de sintonizar que um.

Substituto de custo quase nulo, que entra na v1:

- `maxConcurrent` (semáforo, **default ilimitado**, decidido) — teto opcional de pressão simultânea, sem estado entre chamadas. Ilimitado por default para não mudar throughput de quem já usa a lib em lote; documentado como a primeira coisa a ajustar sob carga.
- `Retry-After` honrado com `maxRetryAfterMs`.
- `onRetry` + `shouldRetry` + `HttpClient` injetável: `opossum` ou breaker próprio se acopla **sem** mudança quebrada. Se a telemetria mostrar necessidade, breaker entra numa v1.x por trás dessas costuras — OCP na prática.

### 5.9 Princípios aplicados

| Princípio | Onde |
|---|---|
| **SRP** | `HttpClient` só transporta · `RequestBuilder` só monta requisição · `ErrorMapper` só classifica · `Resource` só compõe |
| **OCP** | novo recurso = nova classe em `resources/` + linha no facade; core intocado. Breaker futuro entra por `HttpClient`/`shouldRetry`/`onRetry`, sem quebra (§5.8.5) |
| **LSP** | qualquer `HttpClient` substitui `FetchHttpClient` (é o que os testes injetam) |
| **ISP** | interfaces mínimas: `HttpClient`, `CapabilityRegistry`, `Logger` |
| **DIP** | `Zdk` recebe dependências por construtor; nada de `new` de infra dentro de recurso; `random` e `sleep` injetados no backoff |
| **DRY** | paginação, query string, retry e tratamento de erro existem uma vez, no core — hoje o mesmo `try/catch` está copiado 14 vezes; `parseBaseUrl` serve config, `sync:api` e `capabilities` |
| **KISS** | um método por operação; sem query builder fluente; um relógio de timeout, não connect+read separados |
| **YAGNI** | sem circuit breaker (§5.8.5), sem cache, sem browser build; retry entra restrito, não genérico |
| **Imutabilidade** | `readonly` em toda property pública, config e `DEFAULT_RETRY` congelados, constantes `as const`, retornos `readonly`, zero mutação de argumento; `backoff.ts` é função pura |
| **OO** | facade + recursos como classes, base abstrata, composição sobre herança no core |

## 6. Code Style

Prettier + ESLint existentes (aspas duplas, 2 espaços, ponto e vírgula, LF). Padrão de um recurso:

```ts
import { Resource } from "./resource";
import type { ApiBody, ApiResponse } from "../core/operation";
import type { MediaType, Ticket } from "../schema/types";

/** Operações de atendimento (`Atendimentos`). */
export class Tickets extends Resource {
  /** Detalha um atendimento. @throws {ZdkNotFoundError} quando o id não existe. */
  async get(id: number): Promise<Ticket> {
    return this.client.request("GET /api/tickets/{id}", { path: { id } });
  }

  /** Envia mídia num atendimento existente. */
  async sendMedia(
    id: number,
    type: Exclude<MediaType, "text">,
    data: ApiBody<"POST /api/tickets/{id}/send/{type}">,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/send/{type}">> {
    return this.client.request("POST /api/tickets/{id}/send/{type}", {
      path: { id, type },
      body: data,
      contentType: "multipart/form-data",
    });
  }
}
```

Convenções: classes `PascalCase` sem prefixo `I` em interface (`Ticket`, não `ITicket`); recursos no plural (`tickets`); métodos `list`/`get`/`create`/`update`/`delete` + verbos de domínio (`transfer`, `resolve`); TSDoc em português em todo membro público, com `@throws`; sem `any` (`@typescript-eslint/no-explicit-any` como error); sem `console.*` em `src/` (regra de lint).

## 7. Testing Strategy

Vitest, tudo em `tests/` na raiz. Nenhum teste toca a rede — `tests/fixtures/swagger.json` é o snapshot real já commitado.

| Camada | Diretório | Cobre |
|---|---|---|
| Unit | `tests/unit/` | config, request-builder (path/query/multipart), error-mapper por status **e por código `ERR_*`** (com `errorData` preservado em `payload`), pagination, capabilities com swagger fake |
| Integration | `tests/integration/` | um arquivo por recurso: assere método/URL/headers/body enviados ao `HttpClient` fake e o retorno desserializado |
| Contract | `tests/contract/` | roda contra **os dois** snapshots: toda `OperationKey` usada em `resources/` existe na união; todo path de cada snapshot tem método correspondente (impede cobertura parcial silenciosa); toda operação tem `retryClass` e timeout em `operation-metadata.ts`; cada quirk do `API_QUIRKS` ainda se aplica |
| Types | `tests/types/` | `operation.test-d.ts` com as asserções já compiladas no spike: `"PUT /api/connections"` rejeitado, `"DELETE /api/webhooks/{id}"` aceito, body de `POST /api/send/{to}` = `SendMessage`, os dois content-types de `POST /api/send/{type}/{to}` resolvendo para schemas distintos, `WHATSAPP_AUTH` aceito em `ConnectionStatus`, e Q18 (`ApiResponse<"GET /api/connections">` sem `connections`) |
| Segurança | `tests/unit/config.test.ts` | as duas tabelas de §5.6 como `test.each`: 11 vetores rejeitados com `ZdkConfigError`, 4 formas equivalentes aceitas e normalizadas, os dois hosts reais de API aceitos (`api-zapcontabil.zapcontabil.chat`, `api-safiracosmeticos.zapplataforma.chat`); rótulos de frontend (`admin1`, `app`, `www`) **e o apex** rejeitados; tenant inexistente com formato válido **aceito** no formato; host sem esquema rejeitado; `strictApiHost: false` aceita rótulo fora do padrão mas **nunca** domínio fora da allowlist |
| Token | `tests/unit/token.test.ts` | 250 chars aceito; 249/251 rejeitados; `\n` nas pontas tolerado por `trim`; CR/LF e não-ASCII no meio rejeitados; **mensagem de erro não contém o token**; `strictTokenLength: false` aceita outro comprimento |
| Conexões | `tests/integration/connections.test.ts` | `get(id)` estrito vs `findUsable(preferredId?)` no mesmo payload: pedida `DISCONNECTED` + outra `CONNECTED`; `WHATSAPP_AUTH` conta como utilizável; lista vazia → `ZdkNotFoundError` nos dois |
| Credenciais | `tests/integration/verify.test.ts` | `verify()` devolve `connections` + `rateLimit`; `401` → `ZdkAuthError` com `code` `ERR_INVALID_API_KEY` vs `ERR_NO_AUTH_HEADER_PRESENT`; `200` sem `connections` → `ZdkConfigError`; `Zdk.connect()` faz **exatamente 1** requisição; `new Zdk()` faz **zero** |
| Rate limit | `tests/unit/rate-limit.test.ts` | parse de `x-ratelimit-*` e de `ratelimit-*`; header ausente → `null`; espera derivada de `reset − date` **ignora relógio local** (teste com `Date.now` deslocado em 1h); `mode: "observe"` nunca dorme; `throttle` pausa em `remaining <= reserve` |
| Resiliência | `tests/unit/retry.test.ts`, `backoff.test.ts` | matriz completa de §5.8.3 (falha × classe) como `test.each`; `Retry-After` em segundos e em HTTP-date; `maxRetryAfterMs` excedido falha rápido; corpo `ReadableStream` não sofre retry; `AbortError` do consumidor nunca sofre retry; contagem de `attempts` no erro |

`vi.useFakeTimers()` em todo teste de backoff — a suíte não dorme. Determinismo do jitter por injeção de `random: () => number` (DIP; `Math.random` só no default).

Coverage v8, thresholds **90%** de lines/functions/branches em `src/core/` e `src/resources/`; `src/generated/` excluído. Regressão vira teste primeiro (o bug `dateToo` ganha teste em `tests/unit/request-builder.test.ts` antes da correção).

## 8. Boundaries

**Sempre**
- `npm run verify` verde antes de commit.
- Toda operação nova entra com teste de integração + linha no mapa da §5.5.
- Todo desvio do contrato entra em `API_QUIRKS` com id, motivo e teste de contrato.
- Regerar tipos por `npm run sync:api` e commitar `src/generated/` junto do diff que depende dele.
- TSDoc em português em membro público novo.

**Perguntar antes**
- Adicionar dependência de runtime (meta é zero).
- Mudar assinatura pública já publicada na v1.
- Trocar o swagger canônico do `sync:api`.
- Alterar thresholds de coverage.
- Mudar a classe de retry de qualquer operação (é decisão de risco externo, não técnica).
- Ampliar a allowlist de domínios ou a deny-list de rótulos de frontend.
- Mudar o comprimento esperado do token, o padrão de rótulo de API, ou o default de `strictTokenLength`/`strictApiHost`.
- Mudar `rateLimit.mode` default para `throttle`.
- Publicar no npm / criar tag de release.
- Expor operação **não** presente no swagger.

**Nunca**
- Editar `src/generated/` à mão.
- Commitar token, URL de tenant privado ou `.env`.
- `console.*` ou `process.env` lido dentro de `src/` fora de `core/config.ts`.
- `any` sem comentário justificando.
- Remover ou marcar `.skip` em teste que falha, sem aprovação.
- `import "dotenv/config"` (ou qualquer efeito colateral) no caminho de import da lib.
- Bater na API real durante teste.
- Validar `baseUrl` por regex, `includes` ou `startsWith` — só `new URL` + `endsWith("." + apex)` (§5.6).
- Aceitar `baseUrl` fora de `zapcontabil.chat` / `zapplataforma.chat`, ou não-HTTPS, mesmo em teste ou dev.
- Marcar operação como `safe`/`guarded` sem entrada correspondente em `operation-metadata.ts` e teste na matriz.
- Retry de operação `unsafe` em timeout ou `5xx` por default.
- Incluir token (inteiro ou parcial) em mensagem de erro, log ou stack.
- I/O de rede no construtor de `Zdk` ou de qualquer recurso.
- Verificar credencial fora de `verify()` — nada de probe implícito por requisição.
- Calcular espera de rate limit com `Date.now()` em vez do header `date`.
- `sleep` real em teste de backoff.

## 9. Success Criteria

1. `npm run verify` passa limpo.
2. `tests/contract/` prova **48/48** operações mapeadas e nenhum método órfão.
3. Zero dependência em `dependencies` do `package.json`.
4. `grep -r "axios\|form-data" src/` não retorna nada.
5. `ConnectionStatus` aceita `"WHATSAPP_AUTH"`; `tests/types/` prova.
6. `zdk.messages.list({ dateTo })` gera `dateTo=` na query (bug `dateToo` corrigido, com teste).
7. Nenhum método público retorna união com tipo de erro; erro sempre por `throw` de `ZdkError`.
8. Coverage ≥ 90% em `core/` e `resources/`.
9. `npm run sync:api` com os dois `--url` regenera a união e imprime a divergência (5 ops só em zapcontabil, `ticketStrategy` só em zapplataforma).
10. `README.md`, `docs/MIGRATION.md`, `CHANGELOG.md` e typedoc refletem as 48 operações.
11. `npm pack` → import CJS e ESM funcionam com tipos resolvidos.
12. `zdk.supports("POST /api/send-template-bulk")` responde correto contra swagger fake.
13. Os 11 vetores de §5.6 lançam `ZdkConfigError`; as formas equivalentes são aceitas e `parseBaseUrl("https://api-x.zapcontabil.chat.")` retorna `https://api-x.zapcontabil.chat` (sem ponto final). `admin1.zapcontabil.chat`, `app.zapplataforma.chat` e o apex `zapcontabil.chat` lançam `ZdkConfigError` por §5.6.1.
14. `operation-metadata.ts` classifica **48/48** operações da união com `retryClass` e timeout; teste de contrato falha se uma ficar sem classe.
15. `404` num path que existe na união vira `ZdkUnsupportedOperationError` com o motivo (versão da instância), e apenas nesse caso o swagger é buscado — provado por contador no `HttpClient` fake: chamada bem-sucedida faz **1** requisição, chamada com `404` faz **2**.
16. `retryUnsafeOnRateLimit` default `false`: `429` em `POST /api/send/{to}` **não** é repetido; com o flag `true`, é.
17. Matriz de §5.8.3 coberta por `test.each` — nenhum retry de operação `unsafe` em timeout ou `5xx`.
18. Timeout default efetivo é 10s e os overrides por operação valem; provado com fake timers.
19. Erro após esgotar tentativas expõe `attempts === 3` e `retryable === true`.
20. `grep -rn "circuit\|breaker" src/` não retorna nada (decisão de §5.8.5 é verificável).
21. Token de 250 chars passa; 249 e 251 lançam `ZdkConfigError`; nenhuma mensagem de erro da suíte contém o valor do token (asserção explícita).
22. Host `admin1.zapcontabil.chat` é rejeitado por §5.6.1 apesar de estar na allowlist de domínio.
23. `new Zdk(cfg)` faz zero requisições; `Zdk.connect(cfg)` faz exatamente uma (`GET /api/connections`); provado contra `HttpClient` fake com contador.
24. `verify()` devolve `connections` e `rateLimit`; `401` vira `ZdkAuthError`; `2xx` sem `connections` vira `ZdkConfigError`.
25. `zdk.rateLimit` reflete `x-ratelimit-*` da última resposta; espera de `429` calculada contra o header `date` sobrevive a relógio local errado em 1h.
26. `ZdkHttpError.code` traz o `ERR_*` do corpo e `payload` preserva `errorData` (Q17); `verify()` distingue `ERR_INVALID_API_KEY` de `ERR_NO_AUTH_HEADER_PRESENT`.
27. A receita de reconciliação de §5.8.3 tem teste: falha ambígua + `messages.list` mostrando a mensagem já enviada resulta em **nenhum** reenvio.
28. `connections.get(id)` **nunca** devolve conexão de `id` diferente (teste com a conexão pedida `DISCONNECTED` e outra `CONNECTED` na lista: devolve a pedida); `findUsable(id)` nesse mesmo cenário devolve a `CONNECTED`.
29. `engines.node` é `>=20`, `.tool-versions` acompanha, e o build não referencia polyfill de `AbortSignal.any`.
30. `tests/types/operation.test-d.ts` passa em `npm run test:types`, incluindo a rejeição de `"PUT /api/connections"` (o bug que o `Extract` cru deixava passar).
31. `messages.sendMediaByUrl` e `tickets.sendMediaByUrl` existem e enviam `application/json` com `url` — capacidade ausente na v0.7 (Q20).
32. `connections.list()` devolve `Connection[]` a partir de `{connections:[...]}` apesar do contrato declarar objeto único (Q18).
33. Config resolve `ZAPPY_URL`/`ZAPPY_TOKEN` quando o objeto não traz os valores, e as variáveis passam por `parseBaseUrl`/`parseToken`; `grep -rn "dotenv" src/` não retorna nada.

## 10. Plano de documentação

| Arquivo | Conteúdo |
|---|---|
| `README.md` | reescrito: instalação, config por objeto, quickstart, tabela dos 12 recursos, seção de erros tipados, seção API Oficial (template + janela 24h), `supports()`, link pro typedoc |
| `docs/MIGRATION.md` | v0.7 → v1: construtor, fim do `T \| IError`, renomes (`ITicket`→`Ticket`, `messages.send`→`sendText`/`sendMedia`), tabela antes/depois por método |
| `docs/API-DIVERGENCE.md` | gerado por `sync:api`: instâncias amostradas, contagens, operações e campos exclusivos de cada uma. Explica por que um método pode dar `ZdkUnsupportedOperationError` |
| `docs/API-QUIRKS.md` | os 15 desvios de contrato, **incluindo a divergência entre tenants (Q15) e a tabela de operações não-universais**, por que existem, como o ZDK corrige, o que muda quando a Zappy corrigir |
| `docs/AUTH.md` | allowlist de domínio e por quê, formato do token, `new Zdk` vs `Zdk.connect` vs `verify()`, custo de rate limit de verificar demais |
| `docs/RESILIENCE.md` | timeout (defaults e overrides), backoff, **a matriz de §5.8.3 na íntegra**, cálculo de pior caso em wall clock, rate limit (`zdk.rateLimit`, `onRateLimit`, `observe` vs `throttle`), por que não há circuit breaker e como plugar um via `HttpClient`/`onRetry` |
| `docs/RECIPES.md` | envio de texto/mídia, template com header de imagem via `storage.uploadTemp`, bulk com reprocesso por `results[].status`, **reconciliação após falha ambígua de envio** (§5.8.3), checar janela com `tickets.info`, paginar, webhook CRUD, dashboard |
| `CHANGELOG.md` | novo, Keep a Changelog; `1.0.0` com BREAKING CHANGES |
| `CONTRIBUTING.md` | fluxo `sync:api`, como adicionar recurso, política de quirk |
| `docs/` (typedoc) | regerado; `typedoc.json` corrigido (hoje aponta pra `./src/types/index.ts`, que não existe) |

## 11. Decisões registradas

Todas as questões da Fase 1 estão fechadas. Ficam aqui com o motivo, porque decisão sem motivo volta como dúvida.

**Resolvidas por evidência coletada:**

- **Divergência de contrato é por versão implantada**, não por tenant nem por domínio: `zapcontabil.chat` e `zapplataforma.chat` são o mesmo sistema, separados por marketing e para abrir espaço a outros negócios. Consequência: flag estático `universal` descartado; disponibilidade sai do swagger da própria instância, em runtime (§5.2), e os tipos saem da união dos snapshots (§5.1.2).
- **O limitador de rate limit roda antes da autenticação** — headers presentes num `401`, e o contador cai mesmo em requisição rejeitada (§5.8.4). O `429` dele é seguro para repetir.
- **Duração da janela de rate limit não é derivável** e não é necessária: `reset` é instante compartilhado, não "início da janela + `windowMs`" (§5.8.4). A lib usa `resetAt` absoluto.
- **Host de API é `api-<tenant>.<apex>`** nos dois domínios (DNS confirmado) → allowlist de rótulo com escape `strictApiHost` (§5.6.1).
- **Corpo de erro traz `ERR_*` + `errorData`** não documentado (Q17) → `ZdkHttpError.code` e `.payload` (§5.4).

**Decididas pelo produto:**

| Questão | Decisão | Onde |
|---|---|---|
| `upload-temp` | `storage.uploadTemp()`, junto de `storage.signedUrl` | §5.5 |
| Fallback de conexão | mantém `connections.get(id)` **estrito** e adiciona `connections.findUsable(preferredId?)` | §5.5 |
| `ZAPPY_URL`/`ZAPPY_TOKEN` | seguem como fallback, lidos só em `core/config.ts`, sem `dotenv` embutido | §5.6 |
| `maxConcurrent` | ilimitado por default, documentado | §5.8.5 |
| `retry.deadlineMs` | `null` — pior caso explícito na doc, sem teto implícito | §5.8.3 |
| Node mínimo | **20** | §2, §5.8.1 |
| Token 250 chars | vale nos dois domínios → `strictTokenLength` global | §5.6.2 |
| Codegen | baseline commitado + `sync:api` multi-instância | §5.1.2 |
| Erros | `throw` de hierarquia tipada, sem `T \| IError` | §5.4 |
| Escopo | 48 operações da união | §5.5 |
| Compatibilidade | break limpo v1.0.0 + `docs/MIGRATION.md` | §10 |

**Deliberadamente fora, com motivo:**

| Item | Motivo |
|---|---|
| Circuit breaker | não paga em serverless, cria indisponibilidade que a API não teve, e o servidor já informa o orçamento exato (§5.8.5) |
| Retry de `unsafe` em timeout/`5xx` | ambíguo; custo do erro é mensagem duplicada e conversa cobrada duas vezes (§5.8.3) |
| `retryUnsafeOnRateLimit` por default | limitador global está provado, mas um segundo limitador no fluxo de envio não está descartado; flag existe e o caminho de fechamento é allowlist por código de erro (§5.8.4) |
| Dedup local de envio | estado local não sabe se o servidor processou; no lugar dele, a receita de reconciliação (§5.8.3) |
| `Idempotency-Key` | não existe na API e não é testável sem enviar mensagem real duas vezes |
| Fachada genérica por instância (`new Zdk<MinhaInstancia>()`) | compraria erro de compilação onde já há erro de runtime preciso, ao custo de genérico em 12 recursos; e não elimina o drift, só o move — tipo gerado localmente também envelhece a cada deploy da instância (§5.1.1) |

**Aberto para a Fase 2, não bloqueia:** quais hosts adicionais amostrar no `sync:api`. Hoje dois, e o próprio relatório informa se um terceiro contribui algo (§5.1.2) — então isso se resolve quando houver hosts à mão, sem travar a implementação.
