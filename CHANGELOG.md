# Changelog

Este projeto segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0]

Reescrita completa, derivada do contrato OpenAPI real da Zappy (`/swagger.json`) em vez de escrita à mão. **Break limpo — sem shims da v0.7.**

### BREAKING CHANGES

- **Construtor:** `new Zdk(rootUrl?, token?)` (posicional) → `new Zdk({ baseUrl, token, ...opções })` (objeto). `ZAPPY_URL`/`ZAPPY_TOKEN` continuam como fallback.
- **Retorno de erro:** todo método lançava `T | { error }`; agora lança sempre — `try/catch` com `instanceof ZdkError` no lugar de checar `"error" in result`. `IError` foi removido.
- **`connections.get(id)`** ficou estrito — nunca mais substitui silenciosamente por outra conexão quando a pedida não está usável. O fallback antigo agora é `connections.findUsable(preferredId?)`, explícito.
- **Renomes de método:** `messages.send(to, data, type?)` (uma função sobrecarregada) virou `messages.sendText`/`.sendMedia`/`.sendMediaByUrl`(novo)/`.sendMany`(novo).
- **Renomes de tipo:** todo `IXxx` perdeu o prefixo (`ITicket` → `Ticket`, `IConnection` → `Connection`, etc.); tipos de lista (`IContactList`, ...) foram removidos — `list()` devolve o formato já corrigido, sem wrapper redundante pra desembrulhar.
- **Dependências:** `axios` e `form-data` saíram — zero dependências de runtime. `fetch`/`FormData` nativos, exige Node ≥ 20.
- A lib não carrega mais `.env` sozinha (`dotenv` removido do caminho de import).

Ver [docs/MIGRATION.md](./docs/MIGRATION.md) pra tabela completa antes/depois.

### Added

- Cobertura de **48 operações** (união dos contratos de `api-zapcontabil.zapcontabil.chat` e `api-safiracosmeticos.zapplataforma.chat`) — a v0.7 cobria 14. Recursos novos: `templates`, `storage`, `webhooks`, `dashboard`, `metrics`.
- `zdk.supports(operationKey)`/`zdk.capabilities()` — descoberta de disponibilidade em runtime; operação ausente na instância vira `ZdkUnsupportedOperationError`, não um `404` cru.
- `Zdk.connect()`/`zdk.verify()` — prova de credencial explícita, sem custar uma requisição em toda chamada.
- Retry automático com backoff exponencial e full jitter, classificado por operação (`safe`/`guarded`/`unsafe`) — nunca repete `POST` com efeito externo por padrão.
- Rate limit observável (`zdk.rateLimit`, `onRateLimit`) e modo `throttle` opcional.
- Timeout configurável por chamada/operação/global, com defaults por tipo de operação (bulk, upload, mídia).
- `sync:api` — script que baixa o swagger de N instâncias, une os contratos e gera os tipos (`src/generated/openapi.d.ts`), com relatório de divergência (`docs/API-DIVERGENCE.md`).
- Registry auditável de defeitos do contrato (`API_QUIRKS`, 24 entradas) — ver [docs/API-QUIRKS.md](./docs/API-QUIRKS.md).
- Suíte de testes com Vitest (unit/integration/contract/types) em `tests/` na raiz.

### Fixed

- Bug de query `dateToo=` (em vez de `dateTo=`) em `messages.list()` — corrigido por construção (nomes de query vêm do tipo gerado, nunca digitados duas vezes).
- `Connection.status` agora aceita `WHATSAPP_AUTH` e `qrcode`, valores reais observados em produção e ausentes do swagger documentado.

### Removed

- `axios`, `form-data`, `dotenv` (dependências de runtime).
- `IError` e o padrão `T | IError` de retorno.
- `src/lib/*`, `src/zappy-api.ts`, `src/types.ts` (implementação inteira da v0.7).

[1.0.0]: https://github.com/innovtech-developers/zdk/releases/tag/v1.0.0
