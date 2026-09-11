import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Dashboard } from "../../src/resources/dashboard";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeDashboard(httpClient: FakeHttpClient): Dashboard {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Dashboard(client);
}

describe("Dashboard.ticketsByAgent", () => {
  it("startDate/endDate obrigatórios, userIds[]/queueIds[]/tagIds[] como array de verdade", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: [] });
    await makeDashboard(httpClient).ticketsByAgent({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      "userIds[]": [1, 2],
    });

    const url = new URL(httpClient.calls[0]?.url ?? "");
    expect(url.searchParams.get("startDate")).toBe("2026-01-01");
    expect(url.searchParams.get("endDate")).toBe("2026-01-31");
    expect(url.searchParams.getAll("userIds[]")).toEqual(["1", "2"]);
  });
});

describe("Dashboard.ticketsByQualification", () => {
  it("GET /api/dashboard/tickets-por-qualificacao", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: [] });
    await makeDashboard(httpClient).ticketsByQualification({ startDate: "2026-01-01", endDate: "2026-01-31" });
    expect(httpClient.calls[0]?.url).toContain("/api/dashboard/tickets-por-qualificacao");
  });
});

describe("Dashboard.ticketsGrouped", () => {
  it("GET /api/dashboard/tickets-agrupados com dimensao obrigatória", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: [] });
    await makeDashboard(httpClient).ticketsGrouped({
      dimensao: "tag",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      "tagIds[]": [5, 6, 7],
    });

    const url = new URL(httpClient.calls[0]?.url ?? "");
    expect(url.searchParams.get("dimensao")).toBe("tag");
    expect(url.searchParams.getAll("tagIds[]")).toEqual(["5", "6", "7"]);
  });
});
