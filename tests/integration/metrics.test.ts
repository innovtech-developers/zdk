import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Metrics } from "../../src/resources/metrics";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeMetrics(httpClient: FakeHttpClient): Metrics {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Metrics(client);
}

describe("Metrics.messages", () => {
  it("GET /api/metrics/messages com dateFrom/dateTo opcionais", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { messages: { total: 1184 } } });
    const result = await makeMetrics(httpClient).messages({ dateFrom: "2026-01-01", dateTo: "2026-01-31" });

    expect(httpClient.calls[0]?.url).toBe(
      `${BASE_URL}/api/metrics/messages?dateFrom=2026-01-01&dateTo=2026-01-31`,
    );
    expect(result).toEqual({ messages: { total: 1184 } });
  });

  it("sem params: sem query string", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    await makeMetrics(httpClient).messages();
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/metrics/messages`);
  });
});
