/**
 * Contatos (`Contatos`). CRUD simples — sem quirk de resposta a corrigir
 * aqui: `ContactList`/`Contact` já existem como schemas próprios (ao
 * contrário de Q18, que é exclusivo de `Connection`).
 */

import { Resource } from "./resource";
import type { ApiBody, ApiParams, ApiResponse } from "../core/operation";

export class Contacts extends Resource {
  async list(
    params?: ApiParams<"GET /api/contacts">["query"],
  ): Promise<ApiResponse<"GET /api/contacts">> {
    return this.client.request("GET /api/contacts", { query: params });
  }

  async get(id: number): Promise<ApiResponse<"GET /api/contacts/{id}">> {
    return this.client.request("GET /api/contacts/{id}", { pathParams: { id } });
  }

  /** `POST /api/contacts/` — barra final, como o contrato declara. */
  async create(
    data: ApiBody<"POST /api/contacts/">,
  ): Promise<ApiResponse<"POST /api/contacts/">> {
    return this.client.request("POST /api/contacts/", { json: data });
  }

  async update(
    id: number,
    data: ApiBody<"PUT /api/contacts/{id}">,
  ): Promise<ApiResponse<"PUT /api/contacts/{id}">> {
    return this.client.request("PUT /api/contacts/{id}", { pathParams: { id }, json: data });
  }

  /**
   * `PUT /api/contacts/{id}/tags`. Aceita `tagIds` e/ou `tags` (nome+cor de
   * tag nova), `replaceTags` (default: adiciona, não substitui) e
   * `createTagIfNotExists` — o schema real (`ContactTagsPostData`) é mais
   * rico do que só uma lista de ids.
   */
  async setTags(
    id: number,
    data: ApiBody<"PUT /api/contacts/{id}/tags">,
  ): Promise<ApiResponse<"PUT /api/contacts/{id}/tags">> {
    return this.client.request("PUT /api/contacts/{id}/tags", { pathParams: { id }, json: data });
  }
}
