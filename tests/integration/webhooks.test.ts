import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Webhooks } from "../../src/resources/webhooks";
import { ZdkUnsupportedOperationError } from "../../src/core/errors";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeWebhooks(httpClient: FakeHttpClient): Webhooks {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Webhooks(client);
}

describe("Webhooks — CRUD", () => {
  it("list(): GET /api/webhooks com page/search", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { webhooks: [] } });
    await makeWebhooks(httpClient).list({ page: 1, search: "crm" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/webhooks?page=1&search=crm`);
  });

  it("get(): GET /api/webhooks/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, name: "CRM" } });
    const result = await makeWebhooks(httpClient).get(1);
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/webhooks/1`);
    expect(result).toEqual({ id: 1, name: "CRM" });
  });

  it("create(): POST /api/webhooks", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 2, name: "Novo" } });
    const data = { name: "Novo", url: "https://exemplo.com/hook", urlType: "static", type: "message" };
    await makeWebhooks(httpClient).create(data);
    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/webhooks`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
  });

  it("update(): PUT /api/webhooks/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 2, name: "Renomeado" } });
    const data = { name: "Renomeado", url: "https://exemplo.com/hook", urlType: "static", type: "message" };
    await makeWebhooks(httpClient).update(2, data);
    expect(httpClient.calls[0]?.method).toBe("PUT");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/webhooks/2`);
  });

  it("delete(): DELETE /api/webhooks/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 2 } });
    await makeWebhooks(httpClient).delete(2);
    expect(httpClient.calls[0]?.method).toBe("DELETE");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/webhooks/2`);
  });
});

describe("Webhooks — universal:false na prática (Q15): ausente do swagger da zapplataforma amostrada", () => {
  it("404 contra uma instância sem a feature vira ZdkUnsupportedOperationError, não erro genérico", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 404, body: { error: "ERR_NOT_FOUND" } }); // 1ª: chamada real
    httpClient.enqueue({
      status: 200,
      body: { paths: { "/api/connections": { get: {} } } }, // 2ª: swagger da instância, SEM webhooks
    });
    const webhooks = makeWebhooks(httpClient);

    try {
      await webhooks.list();
      expect.unreachable();
    } catch (error) {
      expect(httpClient.requestCount).toBe(2);
      expect(error).toBeInstanceOf(ZdkUnsupportedOperationError);
      expect((error as ZdkUnsupportedOperationError).operation).toBe("GET /api/webhooks");
    }
  });
});
