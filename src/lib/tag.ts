import type { IError, IParamsList, ITag, ITagList } from "../types";
import type { ZappyApi } from "../zappy-api";

export class Tag {
  constructor(protected api: ZappyApi) {}

  async list(params?: IParamsList): Promise<ITagList | IError> {
    try {
      const { page = 1, pageSize = 20 } = params || {};

      const response = await this.api.makeRequest(
        "GET",
        `/api/tags?page=${page}&pageSize=${pageSize}`
      );

      if (response?.error) return { error: response?.error };

      return response as ITagList;
    } catch (error) {
      console.error(error);

      return { error: "Unable to list tags" };
    }
  }

  async get(id: number): Promise<ITag | IError> {
    try {
      const response = await this.api.makeRequest("GET", `/api/tags/${id}`);

      if (response?.error) return { error: response?.error };

      return response as ITag;
    } catch (error) {
      console.error(error);

      return { error: "Unable to tag" };
    }
  }
}
