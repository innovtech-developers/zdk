import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Queues } from "../../src/resources/queues";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeQueues(httpClient: FakeHttpClient): Queues {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Queues(client);
}

describe("Queues", () => {
  it("list(): GET /api/queues", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { queues: [] } });
    await makeQueues(httpClient).list({ page: 1, pageSize: 20 });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/queues?page=1&pageSize=20`);
  });

  it("get(): GET /api/queues/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "1", name: "Vendas" } });
    const result = await makeQueues(httpClient).get("1");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/queues/1`);
    expect(result).toEqual({ id: "1", name: "Vendas" });
  });

  it("create(): POST /api/queues", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "2", name: "Suporte", color: "#00FF00" } });
    const data = { name: "Suporte", color: "#00FF00" };
    await makeQueues(httpClient).create(data as never);
    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/queues`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
  });

  it("update(): PUT /api/queues/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "2", name: "Renomeado" } });
    await makeQueues(httpClient).update("2", { name: "Renomeado", color: "#FF0000" } as never);
    expect(httpClient.calls[0]?.method).toBe("PUT");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/queues/2`);
  });

  it("createMany(): POST /api/many-queues com corpo e resposta em array cru", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: [{ id: "1", name: "A" }, { id: "2", name: "B" }] });
    const data = [{ name: "A", color: "#00FF00" }, { name: "B", color: "#0000FF" }];
    const result = await makeQueues(httpClient).createMany(data as never);
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/many-queues`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
    expect(result).toEqual([{ id: "1", name: "A" }, { id: "2", name: "B" }]);
  });

  it("listWithUsers(): GET /api/queue-users com search", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: [{ id: 5, name: "Vendas", users: [] }] });
    await makeQueues(httpClient).listWithUsers({ search: "vendas" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/queue-users?search=vendas`);
  });
});
