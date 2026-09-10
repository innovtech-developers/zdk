import { describe, expect, it } from "vitest";
import { computeBackoffDelay } from "../../src/core/backoff";

describe("computeBackoffDelay", () => {
  it("com random determinístico em 1, satura no cap (baseDelayMs * 2^retryIndex, limitado por maxDelayMs)", () => {
    const random = () => 1;
    expect(computeBackoffDelay({ retryIndex: 0, baseDelayMs: 250, maxDelayMs: 8_000, random })).toBe(250);
    expect(computeBackoffDelay({ retryIndex: 1, baseDelayMs: 250, maxDelayMs: 8_000, random })).toBe(500);
    expect(computeBackoffDelay({ retryIndex: 2, baseDelayMs: 250, maxDelayMs: 8_000, random })).toBe(1_000);
  });

  it("respeita maxDelayMs mesmo quando o exponencial estouraria", () => {
    const random = () => 1;
    // 250 * 2^10 = 256_000, bem acima do cap de 8_000
    expect(computeBackoffDelay({ retryIndex: 10, baseDelayMs: 250, maxDelayMs: 8_000, random })).toBe(8_000);
  });

  it("com random determinístico em 0, delay é sempre 0 (full jitter cobre a faixa inteira)", () => {
    const random = () => 0;
    expect(computeBackoffDelay({ retryIndex: 3, baseDelayMs: 250, maxDelayMs: 8_000, random })).toBe(0);
  });

  it("com random em 0.5, é metade do cap", () => {
    const random = () => 0.5;
    expect(computeBackoffDelay({ retryIndex: 0, baseDelayMs: 250, maxDelayMs: 8_000, random })).toBe(125);
  });

  it("Math.random é usado só quando random não é informado (default)", () => {
    const delay = computeBackoffDelay({ retryIndex: 0, baseDelayMs: 250, maxDelayMs: 8_000 });
    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(250);
  });

  it("delay nunca é negativo nem excede o cap, mesmo variando retryIndex e random", () => {
    for (let retryIndex = 0; retryIndex < 6; retryIndex += 1) {
      for (const random of [() => 0, () => 0.25, () => 0.75, () => 0.999]) {
        const delay = computeBackoffDelay({ retryIndex, baseDelayMs: 250, maxDelayMs: 8_000, random });
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(8_000);
      }
    }
  });
});
