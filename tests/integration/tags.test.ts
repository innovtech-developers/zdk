import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Tags } from "../../src/resources/tags";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeTags(httpClient: FakeHttpClient): Tags {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Tags(client);
}

describe("Tags.list", () => {
  it("GET /api/tags com query", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { tags: [] } });
    const tags = makeTags(httpClient);

    await tags.list({ page: 1, pageSize: 20 });

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tags?page=1&pageSize=20`);
  });
});

describe("Tags.get", () => {
  it("GET /api/tags/{id} — id é string no contrato", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "abc123", name: "Urgente" } });
    const tags = makeTags(httpClient);

    const result = await tags.get("abc123");

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tags/abc123`);
    expect(result).toEqual({ id: "abc123", name: "Urgente" });
  });
});

describe("Tags.create", () => {
  it("POST /api/tags/ com barra final", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "x", name: "Nova", color: "#FF0000" } });
    const tags = makeTags(httpClient);

    const data = { name: "Nova", color: "#FF0000" };
    await tags.create(data as never);

    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tags/`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
  });
});

describe("Tags.update", () => {
  it("PUT /api/tags/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "abc123", name: "Renomeada" } });
    const tags = makeTags(httpClient);

    await tags.update("abc123", { name: "Renomeada" } as never);

    expect(httpClient.calls[0]?.method).toBe("PUT");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tags/abc123`);
  });
});
