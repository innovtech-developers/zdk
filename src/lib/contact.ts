import type { IContact, IContactList, IError, IParamsList } from "../types";
import type { ZappyApi } from "../zappy-api";

export class Contact {
  constructor(protected api: ZappyApi) {}

  async list(params?: IParamsList): Promise<IContactList | IError> {
    try {
      const { page = 1, pageSize = 20 } = params || {};

      const response = await this.api.makeRequest(
        "GET",
        `/api/contacts?page=${page}&pageSize=${pageSize}`
      );

      if (response?.error) return { error: response?.error };

      return response as IContactList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list contacts" };
    }
  }

  async get(id: number): Promise<IContact | IError> {
    try {
      const response = await this.api.makeRequest("GET", `/api/contacts/${id}`);

      if (response?.error) return { error: response?.error };

      return response as IContact;
    } catch (error) {
      console.error(error);

      return { error: "Unable to contact" };
    }
  }
}
