import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Users } from "../../src/resources/users";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeUsers(httpClient: FakeHttpClient): Users {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Users(client);
}

describe("Users", () => {
  it("list(): GET /api/users com page/pageSize/search", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { users: [] } });
    await makeUsers(httpClient).list({ page: 1, pageSize: 20, search: "maria" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/users?page=1&pageSize=20&search=maria`);
  });

  it("get(): GET /api/users/{id} — id é string", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "u1", name: "Maria" } });
    const result = await makeUsers(httpClient).get("u1");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/users/u1`);
    expect(result).toEqual({ id: "u1", name: "Maria" });
  });
});
