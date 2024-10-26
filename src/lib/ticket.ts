import type {
  IError,
  IParamsList,
  ITicket,
  ITicketList,
  ITicketResolveForm,
  ITicketTransferForm,
  ITicketUpdateForm,
} from "../types";
import type { ZappyApi } from "../zappy-api";

export class Ticket {
  constructor(protected api: ZappyApi) {}

  async list(params?: IParamsList): Promise<ITicketList | IError> {
    try {
      const { page = 1, pageSize = 20 } = params || {};

      const response = await this.api.makeRequest(
        "GET",
        `/api/tickets?page=${page}&pageSize=${pageSize}`
      );

      if (response?.error) return { error: response?.error };

      return response as ITicketList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list tickets" };
    }
  }

  async get(id: number): Promise<ITicket | IError> {
    try {
      const response = await this.api.makeRequest("GET", `/api/tickets/${id}`);

      if (response?.error) return { error: response?.error };

      return response as ITicket;
    } catch (error) {
      console.error(error);

      return { error: "Unable to ticket" };
    }
  }

  async transfer(
    id: number,
    data: ITicketTransferForm
  ): Promise<ITicket | IError> {
    try {
      const response = await this.api.makeRequest(
        "POST",
        `/api/tickets/${id}/transfer`,
        data
      );

      if (response?.error) return { error: response?.error };

      return response as ITicket;
    } catch (error) {
      console.error(error);

      return { error: "Cannot transfer ticket" };
    }
  }

  async resolve(
    id: number,
    data: ITicketResolveForm
  ): Promise<ITicket | IError> {
    try {
      const response = await this.api.makeRequest(
        "POST",
        `/api/tickets/${id}/resolve`,
        data
      );

      if (response?.error) return { error: response?.error };

      return response as ITicket;
    } catch (error) {
      console.error(error);

      return { error: "Cannot resolve ticket" };
    }
  }

  async update(id: number, data: ITicketUpdateForm): Promise<ITicket | IError> {
    try {
      const response = await this.api.makeRequest(
        "PUT",
        `/api/tickets/${id}`,
        data
      );

      if (response?.error) return { error: response?.error };

      return response as ITicket;
    } catch (error) {
      console.error(error);

      return { error: "Cannot update ticket" };
    }
  }
}
