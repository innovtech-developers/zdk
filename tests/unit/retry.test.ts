import { describe, expect, it, vi } from "vitest";
import {
  ZdkAbortError,
  ZdkAuthError,
  ZdkNetworkError,
  ZdkNotFoundError,
  ZdkRateLimitError,
  ZdkServerError,
  ZdkTimeoutError,
  ZdkValidationError,
} from "../../src/core/errors";
import {
  DEFAULT_RETRY_CONFIG,
  classifyFailure,
  executeWithRetry,
  isRetryableByDefault,
  type FailureKind,
  type RetryAttemptInfo,
} from "../../src/core/retry";
import type { RetryClass } from "../../src/core/operation-metadata";

const preauth = () => new ZdkNetworkError("dns", { transportCode: "ENOTFOUND" });
const ambiguousNetwork = () => new ZdkNetworkError("reset", { transportCode: "ECONNRESET" });
const unknownNetwork = () => new ZdkNetworkError("sem código"); // sem transportCode — cai em ambíguo (fail-safe)
const timeout = () => new ZdkTimeoutError("timeout", 10_000);
const rateLimit = (retryAfterMs?: number) =>
  new ZdkRateLimitError("429", "ERR_RATE_LIMIT", { status: 429, payload: {}, retryAfterMs });
const serviceUnavailable = () => new ZdkServerError("503", "ERR_UNAVAILABLE", { status: 503, payload: {} });
const serverError = () => new ZdkServerError("500", "ERR_INTERNAL", { status: 500, payload: {} });
const clientError = () => new ZdkValidationError("400", "ERR_BAD_REQUEST", { status: 400, payload: {} });
const notFound = () => new ZdkNotFoundError("404", "ERR_NOT_FOUND", { status: 404, payload: {} });
const abort = () => new ZdkAbortError("abort");

describe("classifyFailure", () => {
  it.each([
    ["preauth-network", preauth()],
    ["ambiguous-network", ambiguousNetwork()],
    ["ambiguous-network", unknownNetwork()],
    ["timeout", timeout()],
    ["rate-limit", rateLimit()],
    ["service-unavailable", serviceUnavailable()],
    ["server-error", serverError()],
    ["client-error", clientError()],
    ["client-error", notFound()],
    ["abort", abort()],
  ] satisfies Array<[FailureKind, unknown]>)("%s", (expected, error) => {
    expect(classifyFailure(error)).toBe(expected);
  });

  it("erro que não veio da lib vira 'unknown' (fail-safe, nunca repete)", () => {
    expect(classifyFailure(new Error("qualquer coisa"))).toBe("unknown");
    expect(classifyFailure("string crua")).toBe("unknown");
  });
});

describe("isRetryableByDefault — a matriz completa de §5.8.3", () => {
  const withTimeoutOn = { retryOnTimeout: true, retryOnRateLimit: true, retryUnsafeOnRateLimit: false };
  const config = { retryOnTimeout: false, retryOnRateLimit: true, retryUnsafeOnRateLimit: false };

  it.each([
    ["preauth-network", "safe", true],
    ["preauth-network", "guarded", true],
    ["preauth-network", "unsafe", true], // pré-envio provado — a única exceção que atravessa unsafe
    ["ambiguous-network", "safe", true],
    ["ambiguous-network", "guarded", true],
    ["ambiguous-network", "unsafe", false], // ambíguo — pode ter sido no meio da resposta
    ["service-unavailable", "safe", true],
    ["service-unavailable", "guarded", true],
    ["service-unavailable", "unsafe", false],
    ["server-error", "safe", true],
    ["server-error", "guarded", false],
    ["server-error", "unsafe", false],
    ["client-error", "safe", false],
    ["client-error", "guarded", false],
    ["client-error", "unsafe", false],
    ["abort", "safe", false],
    ["abort", "guarded", false],
    ["abort", "unsafe", false],
  ] satisfies Array<[FailureKind, RetryClass, boolean]>)("%s / %s -> %s", (kind, retryClass, expected) => {
    expect(isRetryableByDefault(kind, retryClass, config)).toBe(expected);
  });

  describe("timeout — master switch retryOnTimeout", () => {
    it.each([
      ["safe", false],
      ["guarded", false],
      ["unsafe", false],
    ] satisfies Array<[RetryClass, boolean]>)("com retryOnTimeout:false (default), %s -> %s", (retryClass, expected) => {
      expect(isRetryableByDefault("timeout", retryClass, config)).toBe(expected);
    });

    it.each([
      ["safe", true],
      ["guarded", false],
      ["unsafe", false],
    ] satisfies Array<[RetryClass, boolean]>)("com retryOnTimeout:true, %s -> %s", (retryClass, expected) => {
      expect(isRetryableByDefault("timeout", retryClass, withTimeoutOn)).toBe(expected);
    });
  });

  describe("rate-limit — retryOnRateLimit (safe/guarded) vs retryUnsafeOnRateLimit (unsafe)", () => {
    it("safe e guarded seguem retryOnRateLimit (true por default)", () => {
      expect(isRetryableByDefault("rate-limit", "safe", config)).toBe(true);
      expect(isRetryableByDefault("rate-limit", "guarded", config)).toBe(true);
    });

    it("unsafe segue retryUnsafeOnRateLimit, não retryOnRateLimit — false por default", () => {
      expect(isRetryableByDefault("rate-limit", "unsafe", config)).toBe(false);
      expect(isRetryableByDefault("rate-limit", "unsafe", { ...config, retryUnsafeOnRateLimit: true })).toBe(true);
    });
  });
});

describe("executeWithRetry", () => {
  const noSleep = vi.fn(async () => {});
  const zeroRandom = () => 0;

  function config(overrides: Partial<typeof DEFAULT_RETRY_CONFIG> = {}) {
    return { ...DEFAULT_RETRY_CONFIG, sleep: noSleep, random: zeroRandom, ...overrides };
  }

  it("sucesso de primeira: fn chamada uma vez, sem sleep", async () => {
    noSleep.mockClear();
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config());
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(noSleep).not.toHaveBeenCalled();
  });

  it("falha retryable, depois sucesso: repete e retorna", async () => {
    noSleep.mockClear();
    const fn = vi.fn().mockRejectedValueOnce(ambiguousNetwork()).mockResolvedValueOnce("ok");
    const result = await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config());
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(noSleep).toHaveBeenCalledTimes(1);
  });

  it("falha não-retryable: para na 1ª tentativa, attempts=1, retryable=false", async () => {
    const fn = vi.fn().mockRejectedValue(notFound());
    try {
      await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config());
      expect.unreachable();
    } catch (error) {
      expect(fn).toHaveBeenCalledTimes(1);
      expect((error as ZdkNotFoundError).attempts).toBe(1);
      expect((error as ZdkNotFoundError).retryable).toBe(false);
    }
  });

  it("esgota as 3 tentativas com falha SEMPRE retryable-por-classe: attempts=3, retryable=true (esgotou orçamento, não deixou de ser o tipo que se repete)", async () => {
    const fn = vi.fn().mockRejectedValue(ambiguousNetwork());
    try {
      await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config());
      expect.unreachable();
    } catch (error) {
      expect(fn).toHaveBeenCalledTimes(3);
      expect((error as ZdkNetworkError).attempts).toBe(3);
      expect((error as ZdkNetworkError).retryable).toBe(true);
    }
  });

  it("unsafe + preauth-network (ENOTFOUND) REPETE — pré-envio provado", async () => {
    const fn = vi.fn().mockRejectedValueOnce(preauth()).mockResolvedValueOnce("ok");
    const result = await executeWithRetry(fn, { operation: "POST /api/send/{to}", retryClass: "unsafe" }, config());
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("unsafe + ambiguous-network (ECONNRESET) NÃO repete", async () => {
    const fn = vi.fn().mockRejectedValue(ambiguousNetwork());
    try {
      await executeWithRetry(fn, { operation: "POST /api/send/{to}", retryClass: "unsafe" }, config());
      expect.unreachable();
    } catch {
      expect(fn).toHaveBeenCalledTimes(1);
    }
  });

  it("Retry-After maior que maxRetryAfterMs: desiste sem dormir, mesmo sendo classe/tipo retryable", async () => {
    noSleep.mockClear();
    const fn = vi.fn().mockRejectedValue(rateLimit(60_000)); // > maxRetryAfterMs (30_000)
    try {
      await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config());
      expect.unreachable();
    } catch (error) {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(noSleep).not.toHaveBeenCalled();
      // ainda é "retryable" por classificação — só a espera pedida é que era grande demais
      expect((error as ZdkRateLimitError).retryable).toBe(true);
    }
  });

  it("Retry-After dentro do limite é usado como delay diretamente (não o backoff exponencial)", async () => {
    const sleep = vi.fn(async () => {});
    const fn = vi.fn().mockRejectedValueOnce(rateLimit(5_000)).mockResolvedValueOnce("ok");
    await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config({ sleep }));
    expect(sleep).toHaveBeenCalledWith(5_000);
  });

  it("deadlineMs: desiste sem dormir quando o próximo delay estouraria o teto", async () => {
    noSleep.mockClear();
    const fn = vi.fn().mockRejectedValue(ambiguousNetwork());
    // random:1 satura o backoff no baseDelayMs (250ms) na 1ª retentativa —
    // bem maior que o deadline de 10ms, então a 2ª tentativa nunca acontece.
    try {
      await executeWithRetry(
        fn,
        { operation: "GET /x", retryClass: "safe" },
        config({ deadlineMs: 10, random: () => 1 }),
      );
      expect.unreachable();
    } catch {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(noSleep).not.toHaveBeenCalled();
    }
  });

  it("shouldRetry força retry num erro normalmente não-retryable", async () => {
    const fn = vi.fn().mockRejectedValueOnce(notFound()).mockResolvedValueOnce("ok");
    const result = await executeWithRetry(
      fn,
      { operation: "GET /x", retryClass: "safe" },
      config({ shouldRetry: () => true }),
    );
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("shouldRetry bloqueia retry num erro normalmente retryable", async () => {
    const fn = vi.fn().mockRejectedValue(ambiguousNetwork());
    try {
      await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config({ shouldRetry: () => false }));
      expect.unreachable();
    } catch {
      expect(fn).toHaveBeenCalledTimes(1);
    }
  });

  it("shouldRetry retornando undefined delega ao default", async () => {
    const fn = vi.fn().mockRejectedValueOnce(ambiguousNetwork()).mockResolvedValueOnce("ok");
    const result = await executeWithRetry(
      fn,
      { operation: "GET /x", retryClass: "safe" },
      config({ shouldRetry: () => undefined }),
    );
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("onRetry é chamado com attempt/delayMs/error/operation corretos", async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValueOnce(ambiguousNetwork()).mockResolvedValueOnce("ok");
    await executeWithRetry(fn, { operation: "GET /api/tickets", retryClass: "safe" }, config({ onRetry }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    const info = onRetry.mock.calls[0]![0] as RetryAttemptInfo;
    expect(info.attempt).toBe(1);
    expect(info.operation).toBe("GET /api/tickets");
    expect(info.error).toBeInstanceOf(ZdkNetworkError);
    expect(info.delayMs).toBeGreaterThanOrEqual(0);
  });

  it("erro do consumidor (ZdkAuthError, não instância conhecida de sucesso) preserva identidade — instanceof continua funcionando", async () => {
    const fn = vi.fn().mockRejectedValue(new ZdkAuthError("401", "ERR_INVALID_API_KEY", { status: 401, payload: {} }));
    try {
      await executeWithRetry(fn, { operation: "GET /x", retryClass: "safe" }, config());
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkAuthError);
    }
  });
});
