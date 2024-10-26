import type {
  IError,
  IMessage,
  IMessageList,
  IParamsMessageList,
  ISendMessage,
  MediaType,
} from "../types";

import type { ZappyApi } from "../zappy-api";

export class Message {
  constructor(protected api: ZappyApi) {}

  async list(params?: IParamsMessageList): Promise<IMessageList | IError> {
    try {
      const {
        page = 1,
        pageSize = 20,
        ticketId = "",
        contactId = "",
        dateFrom = "",
        dateTo = "",
      } = params || {};

      const response = await this.api.makeRequest(
        "GET",
        `/api/messages?page=${page}&pageSize=${pageSize}&ticketId=${ticketId}&contactId=${contactId}&dateFrom=${dateFrom}&dateToo=${dateTo}`
      );

      if (response?.error) return { error: response?.error };

      return response as IMessageList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list message" };
    }
  }

  async get(id: string): Promise<IMessage | IError> {
    try {
      const response = await this.api.makeRequest("GET", `/api/messages/${id}`);

      if (response?.error) return { error: response?.error };

      return response as IMessage;
    } catch (error) {
      console.error(error);

      return { error: "Unable to message" };
    }
  }

  async send(to: string, data: ISendMessage, type?: MediaType) {
    try {
      if (!type || type === "text") {
        const response = await this.api.makeRequest(
          "POST",
          `/api/send/${to}`,
          data
        );

        return response;
      }
    } catch (error) {
      console.error(error);

      return { error: "Cannot send message" };
    }
  }
}
