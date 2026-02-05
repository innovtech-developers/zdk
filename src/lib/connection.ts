import { ZappyApi } from "../zappy-api";
import type { IConnection, IConnectionList, IError } from "../types";

export class Connection {
  constructor(protected api: ZappyApi) {}

  async list(): Promise<IConnectionList | IError> {
    try {
      const response = await this.api.makeRequest("GET", "/api/connections");

      return response as IConnectionList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list connections" };
    }
  }

  async get(id?: number): Promise<IConnection | IError> {
    try {
      const response = await this.api.makeRequest("GET", "/api/connections");

      const connections = Array.isArray(response?.connections)
        ? (response.connections as IConnection[])
        : [];

      const isValidConnection = (conn: IConnection) => {
        const status = (conn?.status || "").toString().trim().toUpperCase();
        return status === "CONNECTED" || status === "WHATSAPP_AUTH";
      };

      const idNum = id == null ? undefined : Number(id);

      const connectionExists = typeof idNum === "number" && !Number.isNaN(idNum)
        ? connections.find((connection: IConnection) => connection.id === idNum)
        : undefined;

      if (connectionExists && isValidConnection(connectionExists)) {
        return connectionExists;
      }

      const validConnection = connections.find((connection: IConnection) => isValidConnection(connection))
        || connections.find((connection: IConnection) => connection.isDefault === true);

      if (!validConnection) return { error: "Connection not found" };

      return validConnection;
    } catch (error) {
      console.error(error);

      return { error: "Unable to get connection" };
    }
  }
}
