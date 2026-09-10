/**
 * Limite de concorrência opcional (§5.8.5 — substituto de custo quase nulo ao
 * circuit breaker). Sem estado entre chamadas além do contador de ativos;
 * default é ilimitado, para não mudar throughput de quem já usa a lib em
 * lote em upgrade da v0.7.
 */

export interface Semaphore {
  /** Resolve quando há vaga; devolve a função de liberar (chamar sempre, inclusive em erro). */
  acquire(): Promise<() => void>;
}

export class ConcurrencyLimiter implements Semaphore {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number) {
    if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
      throw new Error(`maxConcurrent deve ser inteiro >= 1, recebeu ${maxConcurrent}`);
    }
  }

  async acquire(): Promise<() => void> {
    if (this.active < this.maxConcurrent) {
      this.active += 1;
      return () => this.release();
    }

    await new Promise<void>((resolve) => this.waiting.push(resolve));
    this.active += 1;
    return () => this.release();
  }

  private release(): void {
    this.active -= 1;
    const next = this.waiting.shift();
    if (next) next();
  }
}

/** `acquire()` resolve na hora, sempre — é o default (`maxConcurrent` ilimitado). */
export const UNLIMITED_CONCURRENCY: Semaphore = Object.freeze({
  async acquire(): Promise<() => void> {
    return () => {};
  },
});
