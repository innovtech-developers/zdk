/**
 * Leitura do orçamento de rate limit a partir dos headers de resposta (§5.8.4,
 * Q8/Q14). A Zappy expõe `x-ratelimit-*` (legacy, confirmado por observação
 * real) — este módulo também lê `ratelimit-*` (draft IETF) para sobreviver a
 * uma troca do limitador no servidor.
 *
 * Toda conta de tempo aqui é contra o relógio do SERVIDOR (`observedAt`, o
 * header `date` da resposta) — nunca `Date.now()`. Provado na prática:
 * `x-ratelimit-reset` é epoch absoluto (uma amostra deu `reset - date = 2s`
 * com a janela fechando; outra deu 31s com `remaining` no máximo — a duração
 * da janela não é derivável e não faz falta, só o instante final importa).
 */

export interface RateLimitSnapshot {
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: Date;
  readonly observedAt: Date;
}

function readNumberHeader(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * @param observedAt Data da resposta (header `date`), NUNCA `new Date()` do
 *   cliente — é o que torna o cálculo imune a relógio local errado.
 */
export function parseRateLimitHeaders(headers: Headers, observedAt: Date): RateLimitSnapshot | null {
  const limit = readNumberHeader(headers, "x-ratelimit-limit") ?? readNumberHeader(headers, "ratelimit-limit");
  const remaining =
    readNumberHeader(headers, "x-ratelimit-remaining") ?? readNumberHeader(headers, "ratelimit-remaining");

  if (limit === null || remaining === null) return null;

  // Legacy: `x-ratelimit-reset` é epoch absoluto em segundos (confirmado).
  const legacyReset = readNumberHeader(headers, "x-ratelimit-reset");
  if (legacyReset !== null) {
    return { limit, remaining, resetAt: new Date(legacyReset * 1000), observedAt };
  }

  // Draft IETF (sem prefixo `x-`): `reset` é DELTA em segundos a partir da
  // resposta — semântica diferente da legacy, não é o mesmo cálculo.
  const draftReset = readNumberHeader(headers, "ratelimit-reset");
  if (draftReset !== null) {
    return { limit, remaining, resetAt: new Date(observedAt.getTime() + draftReset * 1000), observedAt };
  }

  return null;
}

/** Espera até `resetAt`, nunca negativa (a janela já pode ter virado entre a resposta e o cálculo). */
export function millisecondsUntilReset(snapshot: Pick<RateLimitSnapshot, "resetAt" | "observedAt">): number {
  return Math.max(0, snapshot.resetAt.getTime() - snapshot.observedAt.getTime());
}

/**
 * `Retry-After` (RFC 9110): segundos (delta) OU data HTTP absoluta. Ausente
 * ou ilegível → `null`, para o chamador cair no fallback de `x-ratelimit-reset`.
 */
export function parseRetryAfterMs(value: string | null, observedAt: Date): number | null {
  if (!value) return null;

  const asSeconds = Number(value);
  if (Number.isFinite(asSeconds)) {
    return Math.max(0, asSeconds * 1000);
  }

  const asDate = new Date(value);
  if (!Number.isNaN(asDate.getTime())) {
    return Math.max(0, asDate.getTime() - observedAt.getTime());
  }

  return null;
}
