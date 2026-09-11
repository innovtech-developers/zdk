/**
 * Webhooks. `universal: false` na prática (§5.2/Q15) — ausente do swagger da
 * zapplataforma amostrada; `404` numa instância sem essa feature vira
 * `ZdkUnsupportedOperationError`, não erro genérico (T18).
 */

import { Resource } from "./resource";
import type { ApiParams, ApiResponse } from "../core/operation";
import type { WebhookPostData } from "../schema/types";

export class Webhooks extends Resource {
  async list(params?: ApiParams<"GET /api/webhooks">["query"]): Promise<ApiResponse<"GET /api/webhooks">> {
    return this.client.request("GET /api/webhooks", { query: params });
  }

  async get(id: number): Promise<ApiResponse<"GET /api/webhooks/{id}">> {
    return this.client.request("GET /api/webhooks/{id}", { pathParams: { id } });
  }

  /** Q24: `active` fica opcional de novo — tem `default: true`, o servidor aplica sozinho se omitido. */
  async create(data: WebhookPostData): Promise<ApiResponse<"POST /api/webhooks">> {
    return this.client.request("POST /api/webhooks", { json: data });
  }

  async update(
    id: number,
    data: WebhookPostData,
  ): Promise<ApiResponse<"PUT /api/webhooks/{id}">> {
    return this.client.request("PUT /api/webhooks/{id}", { pathParams: { id }, json: data });
  }

  async delete(id: number): Promise<ApiResponse<"DELETE /api/webhooks/{id}">> {
    return this.client.request("DELETE /api/webhooks/{id}", { pathParams: { id } });
  }
}
