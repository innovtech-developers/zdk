/**
 * Mapeia status HTTP + corpo de resposta para a subclasse certa de
 * `ZdkHttpError` (§5.4). Só é chamado para respostas já identificadas como
 * erro (status fora de 2xx) — quem decide isso é `api-client.ts` (T18).
 */

import {
  ZdkAuthError,
  ZdkHttpError,
  ZdkNotFoundError,
  ZdkOfficialApiWindowError,
  ZdkRateLimitError,
  ZdkServerError,
  ZdkValidationError,
} from "./errors";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `error` do corpo (`ERR_*` da Zappy) — o discriminante real (Q17). Ausente/malformado vira um código genérico. */
function extractErrorCode(payload: unknown): string {
  if (isPlainObject(payload) && typeof payload["error"] === "string" && payload["error"]) {
    return payload["error"];
  }
  return "ZDK_UNKNOWN_ERROR";
}

/** Prefere `message` (descritivo, presente em alguns corpos — ex. OfficialApiWindowError) ao código cru. */
function extractErrorMessage(payload: unknown, status: number, code: string): string {
  if (isPlainObject(payload) && typeof payload["message"] === "string" && payload["message"]) {
    return payload["message"];
  }
  return `HTTP ${status}: ${code}`;
}

export interface MapHttpErrorInput {
  readonly status: number;
  /** Corpo de resposta já desserializado (ou `undefined`/string se não era JSON). */
  readonly payload: unknown;
  readonly requestId?: string;
  /** Só relevante para 429; vem de `rate-limit.ts`, não é lido daqui. */
  readonly retryAfterMs?: number;
  readonly attempts?: number;
  readonly retryable?: boolean;
}

/** @param input.status Precondição: fora da faixa 2xx — quem chama já decidiu que é erro. */
export function mapHttpError(input: MapHttpErrorInput): ZdkHttpError {
  const code = extractErrorCode(input.payload);
  const message = extractErrorMessage(input.payload, input.status, code);
  const options = {
    status: input.status,
    payload: input.payload,
    requestId: input.requestId,
    attempts: input.attempts,
    retryable: input.retryable,
  };

  if (input.status === 400 && code === "ERR_OFFICIAL_API_WINDOW_CLOSED") {
    return new ZdkOfficialApiWindowError(message, code, options);
  }
  if (input.status === 400) {
    return new ZdkValidationError(message, code, options);
  }
  if (input.status === 401 || input.status === 403) {
    return new ZdkAuthError(message, code, options);
  }
  if (input.status === 404) {
    return new ZdkNotFoundError(message, code, options);
  }
  if (input.status === 429) {
    return new ZdkRateLimitError(message, code, { ...options, retryAfterMs: input.retryAfterMs });
  }
  if (input.status >= 500) {
    return new ZdkServerError(message, code, options);
  }

  // Status fora do que o contrato documenta ou observamos (Q13): tratado como
  // erro do consumidor por default, mais seguro que assumir servidor.
  return new ZdkValidationError(message, code, options);
}
