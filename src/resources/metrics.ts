/** Métricas de mensagens. */

import { Resource } from "./resource";
import type { ApiParams, ApiResponse } from "../core/operation";

export class Metrics extends Resource {
  async messages(
    params?: ApiParams<"GET /api/metrics/messages">["query"],
  ): Promise<ApiResponse<"GET /api/metrics/messages">> {
    return this.client.request("GET /api/metrics/messages", { query: params });
  }
}
