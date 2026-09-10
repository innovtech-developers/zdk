import { describe, expect, it } from "vitest";
import { mapHttpError } from "../../src/core/error-mapper";
import {
  ZdkAuthError,
  ZdkHttpError,
  ZdkNotFoundError,
  ZdkOfficialApiWindowError,
  ZdkRateLimitError,
  ZdkServerError,
  ZdkValidationError,
} from "../../src/core/errors";

describe("mapHttpError", () => {
  it("400 genérico vira ZdkValidationError", () => {
    const error = mapHttpError({ status: 400, payload: { error: "ERR_ALGO" } });
    expect(error).toBeInstanceOf(ZdkValidationError);
    expect(error.code).toBe("ERR_ALGO");
    expect(error.status).toBe(400);
  });

  it("400 + ERR_OFFICIAL_API_WINDOW_CLOSED vira ZdkOfficialApiWindowError (Q6)", () => {
    const error = mapHttpError({
      status: 400,
      payload: {
        error: "ERR_OFFICIAL_API_WINDOW_CLOSED",
        message: "A janela de 24 horas está fechada.",
      },
    });
    expect(error).toBeInstanceOf(ZdkOfficialApiWindowError);
    expect(error.message).toBe("A janela de 24 horas está fechada.");
  });

  it("401 vira ZdkAuthError, code distingue a causa real (Q13/Q17)", () => {
    const invalidKey = mapHttpError({
      status: 401,
      payload: { error: "ERR_INVALID_API_KEY", errorData: {} },
    });
    const noHeader = mapHttpError({
      status: 401,
      payload: { error: "ERR_NO_AUTH_HEADER_PRESENT", errorData: {} },
    });
    expect(invalidKey).toBeInstanceOf(ZdkAuthError);
    expect(invalidKey.code).toBe("ERR_INVALID_API_KEY");
    expect(noHeader.code).toBe("ERR_NO_AUTH_HEADER_PRESENT");
  });

  it("403 também vira ZdkAuthError", () => {
    const error = mapHttpError({ status: 403, payload: { error: "ERR_FORBIDDEN" } });
    expect(error).toBeInstanceOf(ZdkAuthError);
  });

  it("404 vira ZdkNotFoundError", () => {
    const error = mapHttpError({ status: 404, payload: { error: "ERR_NOT_FOUND" } });
    expect(error).toBeInstanceOf(ZdkNotFoundError);
  });

  it("429 vira ZdkRateLimitError e carrega retryAfterMs quando informado", () => {
    const semRetryAfter = mapHttpError({ status: 429, payload: {} });
    const comRetryAfter = mapHttpError({ status: 429, payload: {}, retryAfterMs: 3_000 });

    expect(semRetryAfter).toBeInstanceOf(ZdkRateLimitError);
    expect((semRetryAfter as ZdkRateLimitError).retryAfterMs).toBeUndefined();
    expect((comRetryAfter as ZdkRateLimitError).retryAfterMs).toBe(3_000);
  });

  it("5xx vira ZdkServerError", () => {
    expect(mapHttpError({ status: 500, payload: {} })).toBeInstanceOf(ZdkServerError);
    expect(mapHttpError({ status: 502, payload: {} })).toBeInstanceOf(ZdkServerError);
    expect(mapHttpError({ status: 503, payload: {} })).toBeInstanceOf(ZdkServerError);
  });

  it("status inesperado (fora do documentado) cai em ZdkValidationError por default seguro", () => {
    const error = mapHttpError({ status: 418, payload: {} });
    expect(error).toBeInstanceOf(ZdkValidationError);
  });

  it("payload sem campo error vira código genérico, sem quebrar", () => {
    const error = mapHttpError({ status: 500, payload: "corpo não é JSON" });
    expect(error.code).toBe("ZDK_UNKNOWN_ERROR");
  });

  it("payload ausente (undefined) não quebra", () => {
    const error = mapHttpError({ status: 500, payload: undefined });
    expect(error.code).toBe("ZDK_UNKNOWN_ERROR");
    expect(error.message).toContain("HTTP 500");
  });

  it("payload preserva errorData não documentado (Q17)", () => {
    const error = mapHttpError({
      status: 400,
      payload: { error: "ERR_VALIDATION", errorData: { field: "name", reason: "obrigatório" } },
    });
    expect(error.payload).toEqual({
      error: "ERR_VALIDATION",
      errorData: { field: "name", reason: "obrigatório" },
    });
  });

  it("requestId, attempts e retryable passam adiante", () => {
    const error = mapHttpError({
      status: 500,
      payload: {},
      requestId: "req_abc",
      attempts: 3,
      retryable: true,
    });
    expect(error.requestId).toBe("req_abc");
    expect(error.attempts).toBe(3);
    expect(error.retryable).toBe(true);
  });

  it("todo erro mapeado é instância de ZdkHttpError", () => {
    const error = mapHttpError({ status: 404, payload: {} });
    expect(error).toBeInstanceOf(ZdkHttpError);
  });
});
