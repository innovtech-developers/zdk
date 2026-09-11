/**
 * Atendimentos (`Atendimentos`) — o maior recurso, 11 operações. Duas notas
 * de contrato que vale destacar por não serem óbvias à primeira vista:
 *  - `POST /api/tickets/{id}/send` devolve `Ticket`, não `Message` — ao
 *    contrário de `POST /api/send/{to}` (mensagem avulsa).
 *  - `POST /api/tickets/{id}/send-and-close` devolve `{ message, ticket }`
 *    — wrapper real, declarado no contrato (não é um caso Q19).
 */

import { Resource } from "./resource";
import type { ApiBody, ApiParams, ApiResponse } from "../core/operation";
import type { SendMediaMessageData } from "../schema/types";

/** `{image, video, audio, voice, document}` — direto do path do contrato. */
type MediaType = ApiParams<"POST /api/tickets/{id}/send/{type}">["path"]["type"];

/**
 * `files` do corpo de `send-and-close` é inline no swagger (não um schema
 * nomeado) e vira `string[]` no codegen (`format: binary`) — widened para
 * aceitar `Blob`/`Uint8Array` de verdade, mesmo caso de `BinaryField` em
 * `schema/types.ts`, só que local por não ser um schema compartilhado.
 */
type SendAndCloseData = Omit<ApiBody<"POST /api/tickets/{id}/send-and-close">, "files"> & {
  readonly files?: readonly (string | Blob | Uint8Array)[];
};

export class Tickets extends Resource {
  async list(params?: ApiParams<"GET /api/tickets">["query"]): Promise<ApiResponse<"GET /api/tickets">> {
    return this.client.request("GET /api/tickets", { query: params });
  }

  async searchByContact(
    contactNumber: string,
    params?: { readonly page?: number; readonly pageSize?: number },
  ): Promise<ApiResponse<"GET /api/tickets/search-by-contact">> {
    return this.client.request("GET /api/tickets/search-by-contact", {
      query: { contactNumber, ...params },
    });
  }

  async get(id: number): Promise<ApiResponse<"GET /api/tickets/{id}">> {
    return this.client.request("GET /api/tickets/{id}", { pathParams: { id } });
  }

  async update(
    id: number,
    data: ApiBody<"PUT /api/tickets/{id}">,
  ): Promise<ApiResponse<"PUT /api/tickets/{id}">> {
    return this.client.request("PUT /api/tickets/{id}", { pathParams: { id }, json: data });
  }

  async transfer(
    id: number,
    data: ApiBody<"POST /api/tickets/{id}/transfer">,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/transfer">> {
    return this.client.request("POST /api/tickets/{id}/transfer", { pathParams: { id }, json: data });
  }

  /** `feedbackOption: "send-end-message"` dispara mensagem de encerramento ao contato — é por isso que esta operação é `unsafe` em `operation-metadata.ts`. */
  async resolve(
    id: number,
    data: ApiBody<"POST /api/tickets/{id}/resolve">,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/resolve">> {
    return this.client.request("POST /api/tickets/{id}/resolve", { pathParams: { id }, json: data });
  }

  /** Devolve o `Ticket` atualizado, não a `Message` enviada — conforme o contrato. */
  async sendText(
    id: number,
    data: ApiBody<"POST /api/tickets/{id}/send">,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/send">> {
    return this.client.request("POST /api/tickets/{id}/send", { pathParams: { id }, json: data });
  }

  /** Multipart — arquivo binário (Q20). */
  async sendMedia(
    id: number,
    type: MediaType,
    data: SendMediaMessageData,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/send/{type}">> {
    return this.client.request("POST /api/tickets/{id}/send/{type}", {
      pathParams: { id, type },
      multipart: data,
    });
  }

  /** Json — mídia por URL (Q20). */
  async sendMediaByUrl(
    id: number,
    type: MediaType,
    data: ApiBody<"POST /api/tickets/{id}/send/{type}", "application/json">,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/send/{type}">> {
    return this.client.request("POST /api/tickets/{id}/send/{type}", {
      pathParams: { id, type },
      json: data,
    });
  }

  /** Só multipart no contrato — sem variante json. Resposta vem embrulhada: `{ message, ticket }`. */
  async sendAndClose(
    id: number,
    data: SendAndCloseData,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/send-and-close">> {
    return this.client.request("POST /api/tickets/{id}/send-and-close", {
      pathParams: { id },
      multipart: data,
    });
  }

  /** Janela de 24h da API Oficial: `canSendMessageWithOficialApi`. */
  async info(id: number): Promise<ApiResponse<"GET /api/tickets/{id}/info">> {
    return this.client.request("GET /api/tickets/{id}/info", { pathParams: { id } });
  }

  /** Q4: `id` é obrigatório aqui apesar do contrato marcá-lo como parâmetro opcional. */
  async sendTemplate(
    id: number,
    data: ApiBody<"POST /api/tickets/{id}/send-template">,
  ): Promise<ApiResponse<"POST /api/tickets/{id}/send-template">> {
    return this.client.request("POST /api/tickets/{id}/send-template", {
      pathParams: { id },
      json: data,
    });
  }
}
