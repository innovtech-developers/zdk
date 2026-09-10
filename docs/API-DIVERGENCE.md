# Divergência entre instâncias da API Zappy

Gerado por `npm run sync:api`. Não editar à mão — a próxima execução sobrescreve.

```
zapcontabil    48 ops, 47 schemas  (https://api-zapcontabil.zapcontabil.chat)
zapplataforma  43 ops, 43 schemas  (https://api-safiracosmeticos.zapplataforma.chat)

união          48 ops, 47 schemas

só em zapcontabil (5):
  DELETE /api/webhooks/{id}, GET /api/webhooks, GET /api/webhooks/{id}, POST /api/webhooks, PUT /api/webhooks/{id}

schemas só em zapcontabil (4):
  Webhook, WebhookList, WebhookPostData, WebhookWithSecret

propriedades divergentes (2):
  SendMediaMessage.ticketStrategy — só em zapplataforma
  SendMediaMessageJson.ticketStrategy — só em zapplataforma
```
