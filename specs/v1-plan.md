# Plano técnico: ZDK v1

> Fase 2 de [v1-swagger-driven-sdk.md](./v1-swagger-driven-sdk.md) · Data: 2026-09-10

## 1. Grafo de dependência

```
        ┌─────────────── F0: tooling (Node 20, vitest, lint, deps) ───────────────┐
        │                                                                          │
        ▼                                                                          ▼
   F1: sync-api ──────► src/generated/openapi.d.ts ──────► F2: core/operation.ts
   (união + report)                                          (OperationKey, ApiBody)
                                                                     │
        ┌────────────────────────────────────────────────────────────┤
        ▼                                                            ▼
   F3: core sem rede                                           F4: schema/
   config, errors, error-mapper,                               overrides, types
   backoff, rate-limit, request-builder                        (22 quirks)
        │                                                            │
        └──────────────────────┬─────────────────────────────────────┘
                               ▼
                    F5: http-client + api-client
                    (fetch, timeout, retry, capabilities, semaphore)
                               │
                               ▼
                    F6: resources (12 classes) ──► F7: facade Zdk + verify/connect
                               │
                               ▼
                    F8: contract tests ──► F9: docs ──► F10: release prep
```

Regra que o grafo impõe: **nada que fale HTTP é escrito antes de F3 estar verde.** O `HttpClient` é interface em F3 e implementação em F5, então F6 pode ser testado contra fake sem que `fetch` exista.

## 2. Ordem de implementação

### F0 — Tooling (bloqueia tudo, ~1 tarefa)

Node 20 em `.tool-versions` + `engines.node`, `tsconfig` com `strict: true`, vitest + coverage v8 com `tests/` na raiz, ESLint ganhando `no-console` e `no-explicit-any` como error, devDeps `openapi-typescript` + `tsx` + `vitest`.

**Não remove `axios`/`form-data` aqui** — só em F7 (ver nota nessa seção), quando o código legado que os usa finalmente é apagado. Remover antes deixa o repo sem build por várias tarefas.

Checkpoint: `npm run verify` passa num projeto ainda com o código v0.7 intacto.

### F0.5 — Erros e config (pré-requisito de F1, descoberto na Fase 3)

`core/errors.ts` e `core/config.ts` estavam em F3 no desenho original, mas `scripts/sync-api.ts` precisa de `parseBaseUrl` — e duplicar a validação de URL contrariaria o DRY que a própria §5.6 exige (uma função, três chamadores). Ambos são puros e sem dependência, então subir é grátis.

Checkpoint: `parseBaseUrl` rejeita os 11 vetores e normaliza as formas equivalentes; token de 250 validado sem vazar valor em mensagem de erro.

### F1 — Codegen (bloqueia F2, F4)

`scripts/sync-api.ts`: valida URLs, baixa N swaggers, salva fixtures, une, roda `openapi-typescript`, emite `docs/API-DIVERGENCE.md`.

A união é a parte com risco (§4, R1). Ordem interna: primeiro só baixar+salvar+relatar (sem união), depois a união. Assim o relatório de divergência — que é o artefato de informação — sai antes da parte difícil.

Checkpoint: `src/generated/openapi.d.ts` gerado; relatório reproduz os números conhecidos (48/43, 5 ops só em zapcontabil, `ticketStrategy` só em zapplataforma).

### F2 — Camada de tipos (bloqueia F6)

`core/operation.ts` com `OperationKey`/`ApiBody`/`ApiResponse`/`ApiParams`, mais `tests/types/operation.test-d.ts`.

**Já validado no spike:** o código exato da §5.1 compilou com `tsc --strict` contra a saída real do gerador. Esta fase é transcrever o que foi provado, não descobrir.

Checkpoint: `npm run test:types` verde, incluindo a rejeição de `"PUT /api/connections"`.

### F3 — Core sem rede (paraleliza internamente)

Quatro módulos independentes entre si (`errors` e `config` já saíram em F0.5), todos funções puras ou classes sem I/O:

| Módulo | Conteúdo |
|---|---|
| `core/error-mapper.ts` | status + `ERR_*` + `errorData` → instância |
| `core/backoff.ts` | exponencial + full jitter, `random` injetado |
| `core/rate-limit.ts` | parse dos headers, espera server-relative pelo `date` |
| `core/request-builder.ts` | path params, query, headers, body/multipart, detecção de corpo não-rebobinável |

Checkpoint: coverage ≥90% só com testes unitários, zero mock de rede. Aqui morre o bug `dateToo` (teste primeiro).

### F4 — Overrides (paraleliza com F3)

`schema/overrides.ts` com `API_QUIRKS` (22 entradas) e `schema/types.ts` com os tipos públicos derivados. Inclui `WHATSAPP_AUTH` (Q1), `Required<>` por schema (Q2/Q3), resposta de `connections` (Q18).

Checkpoint: `tests/contract/quirks.test.ts` confirma que cada quirk ainda se aplica aos **dois** snapshots.

### F5 — Transporte (sequencial, depende de F3)

`core/http-client.ts` (interface + `FetchHttpClient`), `core/api-client.ts` (`request<K>()` com timeout, retry pela matriz, semáforo, upgrade de 404), `core/capabilities.ts`, `core/operation-metadata.ts` (retryClass + timeout das 48).

Checkpoint: matriz de §5.8.3 coberta por `test.each` com fake timers; `npm run verify` verde.

**Ajuste descoberto na execução:** o plano original previa `axios`/`form-data` saindo do `package.json` aqui. Não dá — `src/lib/*` e `src/zappy-api.ts` (v0.7) ainda importam os dois, e só são apagados em F7 (T27); removê-los em F5 quebraria o build pelas duas fases seguintes sem nenhum substituto no ar ainda. O "zero dependências de runtime" só se prova em F7/T27, não aqui.

### F6 — Recursos (12 classes, altamente paralelo)

`resources/resource.ts` base primeiro. Depois as 12, cada uma com seu teste de integração contra `HttpClient` fake. Sugestão de agrupamento por tarefa:

| Tarefa | Recursos | Nota |
|---|---|---|
| 6a | `resource.ts` + `connections` | base + `get` estrito e `findUsable` |
| 6b | `contacts`, `tags` | CRUD simples, mesmo padrão |
| 6c | `queues`, `users` | idem, mais `queue-users` e `many-queues` |
| 6d | `messages` | 5 ops, dois content-types, resolve Q19 |
| 6e | `tickets` | 11 ops, a maior |
| 6f | `templates`, `storage` | API Oficial + `uploadTemp`/`signedUrl` |
| 6g | `webhooks`, `dashboard`, `metrics` | webhooks é o caso de `404` por versão |

### F7 — Fachada

`zdk.ts` compondo os 12, `verify()`, `Zdk.connect()`, `index.ts` como única superfície exportada.

Checkpoint: `new Zdk()` faz zero requisições, `Zdk.connect()` exatamente uma — provado por contador.

### F8 — Contrato

Teste bidirecional: toda `OperationKey` usada existe na união; todo path de cada snapshot tem método; toda operação tem `retryClass` e timeout. É a rede que pega cobertura parcial silenciosa.

### F9 — Documentação

`README`, `MIGRATION`, `API-QUIRKS`, `API-DIVERGENCE`, `RESILIENCE`, `AUTH`, `RECIPES`, `CHANGELOG`, `CONTRIBUTING`, typedoc regenerado (corrigindo o `entryPoints` que hoje aponta para `./src/types/index.ts`, inexistente).

### F10 — Release

`npm pack` + smoke test de import CJS e ESM num diretório temporário, com resolução de tipos.

## 3. Paralelismo

| Sequencial obrigatório | Paralelizável |
|---|---|
| F0 → F1 → F2 | F3 (6 módulos entre si) |
| F3 → F5 → F6 → F7 | F3 ∥ F4 |
| F7 → F8 → F10 | F6: 6b/6c/6f/6g entre si após 6a |
| | F9 acompanha F6 em diante |

Caminho crítico: **F0 → F0.5 → F1 → F2 → F3 → F5 → F6a → F6d/6e → F7 → F8 → F10.**

Quebra detalhada em [v1-tasks.md](./v1-tasks.md): 32 tarefas, nenhuma tocando mais de 5 arquivos.

## 4. Riscos

| # | Risco | Probabilidade | Mitigação |
|---|---|---|---|
| R1 | **União de swaggers mal resolvida** — merge de schema property-by-property com `required: true` inline inválido pode gerar tipo errado em silêncio | média | F1 dividido em duas etapas (relatar antes de unir); teste de união com dois documentos sintéticos pequenos antes de rodar nos reais; o relatório é revisado à mão na primeira execução |
| R2 | **Q19 (wrapper `{message:...}`) só resolve com chamada real** | alta | Tarefa 6d assume o contrato e deixa o override pronto; se a chamada real mostrar wrapper, muda **uma** linha em `overrides.ts`. Não bloqueia nada antes de 6d |
| R3 | **Retry classificado errado numa operação** → mensagem duplicada em produção | baixa, impacto alto | `operation-metadata.ts` revisada operação por operação contra a tabela da §5.8.3; teste de contrato falha se faltar classe; boundary "ask first" para mudar classe |
| R4 | **`fetch` esconde o código de erro em `cause`** e a classificação DNS vs `ECONNRESET` desaba | média | teste unitário com erro sintético carregando `cause.code`; na dúvida, classificar como ambíguo (fail-safe) |
| R5 | **Corpo não-rebobinável sofrendo retry** manda body vazio | média | `request-builder` marca não-retryável quando o corpo não é `string`/`Blob`/`Buffer`/`FormData` em memória; teste explícito com `ReadableStream` |
| R6 | **Escopo grande (48 ops) cansa antes de terminar** e o projeto fica meio migrado | média | F6 fatiado em 7 tarefas independentes; cada uma entrega recurso completo com teste. Repo fica verde ao fim de cada tarefa |
| R7 | **Instância muda o swagger no meio da implementação** | baixa | fixtures commitados são a referência; `sync:api` re-rodado só de propósito, com o diff revisado |
| R8 | **`docs/` é saída do typedoc** e o `.md` escrito à mão pode ser sobrescrito | média | docs manuais vão em `docs/*.md` de nome fixo e o typedoc passa a emitir em `docs/api/`; ajuste no `typedoc.json` na F0 |

## 5. Checkpoints de verificação

Ao fim de cada fase, `npm run verify` verde e mais o específico:

| Fase | Verificação específica |
|---|---|
| F0 | `node -v` ≥ 20; vitest roda suíte vazia; lint passa no código v0.7 |
| F1 | relatório reproduz 48/43 e as divergências conhecidas |
| F2 | `test:types` rejeita `"PUT /api/connections"` |
| F3 | coverage ≥90% em `core/`, zero rede; query monta `dateTo=` |
| F4 | 21 quirks conferem contra os dois snapshots |
| F5 | matriz de retry completa |
| F6 | por tarefa: método/URL/headers/body enviados ao fake conferem |
| F7 | `new Zdk()` = 0 requisições; `connect()` = 1; `dependencies` do `package.json` vazio (adiado de F5 — ver nota na própria seção) |
| F8 | 48/48 mapeadas, nenhum método órfão |
| F9 | typedoc gera sem warning; nenhum link quebrado |
| F10 | import CJS e ESM do tarball com tipos resolvidos |

## 6. O que não entra

Reafirmando §11 da spec para não voltar como escopo: circuit breaker, dedup local de envio, fachada genérica por instância, cliente de webhooks, cache de resposta, browser bundle.
