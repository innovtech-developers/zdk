import { afterEach, describe, expect, it, vi } from "vitest";
import { Zdk } from "../../src/zdk";
import { ZdkAuthError, ZdkConfigError } from "../../src/core/errors";

const BASE_URL = "https://api-x.zapcontabil.chat";
const TOKEN = "a".repeat(250);

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, ...init });
}

describe("Zdk — new Zdk() é síncrono, zero I/O", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("construir a instância não faz nenhuma requisição", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });

    expect(zdk).toBeInstanceOf(Zdk);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("baseUrl/token inválidos lançam na hora (sem rede)", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(() => new Zdk({ baseUrl: "https://evil.com", token: TOKEN })).toThrow(ZdkConfigError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("zdk.rateLimit é null antes de qualquer requisição", () => {
    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    expect(zdk.rateLimit).toBeNull();
  });
});

describe("Zdk.connect — new Zdk() + verify() em uma chamada", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("faz EXATAMENTE 1 requisição (GET /api/connections)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ connections: [{ id: 1, status: "CONNECTED" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const zdk = await Zdk.connect({ baseUrl: BASE_URL, token: TOKEN });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE_URL}/api/connections`);
    expect(zdk).toBeInstanceOf(Zdk);
  });

  it("propaga o erro se a credencial for inválida (não devolve instância)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ error: "ERR_INVALID_API_KEY" }, { status: 401 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(Zdk.connect({ baseUrl: BASE_URL, token: TOKEN })).rejects.toBeInstanceOf(ZdkAuthError);
  });
});

describe("Zdk.prototype.verify", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devolve { connections, rateLimit } reusando connections.list()", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ connections: [{ id: 1, status: "WHATSAPP_AUTH" }] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    const result = await zdk.verify();

    expect(result.connections).toEqual([{ id: 1, status: "WHATSAPP_AUTH" }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("401 vira ZdkAuthError; code distingue ERR_INVALID_API_KEY de ERR_NO_AUTH_HEADER_PRESENT", async () => {
    const zdkInvalidKey = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "ERR_INVALID_API_KEY" }, { status: 401 })));
    try {
      await zdkInvalidKey.verify();
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkAuthError);
      expect((error as ZdkAuthError).code).toBe("ERR_INVALID_API_KEY");
    }

    const zdkNoHeader = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "ERR_NO_AUTH_HEADER_PRESENT" }, { status: 401 })),
    );
    try {
      await zdkNoHeader.verify();
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkAuthError);
      expect((error as ZdkAuthError).code).toBe("ERR_NO_AUTH_HEADER_PRESENT");
    }
  });

  it("2xx sem connections vira ZdkConfigError — host não parece ser a API Zappy", async () => {
    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ html: "<html>painel</html>" })));

    await expect(zdk.verify()).rejects.toBeInstanceOf(ZdkConfigError);
  });

  it("zdk.rateLimit reflete os headers da última resposta", async () => {
    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          { connections: [] },
          {
            headers: {
              "x-ratelimit-limit": "10000",
              "x-ratelimit-remaining": "9999",
              "x-ratelimit-reset": "1789060936",
              date: "Thu, 10 Sep 2026 17:22:14 GMT",
            },
          },
        ),
      ),
    );

    await zdk.verify();

    expect(zdk.rateLimit).toMatchObject({ limit: 10000, remaining: 9999 });
  });
});

describe("Zdk — capabilities()/supports() delegam para o registry interno", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("supports() é otimista antes de capabilities() carregar", () => {
    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    expect(zdk.supports("GET /api/webhooks")).toBe(true);
  });

  it("capabilities() busca o swagger e supports() passa a refletir a instância real", async () => {
    const zdk = new Zdk({ baseUrl: BASE_URL, token: TOKEN });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ paths: { "/api/connections": { get: {} } } })),
    );

    await zdk.capabilities();

    expect(zdk.supports("GET /api/connections")).toBe(true);
    expect(zdk.supports("GET /api/webhooks")).toBe(false);
  });
});
