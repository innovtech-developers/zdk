# Migrando da v0.7 para a v1

A v1 é um **break limpo**: sem shims, sem nomes antigos mantidos "por compatibilidade". Reescrever é reta — o volume de mudança está em nomes e formato de retorno, não em conceitos novos pra aprender.

## 1. Construtor: argumentos posicionais → objeto de config

```ts
// v0.7
import { Zdk } from "zdk";
const zdk = new Zdk("https://api-example.chat", "TOKEN");
// ou, com env vars: new Zdk()

// v1
import { Zdk } from "zdk";
const zdk = new Zdk({ baseUrl: "https://api-x.zapcontabil.chat", token: "TOKEN" });
// env vars (ZAPPY_URL/ZAPPY_TOKEN) continuam funcionando como fallback: new Zdk()
```

`baseUrl` agora é validada na hora (host precisa ser `api-<tenant>.zapcontabil.chat` ou `api-<tenant>.zapplataforma.chat`) — ver [AUTH.md](./AUTH.md). `new Zdk()` continua síncrono e sem I/O; pra provar que as credenciais realmente funcionam, use `Zdk.connect()` ou `zdk.verify()` (novo — ver README).

## 2. Fim do `T | { error }` — todo método agora lança

Este é o break que mais afeta código existente.

```ts
// v0.7
const result = await zdk.tickets.get(123);
if ("error" in result) {
  console.error(result.error);
} else {
  console.log(result.status);
}

// v1
try {
  const ticket = await zdk.tickets.get(123);
  console.log(ticket.status);
} catch (error) {
  if (error instanceof ZdkNotFoundError) {
    // ticket não existe
  } else {
    throw error; // não engula erro que você não trata
  }
}
```

Não há mais `IError`. Todo erro é uma subclasse de `ZdkError` — ver a hierarquia completa no [README](../README.md#erros-tipados) e em [RESILIENCE.md](./RESILIENCE.md). A v0.7 também fazia `console.error` internamente antes de devolver `{ error }`; a v1 nunca loga por conta própria — o erro sobe pra você decidir o que fazer com ele.

## 3. Renomes de tipo — sem prefixo `I`

| v0.7 | v1 |
|---|---|
| `IZdkOptions` | `ZdkOptions` |
| `IConnection` | `Connection` |
| `IContact` | `Contact` |
| `IContactPostData` | `ContactPostData` |
| `ITag` | `Tag` |
| `IQueue` | `Queue` |
| `ITicket` | `Ticket` |
| `ITicketUpdateForm` | `ApiBody<"PUT /api/tickets/{id}">` |
| `ITicketTransferForm` | `ApiBody<"POST /api/tickets/{id}/transfer">` |
| `ITicketResolveForm` | `TicketResolveFormData` |
| `IUser` | `User` |
| `IMessage` / `IMessageObject` | `Message` |
| `IError` | *(removido — usa `instanceof ZdkError`)* |
| `IConnectionList`/`IContactList`/... | *(removidos — `list()` devolve o array/objeto direto, já sem precisar desembrulhar)* |

Os tipos de formulário sem override próprio (`ITicketUpdateForm`, `ITicketTransferForm`) viraram `ApiBody<K>` genérico — derivado do contrato, não reescrito à mão. Só os schemas que têm defeito real de contrato (Q3/Q24) ganharam um tipo próprio nomeado (`ContactPostData`, `TicketResolveFormData`, etc.).

## 4. Renomes de método

### `messages`

| v0.7 | v1 | Nota |
|---|---|---|
| `messages.send(to, { body, connectionFrom, ticketStrategy })` | `messages.sendText(to, data)` | |
| `messages.send(to, { media, caption, connectionFrom }, type)` | `messages.sendMedia(to, type, data)` | multipart, arquivo |
| *(não existia)* | `messages.sendMediaByUrl(to, type, data)` | **novo** — mídia por URL, json, sem subir bytes pelo SDK |
| *(não existia)* | `messages.sendMany(to, messages, files?)` | **novo** — `POST /api/messages/multiple/{to}` |

### `connections`

| v0.7 | v1 | Nota |
|---|---|---|
| `connections.get(id?)` — se a conexão pedida não estivesse `CONNECTED`/`WHATSAPP_AUTH`, devolvia **outra** silenciosamente | `connections.get(id)` — **estrito**, nunca substitui | comportamento mudou: agora lança `ZdkNotFoundError` se a pedida não existir, nunca troca por outra |
| *(o fallback acima, implícito)* | `connections.findUsable(preferredId?)` | **novo** — o fallback da v0.7, agora explícito e nomeado |

### `tickets`

| v0.7 | v1 | Nota |
|---|---|---|
| `tickets.list/get/update/transfer/resolve` | iguais | sem mudança de nome |
| *(não existia)* | `tickets.searchByContact`, `.sendText`, `.sendMedia`, `.sendMediaByUrl`, `.sendAndClose`, `.info`, `.sendTemplate` | **novos** — 6 operações do contrato que a v0.7 nunca cobriu |

### `contacts`/`tags`/`queues`

| v0.7 | v1 | Nota |
|---|---|---|
| `list`/`get`/`update` | iguais | |
| *(não existia)* | `contacts.create`, `contacts.setTags` | **novos** |
| *(não existia)* | `tags.create` | **novo** |
| *(não existia)* | `queues.create`, `.createMany`, `.listWithUsers` | **novos** |

### Recursos inteiramente novos

`templates`, `storage`, `webhooks`, `dashboard`, `metrics` — 12 operações que a v0.7 não cobria nenhuma. Ver a tabela completa no [README](../README.md#os-12-recursos).

## 5. Comportamento que mudou sem mudar de nome

- **`connections.get(id)`** ficou estrito (item 4 acima) — se seu código dependia do fallback silencioso, troque por `findUsable`.
- **Query com `dateFrom`/`dateTo`** em `messages.list()`: a v0.7 tinha um bug que mandava `dateToo=` em vez de `dateTo=` — silenciosamente ignorado pela API. Corrigido por construção na v1 (os nomes de query vêm do tipo gerado do contrato, nunca digitados duas vezes).
- **`Connection.status`** aceita `"WHATSAPP_AUTH"` e `"qrcode"` — dois valores reais que o `swagger.json` da Zappy não documenta (Q1), mas que a v0.7 já lidava parcialmente (só `WHATSAPP_AUTH`).

## 6. Dependências

A v1 tem **zero dependências de runtime** — `axios` e `form-data` saíram, `fetch`/`FormData` nativos entraram. Se seu código importava algo de `zdk/node_modules/axios` diretamente (improvável, mas possível), isso para de funcionar.

## Perguntas que a migração não responde sozinha

Se seu código dependia de algum detalhe não coberto aqui, abra uma issue — a superfície pública é auditável em [`src/index.ts`](../src/index.ts) e todo defeito de contrato conhecido está em [API-QUIRKS.md](./API-QUIRKS.md).
