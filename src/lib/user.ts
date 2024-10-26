import type { IError, IParamsList, IUser, IUserList } from "../types";
import type { ZappyApi } from "../zappy-api";

export class User {
  constructor(protected api: ZappyApi) {}

  async list(params?: IParamsList): Promise<IUserList | IError> {
    try {
      const { page = 1, pageSize = 20 } = params || {};

      const response = await this.api.makeRequest(
        "GET",
        `/api/users?page=${page}&pageSize=${pageSize}`
      );

      if (response?.error) return { error: response?.error };

      return response as IUserList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list users" };
    }
  }

  async get(id: number): Promise<IUser | IError> {
    try {
      const response = await this.api.makeRequest("GET", `/api/users/${id}`);

      if (response?.error) return { error: response?.error };

      return response as IUser;
    } catch (error) {
      console.error(error);

      return { error: "Unable to user" };
    }
  }
}
