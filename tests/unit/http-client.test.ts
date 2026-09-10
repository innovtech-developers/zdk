import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchHttpClient } from "../../src/core/http-client";
import { ZdkAbortError, ZdkNetworkError, ZdkTimeoutError } from "../../src/core/errors";

/** Mock de `fetch` que só resolve/rejeita quando o `signal` recebido aborta — simula o comportamento real. */
function abortAwareFetchMock() {
  return vi.fn((_url: string, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (signal?.aborted) {
        reject(new DOMException("aborted", "AbortError"));
        return;
      }
      signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    });
  });
}

describe("FetchHttpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encaminha método, URL, headers e body para fetch, e devolve a Response", async () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    const client = new FetchHttpClient();
    const result = await client.send({
      method: "POST",
      url: "https://api-x.zapcontabil.chat/api/send/1",
      headers: { Authorization: "Bearer tok" },
      body: JSON.stringify({ body: "olá" }),
      timeoutMs: 10_000,
    });

    expect(result).toBe(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api-x.zapcontabil.chat/api/send/1");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ Authorization: "Bearer tok" });
    expect(init.body).toBe(JSON.stringify({ body: "olá" }));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("abort do PRÓPRIO consumidor vira ZdkAbortError, nunca ZdkTimeoutError", async () => {
    vi.stubGlobal("fetch", abortAwareFetchMock());
    const client = new FetchHttpClient();
    const controller = new AbortController();

    const promise = client.send({
      method: "GET",
      url: "https://api-x.zapcontabil.chat/api/connections",
      headers: {},
      timeoutMs: 10_000, // bem maior que o abort manual abaixo — prova que é abort, não timeout
      signal: controller.signal,
    });

    queueMicrotask(() => controller.abort());

    await expect(promise).rejects.toBeInstanceOf(ZdkAbortError);
  });

  it("timeout real (curto) vira ZdkTimeoutError com o timeoutMs correto", async () => {
    vi.stubGlobal("fetch", abortAwareFetchMock());
    const client = new FetchHttpClient();

    const promise = client.send({
      method: "GET",
      url: "https://api-x.zapcontabil.chat/api/connections",
      headers: {},
      timeoutMs: 20,
    });

    await expect(promise).rejects.toBeInstanceOf(ZdkTimeoutError);
    try {
      await client.send({
        method: "GET",
        url: "https://api-x.zapcontabil.chat/api/connections",
        headers: {},
        timeoutMs: 20,
      });
    } catch (error) {
      expect((error as ZdkTimeoutError).timeoutMs).toBe(20);
    }
  });

  it("falha de transporte com cause.code (DNS) vira ZdkNetworkError com o código na mensagem", async () => {
    const dnsError = Object.assign(new Error("getaddrinfo ENOTFOUND api-x.zapcontabil.chat"), {
      code: "ENOTFOUND",
    });
    const fetchMock = vi.fn().mockRejectedValue(Object.assign(new TypeError("fetch failed"), { cause: dnsError }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new FetchHttpClient();
    try {
      await client.send({ method: "GET", url: "https://api-x.zapcontabil.chat/api/connections", headers: {}, timeoutMs: 10_000 });
      expect.unreachable("deveria ter lançado ZdkNetworkError");
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkNetworkError);
      expect((error as Error).message).toContain("ENOTFOUND");
    }
  });

  it("falha de transporte sem cause.code ainda vira ZdkNetworkError, sem quebrar", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    const client = new FetchHttpClient();
    await expect(
      client.send({ method: "GET", url: "https://api-x.zapcontabil.chat/api/connections", headers: {}, timeoutMs: 10_000 }),
    ).rejects.toBeInstanceOf(ZdkNetworkError);
  });
});
