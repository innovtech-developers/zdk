import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { FakeHttpClient } from "../helpers/fake-http-client";
import {
  ZdkNotFoundError,
  ZdkRateLimitError,
  ZdkUnsupportedOperationError,
  ZdkValidationError,
} from "../../src/core/errors";

const BASE_URL = "https://api-x.zapcontabil.chat";
const TOKEN = "tok";

const SWAGGER_WITHOUT_WEBHOOKS = {
  paths: {
    "/api/connections": { get: {} },
    "/api/tickets/{id}": { get: {} },
  },
};

const SWAGGER_WITH_WEBHOOKS = {
  paths: {
    "/api/connections": { get: {} },
    "/api/tickets/{id}": { get: {} },
    "/api/webhooks": { get: {} },
  },
};

function makeClient(httpClient: FakeHttpClient, overrides: Partial<ConstructorParameters<typeof ApiClient>[0]> = {}) {
  const capabilities = overrides.capabilities ?? new Capabilities({ baseUrl: BASE_URL, httpClient });
  return new ApiClient({
    baseUrl: BASE_URL,
    token: TOKEN,
    httpClient,
    capabilities,
    ...overrides,
  });
}

describe("ApiClient.request — caminho de sucesso", () => {
  it("chamada OK faz exatamente 1 requisição e devolve o corpo desserializado", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [{ id: 1, status: "CONNECTED" }] } });
    const client = makeClient(httpClient);

    const result = await client.request("GET /api/connections");

    expect(httpClient.requestCount).toBe(1);
    expect(result).toEqual({ connections: [{ id: 1, status: "CONNECTED" }] });
  });

  it("monta method/url/headers a partir da OperationKey, pathParams e query", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    const client = makeClient(httpClient);

    await client.request("GET /api/tickets/{id}", { pathParams: { id: 42 } });

    expect(httpClient.calls[0]?.method).toBe("GET");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/42`);
    expect(httpClient.calls[0]?.headers["Authorization"]).toBe("Bearer tok");
  });

  it("json vira corpo application/json", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, body: "olá" } });
    const client = makeClient(httpClient);

    await client.request("POST /api/send/{to}", {
      pathParams: { to: "5511999999999" },
      json: { body: "olá", connectionFrom: 1 },
    });

    expect(httpClient.calls[0]?.body).toBe(JSON.stringify({ body: "olá", connectionFrom: 1 }));
  });

  it("multipart vira FormData", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient);

    await client.request("POST /api/upload-temp", {
      multipart: { media: new Blob(["x"]) },
    });

    expect(httpClient.calls[0]?.body).toBeInstanceOf(FormData);
  });
});

describe("ApiClient.request — upgrade de 404 para ZdkUnsupportedOperationError", () => {
  it("404 em operação AUSENTE do swagger da instância: 2 requisições, ZdkUnsupportedOperationError", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 404, body: { error: "ERR_NOT_FOUND" } }); // 1ª: chamada real
    httpClient.enqueue({ status: 200, body: SWAGGER_WITHOUT_WEBHOOKS }); // 2ª: capabilities.load()
    const client = makeClient(httpClient);

    try {
      await client.request("GET /api/webhooks");
      expect.unreachable();
    } catch (error) {
      expect(httpClient.requestCount).toBe(2);
      expect(error).toBeInstanceOf(ZdkUnsupportedOperationError);
      expect((error as ZdkUnsupportedOperationError).operation).toBe("GET /api/webhooks");
    }
  });

  it("404 em operação PRESENTE no swagger da instância: permanece ZdkNotFoundError (recurso específico não existe)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 404, body: { error: "ERR_NOT_FOUND" } });
    httpClient.enqueue({ status: 200, body: SWAGGER_WITH_WEBHOOKS });
    const client = makeClient(httpClient);

    try {
      await client.request("GET /api/tickets/{id}", { pathParams: { id: 999 } });
      expect.unreachable();
    } catch (error) {
      expect(httpClient.requestCount).toBe(2);
      expect(error).toBeInstanceOf(ZdkNotFoundError);
    }
  });

  it("404 quando a busca do swagger falha: permanece ZdkNotFoundError (conservador — não afirma o que não pôde confirmar)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 404, body: { error: "ERR_NOT_FOUND" } });
    httpClient.enqueue({ status: 500, body: {} }); // capabilities.load() falha
    const client = makeClient(httpClient);

    try {
      await client.request("GET /api/webhooks");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkNotFoundError);
    }
  });

  it("chamada bem-sucedida nunca busca o swagger (custo zero no caminho feliz)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient);

    await client.request("GET /api/connections");

    expect(httpClient.requestCount).toBe(1);
  });

  it("erro que não é 404 (ex.: 400) nunca dispara busca de capabilities", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 400, body: { error: "ERR_VALIDATION" } });
    const client = makeClient(httpClient);

    try {
      await client.request("GET /api/connections");
      expect.unreachable();
    } catch (error) {
      expect(httpClient.requestCount).toBe(1);
      expect(error).toBeInstanceOf(ZdkValidationError);
    }
  });
});

describe("ApiClient.request — verifyCapabilities (gate proativo)", () => {
  it("com verifyCapabilities:true, operação ausente lança SEM tocar o endpoint real", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_WITHOUT_WEBHOOKS }); // só a busca do swagger
    const client = makeClient(httpClient, { verifyCapabilities: true });

    try {
      await client.request("GET /api/webhooks");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkUnsupportedOperationError);
      expect(httpClient.requestCount).toBe(1); // só o swagger — nunca chegou a chamar /api/webhooks
    }
  });

  it("com verifyCapabilities:true, operação presente segue normalmente (2 requisições: swagger + chamada real)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: SWAGGER_WITH_WEBHOOKS });
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient, { verifyCapabilities: true });

    await client.request("GET /api/webhooks");

    expect(httpClient.requestCount).toBe(2);
  });
});

describe("ApiClient.request — retry integrado", () => {
  it("500 (safe) seguido de sucesso: repete e retorna, respeitando a classificação real de retry.ts", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 500, body: { error: "ERR_INTERNAL" } });
    httpClient.enqueue({ status: 200, body: { ok: true } });
    const client = makeClient(httpClient, {
      retryConfig: { attempts: 3, baseDelayMs: 0, maxDelayMs: 0, maxRetryAfterMs: 30_000, retryOnTimeout: false, retryOnRateLimit: true, retryUnsafeOnRateLimit: false, deadlineMs: null, sleep: async () => {} },
    });

    const result = await client.request("GET /api/connections");

    expect(httpClient.requestCount).toBe(2);
    expect(result).toEqual({ ok: true });
  });

  it("400 (client-error) nunca repete", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 400, body: { error: "ERR_VALIDATION" } });
    const client = makeClient(httpClient);

    await expect(client.request("GET /api/connections")).rejects.toBeInstanceOf(ZdkValidationError);
    expect(httpClient.requestCount).toBe(1);
  });
});

describe("ApiClient.request — timeout com precedência (§5.8.1)", () => {
  it("sem override nenhum: usa o default da operação (10s para GET /api/connections)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient);

    await client.request("GET /api/connections");

    expect(httpClient.calls[0]?.timeoutMs).toBe(10_000);
  });

  it("operação com motivo técnico (upload-temp, 60s) vence config global menor", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient, { defaultTimeoutMs: 5_000 });

    await client.request("POST /api/upload-temp", { multipart: { media: "x" } });

    expect(httpClient.calls[0]?.timeoutMs).toBe(60_000);
  });

  it("config global substitui o default genérico (10s) quando a operação não tem motivo técnico próprio", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient, { defaultTimeoutMs: 20_000 });

    await client.request("GET /api/connections");

    expect(httpClient.calls[0]?.timeoutMs).toBe(20_000);
  });

  it("override por chamada vence TUDO — inclusive o motivo técnico da operação", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const client = makeClient(httpClient, { defaultTimeoutMs: 5_000 });

    await client.request("POST /api/upload-temp", { multipart: { media: "x" }, timeoutMs: 180_000 });

    expect(httpClient.calls[0]?.timeoutMs).toBe(180_000);
  });
});

describe("ApiClient.request — rate limit", () => {
  it("429 com Retry-After vira ZdkRateLimitError com retryAfterMs derivado do header", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({
      status: 429,
      headers: { "retry-after": "5", date: "Thu, 10 Sep 2026 17:22:14 GMT" },
      body: { error: "ERR_RATE_LIMIT" },
    });
    const client = makeClient(httpClient);

    try {
      await client.request("GET /api/connections", {
        retryConfig: { attempts: 1, baseDelayMs: 0, maxDelayMs: 0, maxRetryAfterMs: 30_000, retryOnTimeout: false, retryOnRateLimit: true, retryUnsafeOnRateLimit: false, deadlineMs: null },
      });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkRateLimitError);
      expect((error as ZdkRateLimitError).retryAfterMs).toBe(5_000);
    }
  });

  it("onRateLimit é chamado com o snapshot em resposta de SUCESSO que traga os headers", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({
      status: 200,
      headers: {
        "x-ratelimit-limit": "10000",
        "x-ratelimit-remaining": "7668",
        "x-ratelimit-reset": "1789060936",
        date: "Thu, 10 Sep 2026 17:22:14 GMT",
      },
      body: {},
    });
    const onRateLimit = vi.fn();
    const client = makeClient(httpClient, { onRateLimit });

    await client.request("GET /api/connections");

    expect(onRateLimit).toHaveBeenCalledTimes(1);
    expect(onRateLimit.mock.calls[0]![0]).toMatchObject({ limit: 10000, remaining: 7668 });
  });

  it("resposta sem headers de rate limit: onRateLimit não é chamado", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: {} });
    const onRateLimit = vi.fn();
    const client = makeClient(httpClient, { onRateLimit });

    await client.request("GET /api/connections");

    expect(onRateLimit).not.toHaveBeenCalled();
  });
});
