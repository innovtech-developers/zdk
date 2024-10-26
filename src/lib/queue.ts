import type { IError, IParamsList, IQueue, IQueueList } from "../types";
import type { ZappyApi } from "../zappy-api";

export class Queue {
  constructor(protected api: ZappyApi) {}

  async list(params?: IParamsList): Promise<IQueueList | IError> {
    try {
      const { page = 1, pageSize = 20 } = params || {};

      const response = await this.api.makeRequest(
        "GET",
        `/api/queues?page=${page}&pageSize=${pageSize}`
      );

      if (response?.error) return { error: response?.error };

      return response as IQueueList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list queues" };
    }
  }

  async get(id: number): Promise<IQueue | IError> {
    try {
      const response = await this.api.makeRequest("GET", `/api/queues/${id}`);

      if (response?.error) return { error: response?.error };

      return response as IQueue;
    } catch (error) {
      console.error(error);

      return { error: "Unable to queue" };
    }
  }
}
