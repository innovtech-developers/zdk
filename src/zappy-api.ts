import type { HttpMethod } from "./types";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    contentType?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (!this._rootUrl || !this._token) {
      throw new Error("Missing base url or API token");
    }

    const fullUrl: string = this._rootUrl + endpoint;
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this._token}`,
        "Content-Type": contentType ?? "application/json",
      },
      body: body
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined,
    };

    const request = await fetch(fullUrl, options);

    const response = await request.json();

    return response;
  }
}
