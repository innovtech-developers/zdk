import { describe, expect, it, vi } from "vitest";
import { Capabilities } from "../../src/core/capabilities";
import { FakeHttpClient } from "../helpers/fake-http-client";

const SWAGGER_FAKE = {
  paths: {
    "/api/connections": { get: {} },
    "/api/webhooks": { get: {}, post: {} },
    "/api/webhooks/{id}": { get: {}, put: {}, delete: {} },
  },
};

describe("Capabilities", () => {
  it("antes de load(), supports() assume tudo suportado (otimista)", () => {
    const httpClient = new FakeHttpClient();
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });
    expect(capabilities.supports("GET /api/webhooks")).toBe(true);
    expect(capabilities.supports("GET /api/qualquer-coisa-inventada")).toBe(true);
  });

  it("depois de load(), supports() reflete o swagger de fato — presente e ausente", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_FAKE });
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });

    await capabilities.load();

    expect(capabilities.supports("GET /api/webhooks")).toBe(true);
    expect(capabilities.supports("POST /api/webhooks")).toBe(true);
    expect(capabilities.supports("DELETE /api/webhooks/{id}")).toBe(true);
    expect(capabilities.supports("POST /api/connections")).toBe(false); // não existe no doc — só GET
  });

  it("busca o swagger.json da própria baseUrl, sem Authorization", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_FAKE });
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });

    await capabilities.load();

    expect(httpClient.calls).toHaveLength(1);
    expect(httpClient.calls[0]?.method).toBe("GET");
    expect(httpClient.calls[0]?.url).toBe("https://api-x.zapcontabil.chat/swagger.json");
    expect(httpClient.calls[0]?.headers).toEqual({});
  });

  it("load() chamado duas vezes busca só uma vez (cache)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_FAKE });
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });

    await capabilities.load();
    await capabilities.load();

    expect(httpClient.requestCount).toBe(1);
  });

  it("chamadas concorrentes a load() compartilham a mesma busca em andamento", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_FAKE });
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });

    const [a, b] = await Promise.all([capabilities.load(), capabilities.load()]);

    expect(httpClient.requestCount).toBe(1);
    expect(a).toBe(b); // mesmo Set, não duas buscas
  });

  it("resposta não-2xx: falha tratada, supports() segue otimista", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 500, body: { error: "ERR_INTERNAL" } });
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });

    const result = await capabilities.load();

    expect(result).toBeNull();
    expect(capabilities.supports("GET /api/webhooks")).toBe(true);
  });

  it("fetch lança (rede indisponível): onLoadError é chamado, supports() segue otimista", async () => {
    const httpClient = {
      send: vi.fn().mockRejectedValue(new Error("rede indisponível")),
    };
    const onLoadError = vi.fn();
    const capabilities = new Capabilities({
      baseUrl: "https://api-x.zapcontabil.chat",
      httpClient,
      onLoadError,
    });

    const result = await capabilities.load();

    expect(result).toBeNull();
    expect(onLoadError).toHaveBeenCalledTimes(1);
    expect(capabilities.supports("GET /api/webhooks")).toBe(true);
  });

  it("JSON inválido na resposta é tratado como falha, não quebra", async () => {
    const httpClient = {
      send: vi.fn().mockResolvedValue(new Response("isto não é JSON", { status: 200 })),
    };
    const capabilities = new Capabilities({ baseUrl: "https://api-x.zapcontabil.chat", httpClient });

    const result = await capabilities.load();

    expect(result).toBeNull();
    expect(capabilities.supports("GET /api/webhooks")).toBe(true);
  });

  it("timeoutMs customizado é repassado ao HttpClient", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_FAKE });
    const capabilities = new Capabilities({
      baseUrl: "https://api-x.zapcontabil.chat",
      httpClient,
      timeoutMs: 3_000,
    });

    await capabilities.load();

    expect(httpClient.calls[0]?.timeoutMs).toBe(3_000);
  });
});
