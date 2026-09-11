import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Templates } from "../../src/resources/templates";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeTemplates(httpClient: FakeHttpClient): Templates {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Templates(client);
}

describe("Templates.list — Q22 confirmado com chamada real: desembrulha { templates: [...] }", () => {
  it("GET /api/connections/{id}/templates", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({
      status: 200,
      body: { templates: [{ id: 160, name: "boas_vindas", status: "APPROVED", type: "marketing-catalog" }] },
    });
    const templates = makeTemplates(httpClient);

    const result = await templates.list(573);

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/connections/573/templates`);
    expect(result).toEqual([{ id: 160, name: "boas_vindas", status: "APPROVED", type: "marketing-catalog" }]);
  });
});

describe("Templates.send", () => {
  it("POST /api/send-template/{to} com connectionFrom (Q3)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "1", body: "template" } });
    const templates = makeTemplates(httpClient);

    const data = { connectionFrom: 573, templateId: "160" };
    await templates.send("5511999999999", data as never);

    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/send-template/5511999999999`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
  });
});

describe("Templates.sendBulk — falha parcial por número (Q10)", () => {
  it("POST /api/send-template-bulk devolve results[] com sucesso e erro misturados", async () => {
    const httpClient = new FakeHttpClient();
    const resultBody = {
      results: [
        { to: "5511999999999", status: "success", message: { id: "1" } },
        { to: "5511888888888", status: "error", error: "ERR_NOT_OFICIAL_CONNECTION" },
      ],
    };
    httpClient.enqueue({ status: 200, body: resultBody });
    const templates = makeTemplates(httpClient);

    const data = { to: ["5511999999999", "5511888888888"], connectionFrom: 573, templateId: "160" };
    const result = await templates.sendBulk(data as never);

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/send-template-bulk`);
    expect(result).toEqual(resultBody);
  });
});
