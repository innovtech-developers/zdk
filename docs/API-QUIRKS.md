# Defeitos do contrato (Q1–Q24)

Registry auditável em [`src/schema/overrides.ts`](../src/schema/overrides.ts) (`API_QUIRKS`) — este documento é a versão legível dele, com o que fazer quando a Zappy corrigir cada um.

`tests/contract/quirks.test.ts` valida os desvios que são estruturalmente checáveis contra o swagger (a maioria) — se a Zappy corrigir, o teste **falha**, avisando que o override virou dívida. Os que só são checáveis por comportamento real (rate limit, formato de token/host) têm cross-reference pra onde de fato são testados.

## Correção de forma dos schemas (codegen vs. contrato)

| Id | Onde | O que é | Correção |
|---|---|---|---|
| **Q2** | `components.schemas.*` | 42 de 47 schemas sem array `required` no topo — codegen marca tudo opcional | `RequiredBy<T,K>` promove os campos certos por schema, na medida em que um recurso precisa |
| **Q3** | `components.schemas.*.properties.*.required` | 12 properties com `required: true` **inline** (inválido em OpenAPI 3) — ignorado pelo codegen | mesma correção de Q2; afeta `ContactPostData.name/number`, `SendTemplate.connectionFrom`, `UploadTemp.media`, `UploadTempResponse.*`, entre outros |
| **Q24** | `ContactPostData`, `ContactTagsPostData`, `TicketResolveForm`, `WebhookPostData` | o oposto de Q2/Q3: property com `default` no schema vira **obrigatória** no tipo gerado (`defaultNonNullable`), mesmo fora do `required[]` — faz sentido pra resposta, não pra corpo de requisição, que pode omitir e deixar o servidor aplicar o default | `OptionalBy<T,K>` desfaz isso — `isGroup`/`blocked`/`noCheckNumber`, `replaceTags`/`createTagIfNotExists`, `feedbackOption`, `active` voltam a ser opcionais |
| **Q4** | `POST /api/tickets/{id}/send-template` | `id` de path declarado opcional no contrato, mas sempre obrigatório na prática | `id: number` é sempre parâmetro TS obrigatório no método — nenhuma correção de tipo especial necessária, só disciplina na assinatura |
| **Q5** | `GET /api/messages` (`ticketId`/`contactId`/`dateFrom`/`dateTo`) | parâmetros de filtro sem `schema.type` | o codegen cai em `string` por default — usável como está, sem override |
| **Q9** | `pageSize` em toda listagem | sem `maximum`/`maxItems` — "não há limite... pode ser feito uma chamada para trazer tudo" | exige `timeout` configurável por chamada (ver [RESILIENCE.md](./RESILIENCE.md)) |
| **Q10** | `SendTemplateBulk.to` | array sem `maxItems`; resposta 200 com **falha parcial** por número | `templates.sendBulk()` nunca entra em retry automático; reprocesse pelos `results[].status` |

## Wrapper de resposta (contrato declara objeto único, resposta real é lista/embrulhada)

| Id | Onde | O que é | Correção |
|---|---|---|---|
| **Q18** | `GET /api/connections` | declara `Connection` único; resposta real é `{connections: Connection[]}` — não existe `ConnectionList` no contrato | `ConnectionList` em `schema/types.ts`; `connections.list()` desembrulha |
| **Q19** | `POST /api/send/{to}` | **confirmado com chamada real**: resposta vem embrulhada em `{message: Message}` — a v0.7 estava certa, o contrato (que declara `Message` puro) está errado | `messages.sendText()` desembrulha. Só verificado *para este endpoint*; `POST /api/send-template/{to}` e `POST /api/send/{type}/{to}` declaram o mesmo schema `Message` mas não foram testados — seguem sem wrapper até confirmação própria |
| **Q22** | `GET /api/connections/{id}/templates` | **confirmado com chamada real**: resposta é `{templates: MessageTemplate[]}`, mesmo padrão de Q18 — mas é uma divergência **entre instâncias** (Q15-estilo): zapcontabil ainda declara o objeto único (o bug), zapplataforma já corrigiu. A união (primeiro-vence) herda a forma do zapcontabil | `TemplateList` em `schema/types.ts`; `templates.list()` desembrulha. Continua necessário mesmo com uma instância já certa, até a outra corrigir também |

## Tipo de campo errado (contrato documenta um tipo, valor real é outro)

| Id | Onde | O que é | Correção |
|---|---|---|---|
| **Q21** | `Message.{id,subtype,isMedia,myContact}` | resposta real (confirmada por Q19) contradiz o contrato nos 4 campos: `id` é string (ID de mensagem do WhatsApp; contrato diz integer), `subtype` é string `"text"` (contrato diz integer), `isMedia`/`myContact` são boolean (contrato diz string) | `Message` em `schema/types.ts` corrige os 4 |
| **Q23** | `MessageTemplate.{type,status}` | observado em produção: `type: "marketing-catalog"` fora do enum documentado (que parece copiado do enum de botão); `status: "APPROVED"` fora do enum documentado e com casing diferente | taxonomia real desconhecida além da amostra — os dois campos ficam `string`, sem forçar um enum que já se provou errado |
| **Q1** | `Connection.status` | enum omite `WHATSAPP_AUTH` (API Oficial ativa) e `qrcode` (aguardando pareamento) — de 11 conexões reais observadas, 7 estavam `WHATSAPP_AUTH` e 2 `qrcode` | `ConnectionStatus`/`CONNECTION_STATUS` incluem os dois; `isUsableConnectionStatus()` trata só `CONNECTED`/`WHATSAPP_AUTH` como utilizável pra envio |

## Fatos de runtime não documentados no swagger

| Id | O que é | Onde é tratado |
|---|---|---|
| **Q6** | `ERR_OFFICIAL_API_WINDOW_CLOSED` chega como 400 genérico | `error-mapper.ts` mapeia pra `ZdkOfficialApiWindowError` |
| **Q7** | `POST /api/messages/multiple/{to}`: `messages` é JSON stringificado **dentro do multipart** (a variante json aceita array direto, sem stringificar) | `messages.sendMany()` decide por content-type e serializa só quando precisa |
| **Q8** | 429/`Retry-After`/5xx não documentados; rate limit real roda **antes da autenticação** (headers presentes até em `401`) | política de retry (ver [RESILIENCE.md](./RESILIENCE.md)) |
| **Q11** | Nenhuma operação tem `Idempotency-Key` | retry de POST com efeito externo não é seguro — ver a receita de reconciliação em [RECIPES.md](./RECIPES.md) |
| **Q12** | Token tem 250 caracteres, não documentado | `parseToken()` valida; `strictTokenLength` desliga se a Zappy mudar o formato |
| **Q13** | `401` documentado em 1 de 48 operações; ocorre de fato em qualquer rota autenticada | `error-mapper.ts` trata `401` universalmente, não só onde o contrato documenta |
| **Q14** | `x-ratelimit-limit`/`-remaining`/`-reset` ausentes do contrato; `reset` é epoch absoluto do servidor | ver [RESILIENCE.md](./RESILIENCE.md) |
| **Q16** | Host de API segue `api-<tenant>.<apex>`, observado em 2 tenants (`zapcontabil.chat`, `zapplataforma.chat`), não documentado | `parseBaseUrl()` valida; `strictApiHost` desliga se a Zappy usar outro padrão |
| **Q17** | Corpo de erro real é `{error, errorData}`; o schema `Error` só declara `error: string` | `ZdkHttpError.code` (o `ERR_*`) e `.payload` (o corpo inteiro) preservam os dois sem inventar tipo pro `errorData` |

## Divergência entre instâncias (não é bug de contrato, é versão implantada)

| Id | O que é |
|---|---|
| **Q15** | O contrato varia por **versão implantada**, não por tenant/domínio — `zapcontabil.chat` e `zapplataforma.chat` são o mesmo sistema, separados por marketing. `info.version` não acompanha a divergência (as duas amostras se declaram `2.1.0`). Webhooks existe numa instância e não na outra; `ticketStrategy` em `SendMediaMessage`/`SendMediaMessageJson` é o oposto. Detalhes completos e atualizados em [API-DIVERGENCE.md](./API-DIVERGENCE.md), gerado por `npm run sync:api`. |

**O que isso significa na prática:** os tipos da lib são a **união** de todas as instâncias amostradas — uma operação pode existir no tipo e não existir na SUA instância. Chamar uma assim vira `ZdkUnsupportedOperationError` (não um `404` cru), verificado sob demanda (custo zero em toda chamada bem-sucedida) ou proativamente com `zdk.supports()`/`verifyCapabilities`. Ver README.

## Quando a Zappy corrigir um destes

O teste de contrato correspondente (a maioria em `tests/contract/quirks.test.ts`) vai **falhar**, apontando exatamente qual asserção não bate mais com o swagger real. Isso é o sinal pra:

1. Rodar `npm run sync:api` de novo com os hosts atualizados.
2. Simplificar ou remover o override correspondente em `schema/overrides.ts`/`schema/types.ts`.
3. Remover a entrada de `API_QUIRKS` e a linha deste documento.
4. Ajustar o teste de contrato pra refletir o novo estado (ou removê-lo, se o defeito desapareceu por completo).

O registry nunca fica desatualizado em silêncio — ele é auditado a cada `npm test`.
