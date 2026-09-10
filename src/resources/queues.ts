/** Setores (`Setores`). `QueuePostData` já declara `required` corretamente no contrato — sem quirk aqui. */

import { Resource } from "./resource";
import type { ApiBody, ApiParams, ApiResponse } from "../core/operation";

export class Queues extends Resource {
  async list(params?: ApiParams<"GET /api/queues">["query"]): Promise<ApiResponse<"GET /api/queues">> {
    return this.client.request("GET /api/queues", { query: params });
  }

  async get(id: string): Promise<ApiResponse<"GET /api/queues/{id}">> {
    return this.client.request("GET /api/queues/{id}", { pathParams: { id } });
  }

  async create(data: ApiBody<"POST /api/queues">): Promise<ApiResponse<"POST /api/queues">> {
    return this.client.request("POST /api/queues", { json: data });
  }

  async update(
    id: string,
    data: ApiBody<"PUT /api/queues/{id}">,
  ): Promise<ApiResponse<"PUT /api/queues/{id}">> {
    return this.client.request("PUT /api/queues/{id}", { pathParams: { id }, json: data });
  }

  /** `POST /api/many-queues` — cria vários setores de uma vez; corpo e resposta são arrays crus. */
  async createMany(data: ApiBody<"POST /api/many-queues">): Promise<ApiResponse<"POST /api/many-queues">> {
    return this.client.request("POST /api/many-queues", { json: data });
  }

  /** `GET /api/queue-users` — setores com os usuários vinculados. */
  async listWithUsers(
    params?: ApiParams<"GET /api/queue-users">["query"],
  ): Promise<ApiResponse<"GET /api/queue-users">> {
    return this.client.request("GET /api/queue-users", { query: params });
  }
}
