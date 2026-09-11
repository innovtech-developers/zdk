# Receitas

Todo exemplo abaixo assume `zdk = await Zdk.connect({ baseUrl, token })` já feito.

## Enviar texto

```ts
const connection = await zdk.connections.findUsable();
const message = await zdk.messages.sendText("5511999999999", {
  body: "Olá! Como posso ajudar?",
  connectionFrom: connection.id,
});
```

## Enviar mídia — arquivo local

```ts
import { readFile } from "node:fs/promises";

const bytes = await readFile("./foto.png");
await zdk.messages.sendMedia("5511999999999", "image", {
  media: bytes, // Buffer, Blob ou string — todos aceitos
  caption: "Segue o comprovante",
  connectionFrom: connection.id,
});
```

## Enviar mídia — por URL (sem subir bytes pelo SDK)

Capacidade que a v0.7 nunca teve — o contrato aceita `application/json` com `url` como alternativa ao multipart:

```ts
await zdk.messages.sendMediaByUrl("5511999999999", "image", {
  url: "https://exemplo.com/imagem.png",
  connectionFrom: connection.id,
});
```

## Template com header de imagem (via `storage.uploadTemp`)

Pra enviar um template com header de imagem, primeiro sobe o arquivo pra pegar uma URL temporária, depois usa essa URL no `headerParams`:

```ts
import { readFile } from "node:fs/promises";

const bytes = await readFile("./banner.png");
const { url } = await zdk.storage.uploadTemp({ media: bytes });

await zdk.templates.send("5511999999999", {
  connectionFrom: connection.id,
  templateId: "160",
  headerParams: { image: url },
  bodyParams: { "1": "João" },
});
```

## Bulk de template, reprocessando só quem falhou

`sendBulk` nunca lança pro lote inteiro — a resposta tem falha parcial por número (Q10):

```ts
const numeros = ["5511999999999", "5511888888888", "5511777777777"];

const { results = [] } = await zdk.templates.sendBulk({
  to: numeros,
  connectionFrom: connection.id,
  templateId: "160",
});

const falharam = results.filter((r) => r.status === "error").map((r) => r.to);

if (falharam.length > 0) {
  // reenvia só quem falhou, depois de investigar o motivo (r.error)
  await zdk.templates.sendBulk({
    to: falharam,
    connectionFrom: connection.id,
    templateId: "160",
  });
}
```

## Reconciliação após falha ambígua de envio

Sem `Idempotency-Key` no contrato (Q11), um `ZdkTimeoutError`/`ZdkNetworkError` num envio não diz se a mensagem saiu. A lib nunca repete sozinha nesse caso (operação `unsafe`) — reconcilie em vez de arriscar duplicar:

```ts
import { ZdkNetworkError, ZdkTimeoutError } from "zdk";

async function enviarComReconciliacao(to: string, body: string, connectionFrom: number, contactId: number) {
  const iniciadoEm = new Date().toISOString();

  try {
    return await zdk.messages.sendText(to, { body, connectionFrom });
  } catch (error) {
    if (!(error instanceof ZdkTimeoutError || error instanceof ZdkNetworkError)) throw error;

    // ambíguo — confere antes de reenviar
    const { messages = [] } = await zdk.messages.list({ contactId: String(contactId), dateFrom: iniciadoEm });
    const jaEnviou = messages.some((m) => m.fromMe && m.body === body);
    if (jaEnviou) return;

    return await zdk.messages.sendText(to, { body, connectionFrom });
  }
}
```

Só o consumidor sabe o que conta como "mesma mensagem" no seu domínio — por isso isso é receita, não comportamento automático da lib.

## Checar a janela de 24h antes de decidir template vs texto livre

```ts
const info = await zdk.tickets.info(ticketId);

if (info.canSendMessageWithOficialApi) {
  await zdk.messages.sendText(to, { body, connectionFrom });
} else {
  // fora da janela — precisa de template
  const templates = await zdk.templates.list(connection.id);
  const aprovado = templates.find((t) => t.status === "APPROVED" && t.id !== undefined);
  if (aprovado?.id) {
    await zdk.templates.send(to, { connectionFrom, templateId: aprovado.id.toString() });
  }
}
```

## Paginação

Todo `list()` aceita `page`/`pageSize`; itere até `page >= pageCount`:

```ts
async function* todosOsContatos() {
  let page = 1;
  while (true) {
    const result = await zdk.contacts.list({ page, pageSize: 100 });
    for (const contact of result.contacts ?? []) yield contact;
    if (!result.pageCount || page >= result.pageCount) break;
    page += 1;
  }
}

for await (const contact of todosOsContatos()) {
  console.log(contact.name);
}
```

`pageSize` não tem limite documentado no contrato (Q9) — uma chamada com `pageSize` muito alto pode ser lenta; ajuste `timeoutMs` nela se for o caso (ver [RESILIENCE.md](./RESILIENCE.md)).

## Webhooks — CRUD

```ts
const webhook = await zdk.webhooks.create({
  name: "CRM",
  url: "https://meu-crm.com/hooks/zappy",
  urlType: "static",
  type: "message",
  // active: true por default — omitido de propósito (Q24)
});

if (webhook.id === undefined) throw new Error("resposta sem id");

// reconstrua o payload em vez de espalhar a resposta de volta — ela tem
// campos opcionais (id, createdAt, secret...) que PUT não espera receber
await zdk.webhooks.update(webhook.id, {
  name: "CRM",
  url: "https://meu-crm.com/hooks/zappy",
  urlType: "static",
  type: "message",
  active: false,
});
await zdk.webhooks.delete(webhook.id);
```

`Webhooks` pode não existir em toda instância (Q15) — um `zdk.webhooks.list()` numa instância sem a feature lança `ZdkUnsupportedOperationError`, não um erro genérico. Confira com `zdk.supports("GET /api/webhooks")` antes de mostrar a tela, se quiser evitar o erro por completo.

## Dashboard — relatórios com filtro por array

`userIds[]`/`queueIds[]`/`tagIds[]` são arrays de verdade — a lib serializa como múltiplas entradas da mesma chave:

```ts
const relatorio = await zdk.dashboard.ticketsByAgent({
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  "queueIds[]": [10, 20],
});
```
