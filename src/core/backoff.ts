/**
 * Cálculo do delay de retry: exponencial com full jitter (§5.8.2). Função
 * pura — sem `setTimeout`, sem `Math.random` direto — para o executor de
 * retry (T16) poder testar sem dormir de verdade e sem depender de
 * aleatoriedade real.
 *
 * Full jitter (não jitter fixo, não "equal jitter"): com vários workers do
 * mesmo tenant, um delay determinístico sincroniza as retentativas e produz
 * exatamente o pico de carga que o backoff existe para evitar.
 */

export interface BackoffOptions {
  /** Índice da retentativa, começando em 0 para a primeira retentativa (após a 1ª falha). */
  readonly retryIndex: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  /** @default Math.random */
  readonly random?: () => number;
}

/** `random_between(0, min(maxDelayMs, baseDelayMs * 2^retryIndex))` — fórmula padrão de full jitter. */
export function computeBackoffDelay(options: BackoffOptions): number {
  const random = options.random ?? Math.random;
  const exponential = options.baseDelayMs * 2 ** options.retryIndex;
  const cap = Math.min(options.maxDelayMs, exponential);
  return Math.floor(random() * cap);
}
