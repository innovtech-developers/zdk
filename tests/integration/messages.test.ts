import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Messages } from "../../src/resources/messages";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeMessages(httpClient: FakeHttpClient): Messages {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Messages(client);
}

describe("Messages.list — regressão do bug dateToo (v0.7 src/lib/message.ts)", () => {
  it("dateFrom/dateTo saem com o nome CERTO na query, nunca dateToo", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { messages: [] } });
    const messages = makeMessages(httpClient);

    await messages.list({ dateFrom: "2025-01-01", dateTo: "2026-01-01", ticketId: "42" });

    const url = httpClient.calls[0]?.url ?? "";
    expect(url).toContain("dateTo=2026-01-01");
    expect(url).toContain("dateFrom=2025-01-01");
    expect(url).toContain("ticketId=42");
    expect(url).not.toContain("dateToo");
  });

  it("sem filtros: só page/pageSize (quando informados), nada de chave vazia", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { messages: [] } });
    await makeMessages(httpClient).list({ page: 1, pageSize: 20 });

    const url = httpClient.calls[0]?.url ?? "";
    expect(url).toBe(`${BASE_URL}/api/messages?page=1&pageSize=20`);
  });
});

describe("Messages.get", () => {
  it("GET /api/messages/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "m1", body: "olá" } });
    const result = await makeMessages(httpClient).get("m1");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/messages/m1`);
    expect(result).toEqual({ id: "m1", body: "olá" });
  });
});

describe("Messages.sendText", () => {
  it("POST /api/send/{to} com corpo json", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, body: "olá" } });
    const data = { body: "olá", connectionFrom: 1 };
    await makeMessages(httpClient).sendText("5511999999999", data as never);

    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/send/5511999999999`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
  });
});

describe("Messages.sendMedia — multipart (Q20)", () => {
  it("POST /api/send/{type}/{to} com FormData, sem Content-Type manual", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    await makeMessages(httpClient).sendMedia("5511999999999", "image", {
      media: new Blob(["x"]),
      connectionFrom: 1,
    } as never);

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/send/image/5511999999999`);
    expect(httpClient.calls[0]?.body).toBeInstanceOf(FormData);
    expect(httpClient.calls[0]?.headers["Content-Type"]).toBeUndefined();
  });
});

describe("Messages.sendMediaByUrl — json, capacidade que a v0.7 nunca teve (Q20)", () => {
  it("POST /api/send/{type}/{to} com corpo json contendo url", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    const data = { url: "https://exemplo.com/imagem.png", connectionFrom: 1 };
    await makeMessages(httpClient).sendMediaByUrl("5511999999999", "image", data as never);

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/send/image/5511999999999`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
    expect(httpClient.calls[0]?.headers["Content-Type"]).toBe("application/json");
  });
});

describe("Messages.sendMany", () => {
  it("sem files: vai json puro, messages como array real (não string)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "x" } });
    const messages = [{ body: "oi", fromMe: true, read: false }];
    await makeMessages(httpClient).sendMany("5511999999999", messages as never);

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/messages/multiple/5511999999999`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify({ messages }));
    expect(httpClient.calls[0]?.headers["Content-Type"]).toBe("application/json");
  });

  it("com files: vai multipart, messages serializado como JSON string dentro do form (Q7)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: "x" } });
    const messages = [{ body: "oi", fromMe: true, read: false }];
    const files = [new Blob(["a"]), new Blob(["b"])];
    await makeMessages(httpClient).sendMany("5511999999999", messages as never, files);

    const form = httpClient.calls[0]?.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("messages")).toBe(JSON.stringify(messages));
    expect(form.getAll("files")).toHaveLength(2);
  });
});
