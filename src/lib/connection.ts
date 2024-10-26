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

      const connections = response?.connections as IConnection[];

      const connectionExists = connections.find(
        (connection: IConnection) => connection.id === id
      );

      if (!connectionExists || connectionExists?.status !== "CONNECTED") {
        const validConnection = connections?.find(
          (connection: IConnection) => connection?.status === "CONNECTED"
        );

        if (!validConnection) return { error: "Connection not found" };

        return validConnection;
      }
    } catch (error) {
      console.error(error);

      return { error: "Unable to connection" };
    }
  }
}
