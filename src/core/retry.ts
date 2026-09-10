/**
 * Executor de retry: classifica a falha, decide por operação (§5.8.3) e
 * aplica backoff. A tabela completa vive aqui, não espalhada — segurança de
 * retry não se decide por método HTTP, e sim por *o que já pode ter
 * acontecido no servidor*.
 */

import { computeBackoffDelay } from "./backoff";
import {
  ZdkAbortError,
  ZdkError,
  ZdkHttpError,
  ZdkNetworkError,
  ZdkRateLimitError,
  ZdkServerError,
  ZdkTimeoutError,
} from "./errors";
import type { RetryClass } from "./operation-metadata";

export interface RetryConfig {
  readonly attempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  /** `Retry-After`/`x-ratelimit-reset` acima disso: falha rápido em vez de dormir. */
  readonly maxRetryAfterMs: number;
  /** Master switch: por padrão, NENHUMA classe repete em timeout — ambíguo por natureza (§5.8.2). */
  readonly retryOnTimeout: boolean;
  /** Rege `safe`/`guarded` em 429. RFC 9110: rejeitado antes do processamento. */
  readonly retryOnRateLimit: boolean;
  /** Rege `unsafe` em 429 — desligado até o código do limitador ser identificado (§5.8.4). */
  readonly retryUnsafeOnRateLimit: boolean;
  /** Teto de wall clock do total de tentativas. `null` = sem teto (default; pior caso documentado no README). */
  readonly deadlineMs: number | null;
  /** @default Math.random */
  readonly random?: () => number;
  /** @default setTimeout-based sleep */
  readonly sleep?: (ms: number) => Promise<void>;
  readonly onRetry?: (info: RetryAttemptInfo) => void;
  /** `undefined` delega ao default da tabela — não é obrigado a decidir tudo. */
  readonly shouldRetry?: (context: RetryDecisionContext) => boolean | undefined;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = Object.freeze({
  attempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 8_000,
  maxRetryAfterMs: 30_000,
  retryOnTimeout: false,
  retryOnRateLimit: true,
  retryUnsafeOnRateLimit: false,
  deadlineMs: null,
});

export type FailureKind =
  | "preauth-network"
  | "ambiguous-network"
  | "timeout"
  | "rate-limit"
  | "service-unavailable"
  | "server-error"
  | "client-error"
  | "abort"
  | "unknown";

/** DNS/conexão recusada: provadamente pré-envio, os bytes não saíram. */
const PREAUTH_TRANSPORT_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"]);

/** Classifica o erro capturado numa das categorias da tabela — pura, sem I/O. */
export function classifyFailure(error: unknown): FailureKind {
  if (error instanceof ZdkAbortError) return "abort";
  if (error instanceof ZdkTimeoutError) return "timeout";
  if (error instanceof ZdkRateLimitError) return "rate-limit";
  if (error instanceof ZdkServerError) return error.status === 503 ? "service-unavailable" : "server-error";
  if (error instanceof ZdkHttpError) return "client-error"; // 400/401/403/404/409 e demais mapeados
  if (error instanceof ZdkNetworkError) {
    return error.transportCode && PREAUTH_TRANSPORT_CODES.has(error.transportCode)
      ? "preauth-network"
      : "ambiguous-network"; // ECONNRESET ou código desconhecido: na dúvida, ambíguo
  }
  return "unknown"; // erro que não veio da lib — fail-safe: não repete
}

/** A tabela de §5.8.3, como função. */
export function isRetryableByDefault(
  kind: FailureKind,
  retryClass: RetryClass,
  config: Pick<RetryConfig, "retryOnTimeout" | "retryOnRateLimit" | "retryUnsafeOnRateLimit">,
): boolean {
  switch (kind) {
  case "preauth-network":
    return true;
  case "ambiguous-network":
    return retryClass !== "unsafe";
  case "timeout":
    return config.retryOnTimeout && retryClass === "safe";
  case "rate-limit":
    return retryClass === "unsafe" ? config.retryUnsafeOnRateLimit : config.retryOnRateLimit;
  case "service-unavailable":
    return retryClass !== "unsafe";
  case "server-error":
    return retryClass === "safe";
  case "client-error":
  case "abort":
  case "unknown":
    return false;
  }
}

export interface RetryDecisionContext {
  readonly error: unknown;
  readonly kind: FailureKind;
  readonly attempt: number;
  readonly retryClass: RetryClass;
  readonly operation: string;
}

export interface RetryAttemptInfo {
  readonly attempt: number;
  readonly delayMs: number;
  readonly error: unknown;
  readonly operation: string;
}

async function defaultSleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Delay antes da próxima tentativa, ou `null` para desistir (não é "sem
 * classe permitida" — é "permitido, mas a espera pedida é grande demais").
 */
function computeRetryDelay(
  error: unknown,
  retryIndex: number,
  config: Pick<RetryConfig, "baseDelayMs" | "maxDelayMs" | "maxRetryAfterMs" | "random">,
): number | null {
  if (error instanceof ZdkRateLimitError && typeof error.retryAfterMs === "number") {
    if (error.retryAfterMs > config.maxRetryAfterMs) return null;
    return error.retryAfterMs;
  }
  return computeBackoffDelay({
    retryIndex,
    baseDelayMs: config.baseDelayMs,
    maxDelayMs: config.maxDelayMs,
    random: config.random,
  });
}

/** Estampa o resultado do processo de retry na própria instância — ver comentário de `ZdkError` (§errors.ts). */
function stampOutcome(error: unknown, attempts: number, retryable: boolean): void {
  if (error instanceof ZdkError) {
    error.attempts = attempts;
    error.retryable = retryable;
  }
}

export interface RetryContext {
  /** `OperationKey` ou string livre — só para logging/`onRetry`. */
  readonly operation: string;
  readonly retryClass: RetryClass;
}

/**
 * Executa `fn`, repetindo conforme a tabela de §5.8.3 e `config`.
 * @throws o próprio erro da última tentativa, com `attempts`/`retryable` finais.
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  context: RetryContext,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
  const sleep = config.sleep ?? defaultSleep;
  const startedAt = Date.now();

  let lastError: unknown;
  // Verdict da POLÍTICA (classe + tipo de falha), não "sobrou orçamento para
  // tentar de novo" — são perguntas diferentes. Um ECONNRESET em operação
  // `safe` é retryable mesmo na 3ª tentativa (esgotou orçamento, não deixou
  // de ser o tipo de falha que se repete); um 404 nunca é, mesmo na 1ª.
  let lastAllowedByPolicy = false;
  let attempt = 0;

  for (attempt = 1; attempt <= config.attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const kind = classifyFailure(error);
      const decision = config.shouldRetry?.({
        error,
        kind,
        attempt,
        retryClass: context.retryClass,
        operation: context.operation,
      });
      const allowed = decision ?? isRetryableByDefault(kind, context.retryClass, config);
      lastAllowedByPolicy = allowed;

      const isLastAttempt = attempt === config.attempts;
      if (isLastAttempt || !allowed) break;

      const delayMs = computeRetryDelay(error, attempt - 1, config);
      if (delayMs === null) break;

      if (config.deadlineMs !== null && Date.now() - startedAt + delayMs > config.deadlineMs) break;

      config.onRetry?.({ attempt, delayMs, error, operation: context.operation });
      await sleep(delayMs);
    }
  }

  // `attempt` parou em N sem incrementar de novo no `break`, então é a contagem real de tentativas feitas.
  stampOutcome(lastError, attempt, lastAllowedByPolicy);
  throw lastError;
}
