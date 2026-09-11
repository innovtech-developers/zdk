# Contribuindo

## Setup

```sh
npm install
npm run verify   # typecheck + lint + test + test:types + build — o gate de todo commit
```

## Fluxo de trabalho

1. Nunca commite direto em `main` — crie uma branch.
2. `npm run verify` precisa passar limpo antes de qualquer commit. Se um passo falhar, a tarefa não está pronta.
3. Toda operação nova entra com teste de integração + linha na tabela de recursos do [README](./README.md#os-12-recursos).
4. Todo desvio de contrato novo entra em `API_QUIRKS` (ver "Política de quirk" abaixo) — nunca corrigido em silêncio.

## Regenerando os tipos (`sync:api`)

`src/generated/openapi.d.ts` é **gerado**, nunca editado à mão. Pra atualizar contra instâncias reais:

```sh
npm run sync:api -- \
  --url https://api-<tenant1>.zapcontabil.chat \
  --url https://api-<tenant2>.zapplataforma.chat
```

O que acontece:

1. Cada URL é validada pela mesma allowlist de domínio que a lib usa em runtime (`parseBaseUrl`).
2. Baixa `/swagger.json` de cada instância, salva em `tests/fixtures/swagger-<label>.json`.
3. Une os documentos (operação/schema presente em QUALQUER instância entra na união — nenhuma é "a" referência) e roda `openapi-typescript` sobre o resultado.
4. Gera `docs/API-DIVERGENCE.md` com o relatório: contagens por instância, operações e propriedades exclusivas de cada uma.

**O contrato varia por versão implantada, não por tenant** (Q15) — o objetivo de amostrar mais de uma instância é justamente pegar essa divergência. Ao atualizar, revise o relatório de divergência gerado: uma operação que sumiu de uma instância pode ser sinal de que um quirk (`Q22`, por exemplo) já foi corrigido lá, ou de que a instância está numa versão mais antiga.

Depois de rodar, `npm run verify` precisa continuar passando — se um teste de contrato falhar, é sinal de que um `API_QUIRKS` correspondente virou dívida (ver abaixo).

## Adicionando um recurso ou método

1. Confirme a operação no swagger real (`tests/fixtures/swagger-*.json`) antes de escrever qualquer código — não assuma a partir do nome do endpoint.
2. O método vive em `src/resources/<recurso>.ts`, estende `Resource`, e chama `this.client.request("MÉTODO /path", options)`. Nunca fale com `HttpClient`/`retry`/`capabilities` diretamente — isso é trabalho do `ApiClient`.
3. Corpo/resposta seguem `ApiBody<K>`/`ApiResponse<K>` por padrão. Só crie um tipo próprio em `schema/types.ts` se houver um desvio de contrato real e confirmado (ver política de quirk) — não amplie tipo "por via das dúvidas".
4. Todo método novo ganha teste de integração em `tests/integration/<recurso>.test.ts`, usando `FakeHttpClient` — nunca bate na API real.
5. Atualize a tabela de recursos do README e, se a operação tiver algum comportamento não-óbvio, documente em [RECIPES.md](./docs/RECIPES.md).
6. `tests/contract/coverage.test.ts` falha se a operação não for referenciada por nenhum método — é a prova de que "48/48" continua verdade.

## Política de quirk

Um "quirk" é qualquer desvio entre o que o `swagger.json` documenta e o que a API realmente faz. Regras:

- **Nunca corrija em silêncio.** Toda correção de tipo/comportamento que não vem direto do contrato precisa de uma entrada em `API_QUIRKS` (`src/schema/overrides.ts`), com `id`, `at` (onde no contrato) e `reason` (por quê).
- **Prefira confirmar antes de assumir.** Se a suspeita de quirk depende de uma chamada real (não só do schema estático), documente que ainda não foi confirmado, em vez de generalizar de uma amostra — ver Q19 no [API-QUIRKS.md](./docs/API-QUIRKS.md) como exemplo de escopo deliberadamente restrito ("só confirmado pra este endpoint").
- **Todo quirk estruturalmente checável** (algo que dá pra afirmar olhando o JSON do swagger) ganha um teste em `tests/contract/quirks.test.ts` contra os fixtures reais — pra falhar quando a Zappy corrigir, não deixar o override apodrecer.
- **Ao descobrir um quirk novo:** primeiro estude com a MENOR mudança que resolve (`RequiredBy`/`OptionalBy`/`BinaryField` em `schema/types.ts` cobrem a maioria dos casos de tipo). Não invente uma abstração nova sem necessidade.
- **Numeração é sequencial** (`Q1`, `Q2`, ...) — não reutilize um número de um quirk removido.

## Testes

- `tests/unit/` — módulos de `src/core/`, sem I/O.
- `tests/integration/` — um recurso contra `FakeHttpClient`, verificando método/URL/headers/body.
- `tests/contract/` — o registry de quirks e a cobertura 48/48 contra os fixtures reais.
- `tests/types/` — garantias que só existem em tempo de compilação (`OperationKey` rejeitar chave inválida, narrowing de `json`/`multipart`, etc.) — `.test-d.ts`, rodado por `npm run test:types`.

Nenhum teste bate na rede real. Fixtures em `tests/fixtures/` são snapshots reais, atualizados só por `sync:api`.
