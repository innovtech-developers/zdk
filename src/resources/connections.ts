/**
 * Conexões (`Conexões` no swagger). `list()` é a única operação real do
 * contrato (`GET /api/connections`); `get`/`findUsable` são helpers
 * resolvidos no cliente — não existe `GET /api/connections/{id}` (§5.5).
 */

import { Resource } from "./resource";
import { ZdkNotFoundError } from "../core/errors";
import { isUsableConnectionStatus } from "../schema/overrides";
import type { Connection, ConnectionList } from "../schema/types";

export class Connections extends Resource {
  /**
   * `GET /api/connections`. Q18: o contrato declara um `Connection` único na
   * resposta; o corpo real é `{ connections: Connection[] }` — corrigido
   * aqui (não existe `ConnectionList` gerado para desembrulhar sozinho).
   */
  async list(): Promise<readonly Connection[]> {
    const response = await this.client.request("GET /api/connections");
    return (response as unknown as ConnectionList).connections;
  }

  /**
   * Busca **estrita** por `id` — nunca devolve outra conexão, seja qual for
   * o `status` dela.
   * @throws {ZdkNotFoundError} nenhuma conexão com esse `id`.
   */
  async get(id: number): Promise<Connection> {
    const connections = await this.list();
    const found = connections.find((connection) => connection.id === id);
    if (!found) {
      throw new ZdkNotFoundError(`conexão ${id} não encontrada`, "ZDK_CONNECTION_NOT_FOUND", {
        status: 404,
        payload: { availableIds: connections.map((connection) => connection.id) },
      });
    }
    return found;
  }

  /**
   * Devolve `preferredId` se ela estiver utilizável (`CONNECTED` ou
   * `WHATSAPP_AUTH`); senão a primeira conexão utilizável da lista. Sem
   * `preferredId`, vai direto para a primeira utilizável.
   * @throws {ZdkNotFoundError} nenhuma conexão utilizável.
   */
  async findUsable(preferredId?: number): Promise<Connection> {
    const connections = await this.list();

    if (preferredId !== undefined) {
      const preferred = connections.find((connection) => connection.id === preferredId);
      if (preferred && isUsableConnectionStatus(preferred.status)) return preferred;
    }

    const usable = connections.find((connection) => isUsableConnectionStatus(connection.status));
    if (!usable) {
      throw new ZdkNotFoundError(
        "nenhuma conexão utilizável (CONNECTED ou WHATSAPP_AUTH)",
        "ZDK_NO_USABLE_CONNECTION",
        {
          status: 404,
          payload: { connections: connections.map((c) => ({ id: c.id, status: c.status })) },
        },
      );
    }
    return usable;
  }
}
