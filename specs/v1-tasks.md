# Tarefas: ZDK v1

> Fase 3 de [v1-plan.md](./v1-plan.md) · 32 tarefas · nenhuma toca mais de 5 arquivos

**Ajuste de ordem em relação ao plano:** `core/errors.ts` e `core/config.ts` sobem para antes do codegen (T04–T05), porque `scripts/sync-api.ts` precisa de `parseBaseUrl` e não faz sentido duplicar a validação. Eram F3 no plano; viram pré-requisito de F1.

**Invariante de toda tarefa:** `npm run verify` verde ao terminar. Tarefa que deixa o repo vermelho não está pronta.

---

## F0 — Tooling

- [x] **T01 — Node 20, tsconfig strict, saída do typedoc**
  - Acceptance: `engines.node` = `>=20`, `.tool-versions` = 20.x, `tsconfig` com `strict: true` e `target: es2022`; `typedoc.json` emite em `docs/api/` e o `entryPoints` não aponta mais para `./src/types/index.ts` (que não existe)
  - Verify: `node -v`, `npx tsc --noEmit`, `npm run docs:generate` sem warning
  - Files: `.tool-versions`, `package.json`, `tsconfig.json`, `typedoc.json`

- [x] **T02 — Vitest com `tests/` na raiz**
  - Acceptance: `vitest.config.ts` com coverage v8, thresholds 90% em `src/core` e `src/resources`, `src/generated` excluído; scripts `test`, `test:watch`, `test:coverage`, `test:types`, `verify`; `HttpClient` fake com contador de requisições já disponível
  - Verify: `npm test` roda e passa com a suíte inicial
  - Files: `package.json`, `vitest.config.ts`, `tests/helpers/fake-http-client.ts`, `tests/unit/setup.test.ts`

- [x] **T03 — ESLint estrito, com exceção temporária para o código legado**
  - Acceptance: `no-console` e `@typescript-eslint/no-explicit-any` como `error`; `overrides` isentando `src/lib/**`, `src/zappy-api.ts`, `src/types.ts` — a isenção é removida em T27, quando esses arquivos deixam de existir
  - Verify: `npm run lint` passa; remover a isenção à mão faz falhar (prova que a regra está ativa)
  - Files: `.eslintrc.json`

## Pré-requisito do codegen

- [x] **T04 — Hierarquia de erros**
  - Acceptance: `ZdkError` abstrata com `code`, `cause`, `attempts`, `retryable`; subclasses `ZdkConfigError`, `ZdkNetworkError`, `ZdkTimeoutError`, `ZdkAbortError`, `ZdkUnsupportedOperationError`, `ZdkHttpError` (com `status`, `payload`) e as seis filhas de HTTP; `instanceof` funciona após build (sem quebrar a cadeia de protótipo em ES2022)
  - Verify: `npx vitest run tests/unit/errors.test.ts`
  - Files: `src/core/errors.ts`, `tests/unit/errors.test.ts`

- [x] **T05 — `parseBaseUrl` e `parseToken`**
  - Acceptance: as duas tabelas de §5.6 valendo — 11 vetores rejeitados, formas equivalentes normalizadas, apex rejeitado, rótulo `api-<tenant>` exigido com escape `strictApiHost`; token 250 + ASCII imprimível com `trim` e escape `strictTokenLength`; **mensagem de erro nunca contém o token**; fallback `ZAPPY_URL`/`ZAPPY_TOKEN`; config congelada
  - Verify: `npx vitest run tests/unit/config.test.ts tests/unit/token.test.ts`; `grep -rn "dotenv" src/` vazio
  - Files: `src/core/config.ts`, `tests/unit/config.test.ts`, `tests/unit/token.test.ts`

## F1 — Codegen

- [x] **T06 — `sync:api` etapa 1: baixar, salvar, relatar**
  - Acceptance: aceita N `--url`, valida por `parseBaseUrl`, baixa `/swagger.json`, salva em `tests/fixtures/swagger-<label>.json`, imprime e grava `docs/API-DIVERGENCE.md` com contagens e exclusivos por instância. **Sem união ainda**
  - Verify: `npm run sync:api -- --url <zapcontabil> --url <zapplataforma>` reproduz 48/43, as 5 ops só em zapcontabil e `ticketStrategy` só em zapplataforma
  - Files: `scripts/sync-api.ts`, `package.json`, `docs/API-DIVERGENCE.md`

- [x] **T07 — `sync:api` etapa 2: união + geração de tipos**
  - Acceptance: união de `paths` e de propriedades de `components.schemas`, alargando divergências; `required: true` inline inválido removido antes de gerar; invoca `openapi-typescript` produzindo `src/generated/openapi.d.ts` com header "não editar"
  - Verify: teste de união com dois documentos sintéticos pequenos (R1); depois `npm run sync:api` real e `npx tsc --noEmit` no arquivo gerado
  - Files: `scripts/sync-api.ts`, `src/generated/openapi.d.ts`, `tests/unit/sync-api.merge.test.ts`

- [x] **T08 — Camada de tipos `OperationKey`/`ApiBody`/`ApiResponse`**
  - Acceptance: transcreve o código já validado no spike (§5.1), incluindo o filtro de verbo `undefined` e o content-type como parâmetro
  - Verify: `npm run test:types` — asserções: `"PUT /api/connections"` **rejeitado**, `"DELETE /api/webhooks/{id}"` aceito, body de `POST /api/send/{to}` = `SendMessage`, os dois content-types de `POST /api/send/{type}/{to}` resolvendo para schemas distintos, Q18 (`ApiResponse<"GET /api/connections">` sem `connections`)
  - Files: `src/core/operation.ts`, `tests/types/operation.test-d.ts`

## F3 — Core sem rede (T09–T12 paralelizáveis entre si)

- [x] **T09 — `error-mapper`**
  - Acceptance: status + código `ERR_*` do corpo + `errorData` → instância correta; `ERR_OFFICIAL_API_WINDOW_CLOSED` → `ZdkOfficialApiWindowError`; `ERR_INVALID_API_KEY` e `ERR_NO_AUTH_HEADER_PRESENT` distinguíveis por `code`; `payload` preserva o corpo inteiro (Q17); corpo não-JSON não explode
  - Verify: `npx vitest run tests/unit/error-mapper.test.ts`
  - Files: `src/core/error-mapper.ts`, `tests/unit/error-mapper.test.ts`

- [x] **T10 — `backoff`**
  - Acceptance: função pura, exponencial com full jitter, `random` e `sleep` injetados; respeita `baseDelayMs`/`maxDelayMs`; `Math.random` só no default
  - Verify: `npx vitest run tests/unit/backoff.test.ts` com `vi.useFakeTimers()` — a suíte não dorme
  - Files: `src/core/backoff.ts`, `tests/unit/backoff.test.ts`

- [x] **T11 — `rate-limit`**
  - Acceptance: parseia `x-ratelimit-*` **e** `ratelimit-*`; header ausente → `null`; espera derivada de `reset − date` do servidor, **nunca** de `Date.now()`; `maxRetryAfterMs` respeitado; modos `observe` (default, nunca dorme) e `throttle`
  - Verify: `npx vitest run tests/unit/rate-limit.test.ts` — inclui teste com relógio local deslocado em 1h
  - Files: `src/core/rate-limit.ts`, `tests/unit/rate-limit.test.ts`

- [x] **T12 — `request-builder`**
  - Acceptance: substitui path params, monta query omitindo `undefined`, monta JSON e multipart, define `Authorization`; marca requisição não-retryável quando o corpo não é `string`/`Blob`/`Buffer`/`FormData` em memória (R5)
  - Verify: `npx vitest run tests/unit/request-builder.test.ts` — **teste de regressão do bug `dateToo` escrito antes da correção**, e teste com corpo `ReadableStream`
  - Files: `src/core/request-builder.ts`, `tests/unit/request-builder.test.ts`

## F4 — Overrides (paralelo a F3)

- [x] **T13 — `schema/overrides.ts` e `schema/types.ts`**
  - Acceptance: `API_QUIRKS` com as 21 entradas (id, ponto do contrato, motivo); `CONNECTION_STATUS` incluindo `WHATSAPP_AUTH` (Q1); `Required<>`/`RequiredBy<>` por schema (Q2/Q3); resposta de `connections` corrigida para `{connections: Connection[]}` (Q18); tipos públicos sem prefixo `I`
  - Verify: `npx vitest run tests/contract/quirks.test.ts` — cada quirk conferido contra **os dois** snapshots; falha quando a Zappy corrigir algum
  - Files: `src/schema/overrides.ts`, `src/schema/types.ts`, `tests/contract/quirks.test.ts`

## F5 — Transporte (sequencial)

- [x] **T14 — `http-client`**
  - Acceptance: interface `HttpClient` mínima + `FetchHttpClient`; timeout por tentativa via `AbortSignal.timeout` composto com o signal do consumidor por `AbortSignal.any`; distingue timeout (`ZdkTimeoutError`) de abort do consumidor (`ZdkAbortError`); erro de transporte lê `error.cause.code` (R4)
  - Verify: `npx vitest run tests/unit/http-client.test.ts` — erros sintéticos com `cause.code` `ENOTFOUND`/`ECONNREFUSED`/`ECONNRESET`; na dúvida classifica como ambíguo
  - Files: `src/core/http-client.ts`, `tests/unit/http-client.test.ts`

- [x] **T15 — `operation-metadata` das 48 operações**
  - Acceptance: cada `OperationKey` com `retryClass` (`safe`/`guarded`/`unsafe`) e timeout default conforme §5.8.1/§5.8.3; os 9 POSTs de envio, `resolve` e as criações como `unsafe`; bulk 120s, upload/mídia 60s
  - Verify: `npx vitest run tests/contract/metadata.test.ts` — falha se qualquer operação da união ficar sem classe ou sem timeout (R3)
  - Files: `src/core/operation-metadata.ts`, `tests/contract/metadata.test.ts`

- [x] **T16 — `retry` e `semaphore`**
  - Acceptance: executor aplicando a matriz de §5.8.3 (falha × classe); `retryOnTimeout: false`, `retryUnsafeOnRateLimit: false`; `Retry-After` em segundos e em HTTP-date; `deadlineMs: null`; hooks `onRetry`/`shouldRetry`; `maxConcurrent` ilimitado por default; `attempts` e `retryable` populados no erro
  - Verify: `npx vitest run tests/unit/retry.test.ts` — matriz completa como `test.each`, fake timers; **nenhum retry de `unsafe` em timeout ou 5xx**
  - Files: `src/core/retry.ts`, `src/core/semaphore.ts`, `tests/unit/retry.test.ts`

- [x] **T17 — `capabilities`**
  - Acceptance: busca `/swagger.json` da instância, monta `ReadonlySet` de `"MÉTODO /path"`, cacheia; `supports(key)`; falha de busca não bloqueia (registra e assume suportado)
  - Verify: `npx vitest run tests/unit/capabilities.test.ts` com swagger fake — `supports("GET /api/webhooks")` `false` contra o snapshot da zapplataforma, `true` contra o da zapcontabil
  - Files: `src/core/capabilities.ts`, `tests/unit/capabilities.test.ts`

- [x] **T18 — `api-client`**
  - Acceptance: `request<K extends OperationKey>()` compondo builder + http-client + retry + semáforo + rate-limit; upgrade de `404` em path conhecido para `ZdkUnsupportedOperationError` buscando o swagger **só nesse caso**; `verifyCapabilities` opcional
  - Verify: `npx vitest run tests/unit/api-client.test.ts` — chamada OK faz **1** requisição, chamada com `404` faz **2**
  - Files: `src/core/api-client.ts`, `tests/unit/api-client.test.ts`, `tests/types/api-client.test-d.ts`
  - **Ajuste de escopo, descoberto na execução:** a remoção de `axios`/`form-data` e o `grep` vazio saíram daqui. `src/lib/*` e `src/zappy-api.ts` (v0.7) ainda importam os dois, e só morrem na T27 — remover as dependências agora quebraria o build por 8 tarefas (T19–T26) sem nenhum substituto ainda no ar. Motivo idêntico ao que empurrou `errors.ts`/`config.ts` para antes do codegen (F0.5): a ordem só fica visível ao escrever o código de verdade, não no diagrama. `dependencies` vazio e o `grep` viram critério da **T27**, onde o código legado de fato desaparece.

## F6 — Recursos (T20–T21 e T24–T25 paralelos após T19)

- [x] **T19 — `Resource` base e `connections`**
  - Acceptance: classe base abstrata recebendo `ApiClient`; `connections.list()` desembrulhando `{connections:[...]}` (Q18); `get(id)` **estrito** (nunca devolve outro id, `ZdkNotFoundError` se ausente); `findUsable(preferredId?)` com `CONNECTED`/`WHATSAPP_AUTH`
  - Verify: `npx vitest run tests/integration/connections.test.ts` — cenário pedida `DISCONNECTED` + outra `CONNECTED`: `get` devolve a pedida, `findUsable` devolve a `CONNECTED`; lista vazia → `ZdkNotFoundError` nos dois
  - Files: `src/resources/resource.ts`, `src/resources/connections.ts`, `tests/integration/connections.test.ts`

- [x] **T20 — `contacts` e `tags`**
  - Acceptance: `contacts` com `list`/`get`/`create`/`update`/`setTags`; `tags` com `list`/`get`/`create`/`update`; nota do `POST /api/contacts/` e `POST /api/tags/` com barra final, como o contrato declara
  - Verify: `npx vitest run tests/integration/contacts.test.ts tests/integration/tags.test.ts` — método, URL, headers e body enviados ao fake conferem
  - Files: `src/resources/contacts.ts`, `src/resources/tags.ts`, `tests/integration/contacts.test.ts`, `tests/integration/tags.test.ts`

- [x] **T21 — `queues` e `users`**
  - Acceptance: `queues` com `list`/`get`/`create`/`update`/`createMany`/`listWithUsers`; `users` com `list`/`get` (inclui `search`)
  - Verify: `npx vitest run tests/integration/queues.test.ts tests/integration/users.test.ts`
  - Files: `src/resources/queues.ts`, `src/resources/users.ts`, `tests/integration/queues.test.ts`, `tests/integration/users.test.ts`

- [x] **T22 — `messages` e resolução do Q19**
  - Acceptance: `list` (com `dateTo` correto), `get`, `sendText`, `sendMedia` (multipart), `sendMediaByUrl` (json, Q20), `sendMany` (multipart com `files`, json sem, serializando `messages` como JSON string — Q7). **Q19 decidido com uma chamada real**: se a resposta vier `{message:...}`, entra override; senão fica como o contrato
  - Verify: `npx vitest run tests/integration/messages.test.ts`; Q19 registrado em `overrides.ts` com o resultado observado
  - Files: `src/resources/messages.ts`, `src/schema/overrides.ts`, `tests/integration/messages.test.ts`

- [x] **T23 — `tickets`** (a maior: 11 operações)
  - Acceptance: `list`, `searchByContact`, `get`, `update`, `transfer`, `resolve`, `sendText`, `sendMedia`, `sendMediaByUrl`, `sendAndClose`, `info`, `sendTemplate` — com `id` obrigatório em `sendTemplate` apesar do contrato marcá-lo opcional (Q4)
  - Verify: `npx vitest run tests/integration/tickets.test.ts` — uma asserção por operação
  - Files: `src/resources/tickets.ts`, `tests/integration/tickets.test.ts`

- [x] **T24 — `templates` e `storage`**
  - Acceptance: `templates` com `list(connectionId)`, `send`, `sendBulk`; `storage` com `signedUrl` e `uploadTemp`; `connectionFrom` obrigatório no tipo de `send` (Q3); bulk devolve `results[]` com falha parcial (Q10)
  - Verify: `npx vitest run tests/integration/templates.test.ts tests/integration/storage.test.ts`
  - Files: `src/resources/templates.ts`, `src/resources/storage.ts`, `tests/integration/templates.test.ts`, `tests/integration/storage.test.ts`

- [x] **T25 — `webhooks`, `dashboard`, `metrics`**
  - Acceptance: `webhooks` CRUD completo; `dashboard` com os três relatórios (params de array `userIds[]` etc. serializados corretamente); `metrics.messages`
  - Verify: `npx vitest run tests/integration/webhooks.test.ts tests/integration/dashboard.test.ts` — inclui `404` de webhook contra o snapshot da zapplataforma virando `ZdkUnsupportedOperationError`
  - Files: `src/resources/webhooks.ts`, `src/resources/dashboard.ts`, `src/resources/metrics.ts`, `tests/integration/webhooks.test.ts`, `tests/integration/dashboard.test.ts`

## F7 — Fachada

- [x] **T26 — `Zdk`, `verify()` e `Zdk.connect()`**
  - Acceptance: fachada compondo os 12 recursos como `readonly`; `verify()` devolvendo `{connections, rateLimit}` e reusando `connections.list()`; `Zdk.connect()` = `new Zdk()` + `verify()`; `zdk.rateLimit` refletindo a última resposta; `401` → `ZdkAuthError` com `code` distinguindo as duas causas; `2xx` sem `connections` → `ZdkConfigError`
  - Verify: `npx vitest run tests/integration/verify.test.ts` — `new Zdk()` faz **zero** requisições, `Zdk.connect()` **exatamente uma**, provado por contador
  - Files: `src/zdk.ts`, `tests/integration/verify.test.ts`

- [x] **T27 — Barrel público, remoção do código v0.7 e de `axios`/`form-data` (2º marco)**
  - Acceptance: `src/index.ts` exportando só a superfície pretendida; apagados `src/lib/*` (7 arquivos), `src/zappy-api.ts`, `src/types.ts`; isenção de ESLint de T03 removida; **`axios`/`form-data` saem de `dependencies`** — herdado de T18, que não podia fazer isso ainda porque os arquivos legados que os usam só morrem aqui
  - Verify: `npm run verify`; `grep -rn "IError\|makeRequest" src/` vazio; `grep -rn "axios\|form-data" src/` vazio; `npm run lint` passa **sem** a isenção
  - Files: `src/index.ts`, `.eslintrc.json`, `package.json`, + remoções

## F8 — Contrato

- [ ] **T28 — Teste de cobertura bidirecional**
  - Acceptance: toda `OperationKey` citada em `resources/` existe na união; **todo** path de cada snapshot tem método correspondente; nenhum método órfão
  - Verify: `npx vitest run tests/contract/coverage.test.ts` — 48/48; falha se uma operação for esquecida
  - Files: `tests/contract/coverage.test.ts`

## F9 — Documentação

- [ ] **T29 — README e MIGRATION**
  - Acceptance: README com instalação, config por objeto, quickstart, tabela dos 12 recursos, erros tipados, `supports()`, **cálculo do pior caso de wall clock em destaque**; `MIGRATION.md` com tabela antes/depois por método e as quebras (construtor, fim do `T | IError`, renomes, `send` → `sendText`/`sendMedia`)
  - Verify: leitura; todo exemplo de código copiado para um arquivo temporário compila
  - Files: `README.md`, `docs/MIGRATION.md`

- [ ] **T30 — API-QUIRKS, RESILIENCE, AUTH**
  - Acceptance: `API-QUIRKS.md` com os 22 desvios e o que muda quando a Zappy corrigir; `RESILIENCE.md` com timeout, backoff, **a matriz de §5.8.3 na íntegra**, rate limit e a justificativa de não haver breaker; `AUTH.md` com allowlist, token, `new Zdk` vs `connect` vs `verify`
  - Verify: leitura; referências cruzadas para a spec resolvem
  - Files: `docs/API-QUIRKS.md`, `docs/RESILIENCE.md`, `docs/AUTH.md`

- [ ] **T31 — RECIPES, CHANGELOG, CONTRIBUTING, typedoc**
  - Acceptance: `RECIPES.md` com envio de texto/mídia (arquivo e URL), template com header via `storage.uploadTemp`, bulk com reprocesso por `results[].status`, **reconciliação após falha ambígua**, janela de 24h por `tickets.info`, paginação, webhooks, dashboard; `CHANGELOG.md` em Keep a Changelog com `1.0.0` e BREAKING CHANGES; `CONTRIBUTING.md` com o fluxo `sync:api` e a política de quirk
  - Verify: `npm run docs:generate` sem warning; exemplos das receitas compilam
  - Files: `docs/RECIPES.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/api/` (gerado)

## F10 — Release

- [ ] **T32 — Smoke test de empacotamento**
  - Acceptance: `npm pack` gera tarball; num diretório temporário, `require("zdk")` e `import "zdk"` funcionam com tipos resolvidos; `files` do `package.json` não vaza `tests/` nem `specs/`
  - Verify: script de smoke rodando os dois imports e um `tsc --noEmit` contra o pacote instalado
  - Files: `package.json`, `scripts/smoke-pack.sh`

---

## Marcos de revisão

Cinco pontos onde vale parar e olhar antes de seguir (eram quatro; T18 perdeu o marco de "dependencies vazio" — ver nota da própria T18 — e ele passou para T27):

| Depois de | Por quê |
|---|---|
| **T08** | a camada de tipos é a fundação; se `OperationKey` não estiver certa, tudo acima nasce torto |
| **T18** | transporte composto (builder + http-client + retry + semáforo + rate-limit + capabilities) e testado de ponta a ponta — `axios`/`form-data` ainda não saíram (ver nota da tarefa) |
| **T23** | os dois recursos maiores (messages, tickets) prontos; o padrão dos demais está validado |
| **T27** | `axios`/`form-data` fora de `dependencies` — o "zero deps" finalmente provado |
| **T28** | 48/48 provado; a promessa central da lib é verificável a partir daqui |
