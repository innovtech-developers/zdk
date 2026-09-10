import { describe, expect, it } from "vitest";
import { buildRequest } from "../../src/core/request-builder";

const BASE = { baseUrl: "https://api-x.zapcontabil.chat", token: "tok" };

describe("buildRequest — path e método", () => {
  it("substitui um placeholder de path", () => {
    const req = buildRequest({
      ...BASE,
      method: "GET",
      path: "/api/tickets/{id}",
      pathParams: { id: 42 },
    });
    expect(req.url).toBe("https://api-x.zapcontabil.chat/api/tickets/42");
    expect(req.method).toBe("GET");
  });

  it("substitui múltiplos placeholders", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/tickets/{id}/send/{type}",
      pathParams: { id: 7, type: "image" },
    });
    expect(req.url).toBe("https://api-x.zapcontabil.chat/api/tickets/7/send/image");
  });

  it("codifica caractere especial no valor do path param", () => {
    const req = buildRequest({
      ...BASE,
      method: "GET",
      path: "/api/storage/signed-url/{filekey}",
      pathParams: { filekey: "pasta/arquivo com espaço.png" },
    });
    expect(req.url).toBe(
      "https://api-x.zapcontabil.chat/api/storage/signed-url/pasta%2Farquivo%20com%20espa%C3%A7o.png",
    );
  });

  it("lança quando falta valor para um placeholder do path", () => {
    expect(() =>
      buildRequest({ ...BASE, method: "GET", path: "/api/tickets/{id}" }),
    ).toThrow(/placeholder/);
  });

  it("lança quando um pathParam não corresponde a nenhum placeholder", () => {
    expect(() =>
      buildRequest({
        ...BASE,
        method: "GET",
        path: "/api/tickets",
        pathParams: { id: 1 },
      }),
    ).toThrow(/não corresponde/);
  });
});

describe("buildRequest — query (regressão do bug dateToo, v0.7 src/lib/message.ts)", () => {
  it("serializa o nome de parâmetro exatamente como recebido — 'dateTo' nunca sai como 'dateToo'", () => {
    const req = buildRequest({
      ...BASE,
      method: "GET",
      path: "/api/messages",
      query: { dateTo: "2026-01-01", dateFrom: "2025-01-01" },
    });
    expect(req.url).toContain("dateTo=2026-01-01");
    expect(req.url).not.toContain("dateToo");
  });

  it("omite por completo chave com valor undefined — não vira 'chave=' vazio (a causa raiz do bug)", () => {
    const req = buildRequest({
      ...BASE,
      method: "GET",
      path: "/api/messages",
      query: { page: 1, pageSize: 20, ticketId: undefined, contactId: undefined, dateFrom: undefined, dateTo: undefined },
    });
    expect(req.url).toBe("https://api-x.zapcontabil.chat/api/messages?page=1&pageSize=20");
    expect(req.url).not.toContain("ticketId");
    expect(req.url).not.toContain("dateTo");
  });

  it("serializa number e boolean como string", () => {
    const req = buildRequest({
      ...BASE,
      method: "GET",
      path: "/api/tags",
      query: { page: 2, pageSize: 50 },
    });
    expect(req.url).toBe("https://api-x.zapcontabil.chat/api/tags?page=2&pageSize=50");
  });

  it("sem query nenhuma, URL fica sem '?'", () => {
    const req = buildRequest({ ...BASE, method: "GET", path: "/api/connections" });
    expect(req.url).toBe("https://api-x.zapcontabil.chat/api/connections");
  });
});

describe("buildRequest — headers", () => {
  it("sempre inclui Authorization: Bearer <token>", () => {
    const req = buildRequest({ ...BASE, method: "GET", path: "/api/connections" });
    expect(req.headers["Authorization"]).toBe("Bearer tok");
  });

  it("extraHeaders são mesclados e podem sobrescrever", () => {
    const req = buildRequest({
      ...BASE,
      method: "GET",
      path: "/api/connections",
      extraHeaders: { "X-Custom": "abc" },
    });
    expect(req.headers["X-Custom"]).toBe("abc");
    expect(req.headers["Authorization"]).toBe("Bearer tok");
  });
});

describe("buildRequest — corpo JSON", () => {
  it("serializa o valor como JSON string e define Content-Type", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/send/{to}",
      pathParams: { to: "5511999999999" },
      body: { kind: "json", value: { body: "olá", connectionFrom: 1 } },
    });
    expect(req.body).toBe(JSON.stringify({ body: "olá", connectionFrom: 1 }));
    expect(req.headers["Content-Type"]).toBe("application/json");
  });

  it("corpo JSON é sempre retryable", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/send/{to}",
      pathParams: { to: "1" },
      body: { kind: "json", value: {} },
    });
    expect(req.retryable).toBe(true);
  });

  it("sem corpo (GET/DELETE) também é retryable", () => {
    const req = buildRequest({ ...BASE, method: "DELETE", path: "/api/webhooks/{id}", pathParams: { id: 1 } });
    expect(req.retryable).toBe(true);
    expect(req.body).toBeUndefined();
  });
});

describe("buildRequest — corpo multipart", () => {
  it("monta FormData com os campos e NÃO define Content-Type manualmente", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/send/{type}/{to}",
      pathParams: { type: "image", to: "5511999999999" },
      body: {
        kind: "multipart",
        fields: { media: new Blob(["conteúdo"]), caption: "legenda", connectionFrom: 1 },
      },
    });

    expect(req.body).toBeInstanceOf(FormData);
    const form = req.body as FormData;
    expect(form.get("caption")).toBe("legenda");
    expect(form.get("connectionFrom")).toBe("1");
    expect(form.get("media")).toBeInstanceOf(Blob);
    expect(req.headers["Content-Type"]).toBeUndefined();
  });

  it("Uint8Array vira Blob antes de entrar no FormData", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/upload-temp",
      body: { kind: "multipart", fields: { media: new Uint8Array([1, 2, 3]) } },
    });
    const form = req.body as FormData;
    expect(form.get("media")).toBeInstanceOf(Blob);
  });

  it("campo com valor undefined é omitido do FormData", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/upload-temp",
      body: { kind: "multipart", fields: { media: "x", caption: undefined } },
    });
    const form = req.body as FormData;
    expect(form.has("caption")).toBe(false);
  });

  it("array de valores no mesmo campo vira múltiplas entradas (ex.: vários arquivos)", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/messages/multiple/{to}",
      pathParams: { to: "1" },
      body: {
        kind: "multipart",
        fields: { files: [new Blob(["a"]), new Blob(["b"])], messages: "[]" },
      },
    });
    const form = req.body as FormData;
    expect(form.getAll("files")).toHaveLength(2);
  });

  it("corpo multipart montado por nós é sempre retryable (só string/Blob/Uint8Array por dentro)", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/upload-temp",
      body: { kind: "multipart", fields: { media: new Blob(["x"]) } },
    });
    expect(req.retryable).toBe(true);
  });
});

describe("buildRequest — corpo raw (escape hatch, R5)", () => {
  it("string raw passa direto e é retryable", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/send/{to}",
      pathParams: { to: "1" },
      body: { kind: "raw", value: "corpo pronto" },
    });
    expect(req.body).toBe("corpo pronto");
    expect(req.retryable).toBe(true);
  });

  it("ReadableStream raw NÃO é retryable (R5) — corpo single-use, repetir mandaria vazio", async () => {
    const { ReadableStream } = await import("node:stream/web");
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });

    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/upload-temp",
      body: { kind: "raw", value: stream },
    });

    expect(req.retryable).toBe(false);
    expect(req.body).toBe(stream);
  });

  it("Blob raw é retryable", () => {
    const req = buildRequest({
      ...BASE,
      method: "POST",
      path: "/api/upload-temp",
      body: { kind: "raw", value: new Blob(["x"]) },
    });
    expect(req.retryable).toBe(true);
  });
});
