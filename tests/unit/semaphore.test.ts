import { describe, expect, it } from "vitest";
import { ConcurrencyLimiter, UNLIMITED_CONCURRENCY } from "../../src/core/semaphore";

describe("UNLIMITED_CONCURRENCY", () => {
  it("acquire() resolve imediatamente, sempre", async () => {
    const releases = await Promise.all([
      UNLIMITED_CONCURRENCY.acquire(),
      UNLIMITED_CONCURRENCY.acquire(),
      UNLIMITED_CONCURRENCY.acquire(),
    ]);
    for (const release of releases) release();
  });
});

describe("ConcurrencyLimiter", () => {
  it("lança na construção se maxConcurrent < 1 ou não-inteiro", () => {
    expect(() => new ConcurrencyLimiter(0)).toThrow();
    expect(() => new ConcurrencyLimiter(-1)).toThrow();
    expect(() => new ConcurrencyLimiter(1.5)).toThrow();
  });

  it("permite até maxConcurrent aquisições simultâneas sem esperar", async () => {
    const limiter = new ConcurrencyLimiter(2);
    const order: string[] = [];

    const releaseA = await limiter.acquire();
    order.push("A adquiriu");
    const releaseB = await limiter.acquire();
    order.push("B adquiriu");

    expect(order).toEqual(["A adquiriu", "B adquiriu"]);
    releaseA();
    releaseB();
  });

  it("a (maxConcurrent+1)-ésima aquisição só resolve depois de um release", async () => {
    const limiter = new ConcurrencyLimiter(1);
    const order: string[] = [];

    const releaseA = await limiter.acquire();
    order.push("A adquiriu");

    let bAcquired = false;
    const bPromise = limiter.acquire().then((release) => {
      bAcquired = true;
      order.push("B adquiriu");
      return release;
    });

    // dá chance ao microtask queue rodar — B não deveria ter adquirido ainda
    await Promise.resolve();
    await Promise.resolve();
    expect(bAcquired).toBe(false);

    releaseA();
    const releaseB = await bPromise;
    expect(bAcquired).toBe(true);
    expect(order).toEqual(["A adquiriu", "B adquiriu"]);
    releaseB();
  });

  it("libera em ordem FIFO quando várias aquisições esperam", async () => {
    const limiter = new ConcurrencyLimiter(1);
    const release0 = await limiter.acquire();

    const order: string[] = [];
    const p1 = limiter.acquire().then((release) => {
      order.push("1");
      return release;
    });
    const p2 = limiter.acquire().then((release) => {
      order.push("2");
      return release;
    });

    release0();
    const release1 = await p1;
    release1();
    await p2;

    expect(order).toEqual(["1", "2"]);
  });
});
