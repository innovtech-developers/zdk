import type { HttpMethod } from "./types";
import axios, { AxiosError } from "axios";

export class ZappyApi {
  private _rootUrl: string;
  private _token: string;

  constructor(rootUrl?: string, token?: string) {
    this._rootUrl = rootUrl || process.env?.ZAPPY_URL;
    this._token = token || process.env?.ZAPPY_TOKEN;
  }

  async makeRequest(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (!this._rootUrl || !this._token) {
      throw new Error("Missing base url or API token");
    }

    try {
      const url: string = this._rootUrl + endpoint;
      const options = {
        url,
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._token}`,
          ...customHeaders,
        },
        data,
      };
      const request = await axios(options);
      const response = await request.data;
      return response;
    } catch (error: unknown) {
      if (error instanceof AxiosError && "error" in error.response.data) {
        throw new Error(error?.response?.data?.error);
      }

      throw new Error("No request possible");
    }
  }
}
