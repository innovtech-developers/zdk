/**
 * Dashboard. Os três relatórios aceitam `userIds[]`/`queueIds[]`/`tagIds[]`
 * como filtro — arrays de verdade, serializados como entradas repetidas da
 * mesma chave por `request-builder.ts` (extensão feita em T25).
 */

import { Resource } from "./resource";
import type { ApiParams, ApiResponse } from "../core/operation";

export class Dashboard extends Resource {
  async ticketsByAgent(
    params: NonNullable<ApiParams<"GET /api/dashboard/tickets-por-atendente">["query"]>,
  ): Promise<ApiResponse<"GET /api/dashboard/tickets-por-atendente">> {
    return this.client.request("GET /api/dashboard/tickets-por-atendente", { query: params });
  }

  async ticketsByQualification(
    params: NonNullable<ApiParams<"GET /api/dashboard/tickets-por-qualificacao">["query"]>,
  ): Promise<ApiResponse<"GET /api/dashboard/tickets-por-qualificacao">> {
    return this.client.request("GET /api/dashboard/tickets-por-qualificacao", { query: params });
  }

  async ticketsGrouped(
    params: NonNullable<ApiParams<"GET /api/dashboard/tickets-agrupados">["query"]>,
  ): Promise<ApiResponse<"GET /api/dashboard/tickets-agrupados">> {
    return this.client.request("GET /api/dashboard/tickets-agrupados", { query: params });
  }
}
