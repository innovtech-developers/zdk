import { ZappyApi } from "../zappy-api";
import type { IConnection, IConnectionList, IError } from "../types";

export class Connection {
  constructor(protected api: ZappyApi) { }

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

      const connections = response?.connections as IConnection[];
      if (!connections || connections.length === 0) {
        return { error: "No connections available" };
      }

      const connectionExists = connections.find(
        (connection: IConnection) => connection.id === id
      );

      const isValidConnection = (conn: IConnection) => conn.status === "CONNECTED" || conn.status === "WHATSAPP_AUTH";
      if (!connectionExists || !isValidConnection(connectionExists)) {
        const validConnection = connections?.find(
          (connection: IConnection) => isValidConnection(connection)
        );

        if (!validConnection) return { error: "Connection not found" };

        return validConnection;
      }

      return connectionExists;
    } catch (error) {
      console.error(error);

      return { error: "Unable to get connection" };
    }
  }
}