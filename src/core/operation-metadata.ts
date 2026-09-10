/**
 * Classificação de retry e timeout default por operação (§5.8.1/§5.8.3). O
 * tipo `Record<OperationKey, OperationMetadata>` obriga as 48 chaves da união
 * a estarem presentes — se `sync:api` trouxer uma operação nova, o
 * `npm run typecheck` falha até ela ganhar uma entrada aqui.
 *
 * Classes de retry (a tabela de §5.8.3):
 *  - `safe`: idempotente por semântica — os 24 GETs, os 6 PUTs, DELETE de webhook.
 *  - `guarded`: repetir converge ao mesmo estado (ou gera artefato órfão) — transfer, upload-temp.
 *  - `unsafe`: efeito externo ou criação duplicada — os 9 "send", resolve
 *    (pode disparar mensagem de encerramento), e as 5 criações (contacts,
 *    tags, queues, many-queues, webhooks).
 */

import type { OperationKey } from "./operation";

export type RetryClass = "safe" | "guarded" | "unsafe";

export interface OperationMetadata {
  readonly retryClass: RetryClass;
  readonly timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
/** Corpo binário/mídia (§5.8.1). */
const MEDIA_TIMEOUT_MS = 60_000;
/** `SendTemplateBulk.to` sem `maxItems` (Q10) — processamento por número, duração não previsível. */
const BULK_TIMEOUT_MS = 120_000;

const SAFE = "safe" as const;
const GUARDED = "guarded" as const;
const UNSAFE = "unsafe" as const;

export const OPERATION_METADATA: Readonly<Record<OperationKey, OperationMetadata>> = Object.freeze({
  "GET /api/connections": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/connections/{id}/templates": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/contacts": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/contacts/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "PUT /api/contacts/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/contacts/": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "PUT /api/contacts/{id}/tags": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/dashboard/tickets-por-atendente": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/dashboard/tickets-por-qualificacao": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/dashboard/tickets-agrupados": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/messages": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/messages/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/send/{to}": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/send/{type}/{to}": { retryClass: UNSAFE, timeoutMs: MEDIA_TIMEOUT_MS },
  "POST /api/messages/multiple/{to}": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "POST /api/send-template/{to}": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/send-template-bulk": { retryClass: UNSAFE, timeoutMs: BULK_TIMEOUT_MS },

  "GET /api/metrics/messages": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/queues": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/queues": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/queue-users": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/queues/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "PUT /api/queues/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/many-queues": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/storage/signed-url/{filekey}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/tags": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/tags/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "PUT /api/tags/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/tags/": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/tickets": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/tickets/search-by-contact": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/tickets/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "PUT /api/tickets/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/tickets/{id}/transfer": { retryClass: GUARDED, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/tickets/{id}/resolve": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/tickets/{id}/send": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/tickets/{id}/send/{type}": { retryClass: UNSAFE, timeoutMs: MEDIA_TIMEOUT_MS },
  "POST /api/tickets/{id}/send-and-close": { retryClass: UNSAFE, timeoutMs: MEDIA_TIMEOUT_MS },
  "GET /api/tickets/{id}/info": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/tickets/{id}/send-template": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "GET /api/users": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/users/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },

  "POST /api/upload-temp": { retryClass: GUARDED, timeoutMs: MEDIA_TIMEOUT_MS },

  "GET /api/webhooks": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "POST /api/webhooks": { retryClass: UNSAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "GET /api/webhooks/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "PUT /api/webhooks/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
  "DELETE /api/webhooks/{id}": { retryClass: SAFE, timeoutMs: DEFAULT_TIMEOUT_MS },
} satisfies Record<OperationKey, OperationMetadata>);
