/**
 * Mensagens (`Mensagens`). `list()` corrige a classe de bug do v0.7
 * (`src/lib/message.ts` mandava `dateToo=` em vez de `dateTo=`) por
 * construção: os nomes de query vêm direto do tipo gerado do contrato, nunca
 * digitados à mão duas vezes.
 */

import { Resource } from "./resource";
import type { ApiBody, ApiParams, ApiResponse } from "../core/operation";

/** `{image, video, audio, voice, document}` — direto do path do contrato. */
type MediaType = ApiParams<"POST /api/send/{type}/{to}">["path"]["type"];

export class Messages extends Resource {
  async list(params?: ApiParams<"GET /api/messages">["query"]): Promise<ApiResponse<"GET /api/messages">> {
    return this.client.request("GET /api/messages", { query: params });
  }

  async get(id: string): Promise<ApiResponse<"GET /api/messages/{id}">> {
    return this.client.request("GET /api/messages/{id}", { pathParams: { id } });
  }

  /**
   * `POST /api/send/{to}`.
   * @remarks Q19 (em aberto): o contrato declara a resposta como `Message`
   * puro — sem o wrapper `{message:...}` que a v0.7 assumia. Ainda não
   * confirmado com uma chamada real e autenticada; o tipo aqui segue o
   * contrato até essa confirmação (ver Open Questions da spec).
   */
  async sendText(
    to: string,
    data: ApiBody<"POST /api/send/{to}">,
  ): Promise<ApiResponse<"POST /api/send/{to}">> {
    return this.client.request("POST /api/send/{to}", { pathParams: { to }, json: data });
  }

  /** `POST /api/send/{type}/{to}`, multipart — arquivo binário (Q20). */
  async sendMedia(
    to: string,
    type: MediaType,
    data: ApiBody<"POST /api/send/{type}/{to}", "multipart/form-data">,
  ): Promise<ApiResponse<"POST /api/send/{type}/{to}">> {
    return this.client.request("POST /api/send/{type}/{to}", {
      pathParams: { type, to },
      multipart: data,
    });
  }

  /**
   * `POST /api/send/{type}/{to}`, json — mídia por URL, sem subir bytes
   * pelo SDK (Q20; capacidade que a v0.7 nunca implementou).
   */
  async sendMediaByUrl(
    to: string,
    type: MediaType,
    data: ApiBody<"POST /api/send/{type}/{to}", "application/json">,
  ): Promise<ApiResponse<"POST /api/send/{type}/{to}">> {
    return this.client.request("POST /api/send/{type}/{to}", {
      pathParams: { type, to },
      json: data,
    });
  }

  /**
   * `POST /api/messages/multiple/{to}`. Com `files`, vai multipart — e
   * `messages` é serializado como JSON string só nessa variante (Q7; a
   * variante json aceita o array direto, sem serialização). Sem `files`,
   * vai json puro.
   */
  async sendMany(
    to: string,
    messages: ApiBody<"POST /api/messages/multiple/{to}", "application/json">["messages"],
    files?: readonly (Blob | Uint8Array)[],
  ): Promise<ApiResponse<"POST /api/messages/multiple/{to}">> {
    if (files && files.length > 0) {
      return this.client.request("POST /api/messages/multiple/{to}", {
        pathParams: { to },
        multipart: { messages: JSON.stringify(messages), files },
      });
    }
    return this.client.request("POST /api/messages/multiple/{to}", {
      pathParams: { to },
      json: { messages },
    });
  }
}
