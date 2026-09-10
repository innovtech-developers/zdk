/** Tags (`Tags`). CRUD simples. */

import { Resource } from "./resource";
import type { ApiBody, ApiParams, ApiResponse } from "../core/operation";

export class Tags extends Resource {
  async list(params?: ApiParams<"GET /api/tags">["query"]): Promise<ApiResponse<"GET /api/tags">> {
    return this.client.request("GET /api/tags", { query: params });
  }

  async get(id: string): Promise<ApiResponse<"GET /api/tags/{id}">> {
    return this.client.request("GET /api/tags/{id}", { pathParams: { id } });
  }

  /** `POST /api/tags/` — barra final, como o contrato declara. */
  async create(data: ApiBody<"POST /api/tags/">): Promise<ApiResponse<"POST /api/tags/">> {
    return this.client.request("POST /api/tags/", { json: data });
  }

  async update(
    id: string,
    data: ApiBody<"PUT /api/tags/{id}">,
  ): Promise<ApiResponse<"PUT /api/tags/{id}">> {
    return this.client.request("PUT /api/tags/{id}", { pathParams: { id }, json: data });
  }
}
