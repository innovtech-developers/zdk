/**
 * Tipos públicos do ZDK, sem prefixo `I` — derivados dos schemas gerados
 * (`src/generated/openapi.d.ts`) e corrigidos pelos overrides de
 * `schema/overrides.ts` (§5.3/§5.4). Só definidos aqui na medida em que um
 * recurso (T19+) de fato precisa deles — não há tipo especulativo.
 */

import type { components } from "../generated/openapi";
import type { ApiResponse } from "../core/operation";
import { CONNECTION_STATUS, type ConnectionStatus } from "./overrides";

/**
 * Q2/Q3: o codegen marca toda property como opcional (schemas sem `required`
 * no topo, ou com `required: true` inline — inválido em OpenAPI 3, ignorado).
 * `RequiredBy` promove as chaves que sabemos ser sempre presentes na prática,
 * sem tocar nas demais.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Q24 — o oposto de Q2/Q3: `openapi-typescript` marca como OBRIGATÓRIA (sem
 * `?`) toda property que tem `default` no schema, mesmo estando fora do
 * array `required[]` (comportamento `defaultNonNullable` da ferramenta).
 * Faz sentido para RESPOSTA (servidor sempre preenche o default), não faz
 * sentido para BODY DE REQUISIÇÃO (cliente pode omitir e deixar o servidor
 * aplicar o default sozinho) — mas o codegen não distingue os dois casos.
 * `OptionalBy` desfaz isso nos bodies onde acontece.
 */
export type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Campo `format: binary` do swagger vira `string` no codegen — mas quem
 * chama tem bytes em memória (`Blob`/`Uint8Array`), não uma string pronta.
 * Achado escrevendo `storage.uploadTemp()` (T24): `UploadTempData` sem isso
 * rejeitava um `Blob` de verdade, o mesmo bug que os testes de `messages`/
 * `tickets` mascaravam com `as never` em vez de corrigir.
 */
export type BinaryField<T, K extends keyof T> = Omit<T, K> & {
  readonly [P in K]: string | Blob | Uint8Array;
};

type RawConnection = components["schemas"]["Connection"];

/** Q1: `status` aceita `WHATSAPP_AUTH`, ausente do enum do contrato. */
export type Connection = RequiredBy<
  Omit<RawConnection, "status">,
  Exclude<keyof RawConnection, "status">
> & {
  readonly status: ConnectionStatus;
};

/**
 * Q18: `GET /api/connections` declara `Connection` (objeto único) na resposta
 * 200, mas o corpo real é uma lista — não existe `ConnectionList` no
 * contrato, ao contrário de todos os outros recursos.
 */
export interface ConnectionList {
  readonly connections: readonly Connection[];
}

type RawMessage = components["schemas"]["Message"];

/**
 * Q21 — corrigido com uma resposta real de `POST /api/send/{to}`
 * (id="3EB071E13637D7398E4911", subtype="text", isMedia=false,
 * myContact=false): nenhum dos quatro bate com o tipo documentado no
 * contrato. `from` fica opcional de propósito — ausente na amostra real.
 */
export type Message = RequiredBy<
  Omit<RawMessage, "id" | "subtype" | "isMedia" | "myContact">,
  "body" | "type" | "contactId" | "ticketId"
> & {
  /** Contrato declara `integer`; valor real é o ID da mensagem no WhatsApp (string). */
  readonly id: string;
  /** Contrato declara `integer`; valor real observado é string (ex.: `"text"`). */
  readonly subtype: string;
  /** Contrato declara `string`; valor real observado é boolean. */
  readonly isMedia: boolean;
  /** Contrato declara `string`; valor real observado é boolean. */
  readonly myContact: boolean;
};

/**
 * Q19 — CONFIRMADO com uma chamada real: `POST /api/send/{to}` embrulha a
 * resposta em `{ message: Message }` (a v0.7 estava certa; o contrato, que
 * declara `Message` puro, está errado).
 */
export interface SendMessageResult {
  readonly message: Message;
}

type RawMessageTemplate = components["schemas"]["MessageTemplate"];

/**
 * Q23 — observado em produção: `type`/`status` reais não batem com os enums
 * documentados (`type: "marketing-catalog"`, `status: "APPROVED"`). Sem
 * amostra suficiente para conhecer a taxonomia real inteira — widened para
 * `string` em vez de impor um enum que já se provou errado.
 */
export type MessageTemplate = Omit<RawMessageTemplate, "type" | "status"> & {
  readonly type: string;
  readonly status: string;
};

/**
 * Q22 — CONFIRMADO com uma chamada real: `GET /api/connections/{id}/templates`
 * declara `MessageTemplate` (objeto único) na resposta 200, mas o corpo real
 * é `{ templates: MessageTemplate[] }` — mesmo padrão de Q18.
 */
export interface TemplateList {
  readonly templates: readonly MessageTemplate[];
}

type RawSendTemplate = components["schemas"]["SendTemplate"];

/** Q3: `connectionFrom` tem `required: true` inline no schema — ignorado pelo codegen (Q2). */
export type SendTemplateData = RequiredBy<RawSendTemplate, "connectionFrom">;

type RawUploadTemp = components["schemas"]["UploadTemp"];

/**
 * Q3: `media` tem `required: true` inline — ignorado pelo codegen (único
 * campo do schema, `Required<>` builtin resolve isso). `format: binary`
 * também vira `string` puro no codegen — `BinaryField` aceita `Blob`/
 * `Uint8Array` de verdade, não só uma string já pronta.
 */
export type UploadTempData = BinaryField<Required<RawUploadTemp>, "media">;

type RawUploadTempResponse = components["schemas"]["UploadTempResponse"];

/** Q3: `url`/`filename`/`success` têm `required: true` inline — ignorado pelo codegen. Únicos campos do schema. */
export type UploadTempResponse = Required<RawUploadTempResponse>;

type RawSendMediaMessage = components["schemas"]["SendMediaMessage"];

/** `media` (`format: binary`) vira `string` puro no codegen — `Blob`/`Uint8Array` de verdade também são aceitos. */
export type SendMediaMessageData = BinaryField<RawSendMediaMessage, "media">;

type RawContactPostData = components["schemas"]["ContactPostData"];

/**
 * Q3: `name`/`number` têm `required: true` inline — ignorado pelo codegen.
 * Q24: `isGroup`/`blocked`/`noCheckNumber` têm `default: false` — o codegen
 * os marca obrigatórios (defaultNonNullable), mas o servidor aceita omissão.
 */
export type ContactPostData = RequiredBy<
  OptionalBy<RawContactPostData, "isGroup" | "blocked" | "noCheckNumber">,
  "name" | "number"
>;

type RawContactTagsPostData = components["schemas"]["ContactTagsPostData"];

/** Q24: `replaceTags`/`createTagIfNotExists` têm `default` — servidor aceita omissão. */
export type ContactTagsPostData = OptionalBy<
  RawContactTagsPostData,
  "replaceTags" | "createTagIfNotExists"
>;

type RawTicketResolveForm = components["schemas"]["TicketResolveForm"];

/** Q24: `feedbackOption` tem `default: "none"` — servidor aceita omissão. */
export type TicketResolveFormData = OptionalBy<RawTicketResolveForm, "feedbackOption">;

type RawWebhookPostData = components["schemas"]["WebhookPostData"];

/** Q24: `active` tem `default: true` — servidor aceita omissão. */
export type WebhookPostData = OptionalBy<RawWebhookPostData, "active">;

/**
 * Tipos "bare" — sem nenhum quirk conhecido que exija correção, então
 * derivados direto da resposta de `get()` (que sempre traz o objeto
 * completo, ao contrário de `list()`, cujo item de array pode ser mais
 * enxuto em alguns contratos). Sem prefixo `I`, ao contrário da v0.7
 * (`ITicket` → `Ticket`) — ver docs/MIGRATION.md.
 */
export type Ticket = ApiResponse<"GET /api/tickets/{id}">;
export type Contact = ApiResponse<"GET /api/contacts/{id}">;
export type Tag = ApiResponse<"GET /api/tags/{id}">;
export type Queue = ApiResponse<"GET /api/queues/{id}">;
export type User = ApiResponse<"GET /api/users/{id}">;
export type Webhook = ApiResponse<"GET /api/webhooks/{id}">;

export { CONNECTION_STATUS };
export type { ConnectionStatus };
export { isUsableConnectionStatus } from "./overrides";
