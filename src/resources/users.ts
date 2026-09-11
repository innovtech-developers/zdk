/** Usuários (`Usuários`). Só leitura no contrato. */

import { Resource } from "./resource";
import type { ApiParams, ApiResponse } from "../core/operation";

export class Users extends Resource {
  async list(params?: ApiParams<"GET /api/users">["query"]): Promise<ApiResponse<"GET /api/users">> {
    return this.client.request("GET /api/users", { query: params });
  }

  async get(id: string): Promise<ApiResponse<"GET /api/users/{id}">> {
    return this.client.request("GET /api/users/{id}", { pathParams: { id } });
  }
}
