import { describe, expect, it } from "vitest";
import {
  ZdkAbortError,
  ZdkAuthError,
  ZdkConfigError,
  ZdkError,
  ZdkHttpError,
  ZdkNetworkError,
  ZdkNotFoundError,
  ZdkOfficialApiWindowError,
  ZdkRateLimitError,
  ZdkServerError,
  ZdkTimeoutError,
  ZdkUnsupportedOperationError,
  ZdkValidationError,
} from "../../src/core/errors";

describe("ZdkError", () => {
  it("é instanceof Error e da própria classe após passar por throw/catch", () => {
    try {
      throw new ZdkConfigError("baseUrl inválida");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ZdkError);
      expect(error).toBeInstanceOf(ZdkConfigError);
    }
  });

  it("default de attempts=1 e retryable=false quando não informado", () => {
    const error = new ZdkConfigError("x");
    expect(error.attempts).toBe(1);
    expect(error.retryable).toBe(false);
  });

  it("aceita attempts/retryable/cause explícitos", () => {
    const cause = new Error("dns falhou");
    const error = new ZdkNetworkError("falha de transporte", {
      cause,
      attempts: 3,
      retryable: true,
    });
    expect(error.attempts).toBe(3);
    expect(error.retryable).toBe(true);
    expect(error.cause).toBe(cause);
  });

  it("cada subclasse tem code fixo e distinto", () => {
    expect(new ZdkConfigError("x").code).toBe("ZDK_CONFIG_ERROR");
    expect(new ZdkNetworkError("x").code).toBe("ZDK_NETWORK_ERROR");
    expect(new ZdkTimeoutError("x", 10_000).code).toBe("ZDK_TIMEOUT_ERROR");
    expect(new ZdkAbortError("x").code).toBe("ZDK_ABORT_ERROR");
    expect(new ZdkUnsupportedOperationError("x", "GET /api/webhooks").code).toBe(
      "ZDK_UNSUPPORTED_OPERATION",
    );
  });

  it("ZdkTimeoutError carrega o timeoutMs que estourou", () => {
    const error = new ZdkTimeoutError("estourou", 15_000);
    expect(error.timeoutMs).toBe(15_000);
  });

  it("ZdkUnsupportedOperationError carrega a operação ausente", () => {
    const error = new ZdkUnsupportedOperationError(
      "operação não existe nesta instância",
      "GET /api/webhooks",
    );
    expect(error.operation).toBe("GET /api/webhooks");
  });
});

describe("ZdkHttpError e subclasses", () => {
  it("code vem do corpo (ERR_*), não é fixo por classe", () => {
    const invalidKey = new ZdkAuthError("token inválido", "ERR_INVALID_API_KEY", {
      status: 401,
      payload: { error: "ERR_INVALID_API_KEY", errorData: {} },
    });
    const noHeader = new ZdkAuthError("header ausente", "ERR_NO_AUTH_HEADER_PRESENT", {
      status: 401,
      payload: { error: "ERR_NO_AUTH_HEADER_PRESENT", errorData: {} },
    });

    expect(invalidKey.code).toBe("ERR_INVALID_API_KEY");
    expect(noHeader.code).toBe("ERR_NO_AUTH_HEADER_PRESENT");
    expect(invalidKey).toBeInstanceOf(ZdkHttpError);
    expect(invalidKey).toBeInstanceOf(ZdkAuthError);
  });

  it("payload preserva o corpo inteiro, incluindo errorData não documentado (Q17)", () => {
    const error = new ZdkValidationError("corpo inválido", "ERR_ALGO", {
      status: 400,
      payload: { error: "ERR_ALGO", errorData: { campo: "name" } },
    });
    expect(error.payload).toEqual({ error: "ERR_ALGO", errorData: { campo: "name" } });
  });

  it("ZdkOfficialApiWindowError carrega status 400 e o code da janela fechada (Q6)", () => {
    const error = new ZdkOfficialApiWindowError(
      "janela de 24h fechada",
      "ERR_OFFICIAL_API_WINDOW_CLOSED",
      { status: 400, payload: {} },
    );
    expect(error.status).toBe(400);
    expect(error.code).toBe("ERR_OFFICIAL_API_WINDOW_CLOSED");
  });

  it("ZdkNotFoundError e ZdkServerError carregam o status correspondente", () => {
    expect(new ZdkNotFoundError("não encontrado", "ERR_NOT_FOUND", { status: 404, payload: {} }).status).toBe(404);
    expect(new ZdkServerError("erro interno", "ERR_INTERNAL", { status: 500, payload: {} }).status).toBe(500);
  });

  it("ZdkRateLimitError carrega retryAfterMs opcional", () => {
    const semRetryAfter = new ZdkRateLimitError("limite excedido", "ERR_RATE_LIMIT", {
      status: 429,
      payload: {},
    });
    const comRetryAfter = new ZdkRateLimitError("limite excedido", "ERR_RATE_LIMIT", {
      status: 429,
      payload: {},
      retryAfterMs: 5_000,
    });

    expect(semRetryAfter.retryAfterMs).toBeUndefined();
    expect(comRetryAfter.retryAfterMs).toBe(5_000);
  });

  it("requestId é opcional e passa adiante quando presente", () => {
    const error = new ZdkValidationError("x", "ERR_X", {
      status: 400,
      payload: {},
      requestId: "req_123",
    });
    expect(error.requestId).toBe("req_123");
  });
});
