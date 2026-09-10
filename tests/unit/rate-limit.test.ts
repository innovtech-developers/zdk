import { afterEach, describe, expect, it, vi } from "vitest";
import {
  millisecondsUntilReset,
  parseRateLimitHeaders,
  parseRetryAfterMs,
} from "../../src/core/rate-limit";

describe("parseRateLimitHeaders", () => {
  it("lê x-ratelimit-* (legacy) e converte reset absoluto para Date", () => {
    const headers = new Headers({
      "x-ratelimit-limit": "10000",
      "x-ratelimit-remaining": "7668",
      "x-ratelimit-reset": "1789060936",
    });
    const observedAt = new Date("2026-09-10T17:22:14.000Z");

    const snapshot = parseRateLimitHeaders(headers, observedAt);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.limit).toBe(10000);
    expect(snapshot?.remaining).toBe(7668);
    expect(snapshot?.resetAt.getTime()).toBe(1789060936 * 1000);
    expect(snapshot?.observedAt).toBe(observedAt);
  });

  it("lê ratelimit-* (draft) com reset como DELTA a partir de observedAt — semântica diferente da legacy", () => {
    const headers = new Headers({
      "ratelimit-limit": "100",
      "ratelimit-remaining": "42",
      "ratelimit-reset": "50",
    });
    const observedAt = new Date("2026-01-01T00:00:00.000Z");

    const snapshot = parseRateLimitHeaders(headers, observedAt);

    expect(snapshot?.resetAt.getTime()).toBe(observedAt.getTime() + 50_000);
  });

  it("legacy tem prioridade sobre draft quando ambos presentes", () => {
    const headers = new Headers({
      "x-ratelimit-limit": "10000",
      "x-ratelimit-remaining": "9999",
      "x-ratelimit-reset": "1000000000",
      "ratelimit-reset": "999999",
    });
    const observedAt = new Date();

    const snapshot = parseRateLimitHeaders(headers, observedAt);
    expect(snapshot?.resetAt.getTime()).toBe(1_000_000_000 * 1000);
  });

  it("sem os headers, devolve null (não quebra)", () => {
    expect(parseRateLimitHeaders(new Headers(), new Date())).toBeNull();
  });

  it("limit/remaining presentes mas sem NENHUM reset utilizável devolve null", () => {
    const headers = new Headers({ "x-ratelimit-limit": "10000", "x-ratelimit-remaining": "9999" });
    expect(parseRateLimitHeaders(headers, new Date())).toBeNull();
  });
});

describe("millisecondsUntilReset", () => {
  it("é a diferença entre resetAt e observedAt", () => {
    const observedAt = new Date("2026-09-10T17:22:14.000Z");
    const resetAt = new Date("2026-09-10T17:22:16.000Z");
    expect(millisecondsUntilReset({ resetAt, observedAt })).toBe(2_000);
  });

  it("nunca é negativo mesmo se resetAt já passou", () => {
    const observedAt = new Date("2026-09-10T17:22:20.000Z");
    const resetAt = new Date("2026-09-10T17:22:14.000Z");
    expect(millisecondsUntilReset({ resetAt, observedAt })).toBe(0);
  });
});

describe("parseRetryAfterMs", () => {
  it("interpreta valor numérico como segundos", () => {
    expect(parseRetryAfterMs("30", new Date())).toBe(30_000);
  });

  it("interpreta HTTP-date absoluta", () => {
    const observedAt = new Date("2026-09-10T17:22:14.000Z");
    const retryAfter = "Thu, 10 Sep 2026 17:22:44 GMT"; // +30s
    expect(parseRetryAfterMs(retryAfter, observedAt)).toBe(30_000);
  });

  it("null ou ausente devolve null", () => {
    expect(parseRetryAfterMs(null, new Date())).toBeNull();
    expect(parseRetryAfterMs("", new Date())).toBeNull();
  });

  it("valor ilegível devolve null em vez de quebrar", () => {
    expect(parseRetryAfterMs("não-é-nem-número-nem-data", new Date())).toBeNull();
  });

  it("nunca é negativo (data no passado)", () => {
    const observedAt = new Date("2026-09-10T17:22:14.000Z");
    expect(parseRetryAfterMs("Thu, 10 Sep 2026 17:00:00 GMT", observedAt)).toBe(0);
  });
});

describe("imunidade a relógio local errado (§5.8.4 — nunca Date.now())", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resultado idêntico com o relógio do sistema deslocado em 1 hora", () => {
    const headers = new Headers({
      "x-ratelimit-limit": "10000",
      "x-ratelimit-remaining": "7668",
      "x-ratelimit-reset": "1789060936",
    });
    const observedAt = new Date("2026-09-10T17:22:14.000Z");

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T17:22:14.000Z"));
    const withoutSkew = parseRateLimitHeaders(headers, observedAt);
    const waitWithoutSkew = millisecondsUntilReset(withoutSkew!);

    vi.setSystemTime(new Date("2026-09-10T18:22:14.000Z")); // +1h de skew no relógio "local"
    const withSkew = parseRateLimitHeaders(headers, observedAt);
    const waitWithSkew = millisecondsUntilReset(withSkew!);

    expect(waitWithSkew).toBe(waitWithoutSkew);
    expect(waitWithSkew).toBe(2_000);
  });

  it("parseRetryAfterMs com HTTP-date também é imune ao relógio local, pois usa observedAt explícito", () => {
    const observedAt = new Date("2026-09-10T17:22:14.000Z");
    const retryAfter = "Thu, 10 Sep 2026 17:22:44 GMT";

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T17:22:14.000Z"));
    const withoutSkew = parseRetryAfterMs(retryAfter, observedAt);

    vi.setSystemTime(new Date("2026-09-10T18:22:14.000Z"));
    const withSkew = parseRetryAfterMs(retryAfter, observedAt);

    expect(withSkew).toBe(withoutSkew);
    expect(withSkew).toBe(30_000);
  });
});
