/**
 * Templates de mensagem da API Oficial (tag `API Oficial` no swagger, além
 * de `Conexões` para `list`). `send`/`sendBulk` exigem uma conexão do tipo
 * `whatsapp-oficial` (obtida em `connections.list()`).
 */

import { Resource } from "./resource";
import type { ApiBody, ApiResponse } from "../core/operation";
import type { SendTemplateData, TemplateList } from "../schema/types";

export class Templates extends Resource {
  /**
   * `GET /api/connections/{id}/templates`.
   * @remarks Q22 — CONFIRMADO com chamada real: o contrato declara
   * `MessageTemplate` (objeto único), mas a resposta é
   * `{ templates: MessageTemplate[] }`. Divergência entre instâncias
   * (Q15-style): zapplataforma já corrigiu isso no próprio swagger,
   * zapcontabil não — a união herda a forma antiga, daí o override.
   */
  async list(connectionId: number): Promise<TemplateList["templates"]> {
    const response = await this.client.request("GET /api/connections/{id}/templates", {
      pathParams: { id: connectionId },
    });
    return (response as unknown as TemplateList).templates;
  }

  /** Q3: `connectionFrom` é obrigatório apesar do codegen marcar opcional. */
  async send(
    to: string,
    data: SendTemplateData,
  ): Promise<ApiResponse<"POST /api/send-template/{to}">> {
    return this.client.request("POST /api/send-template/{to}", { pathParams: { to }, json: data });
  }

  /** Resposta 200 com falha parcial por número — ver `results[].status` (Q10). */
  async sendBulk(
    data: ApiBody<"POST /api/send-template-bulk">,
  ): Promise<ApiResponse<"POST /api/send-template-bulk">> {
    return this.client.request("POST /api/send-template-bulk", { json: data });
  }
}
