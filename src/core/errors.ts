/**
 * Hierarquia de erros do ZDK (§5.4 da spec). Toda falha de rede, HTTP ou de
 * configuração chega ao consumidor como `throw` de uma destas classes — nunca
 * como `T | IError` (v0.7).
 *
 * `attempts` e `retryable` existem em todo erro para o consumidor distinguir
 * "falhou de primeira" de "falhou após esgotar as tentativas". Diferente de
 * `code`/`status`/`payload`/`cause` — fatos fixos no instante do evento —,
 * estes dois são NÃO-readonly de propósito: descrevem o resultado do
 * PROCESSO de retry ao redor do erro, que só se conclui depois que o erro já
 * existe. Quem os popula é o executor de retry (T16), estampando na própria
 * instância antes do `throw` final — não há reconstrução genérica de uma
 * subclasse desconhecida, e a identidade do erro (`instanceof`) para quem
 * captura rio abaixo continua intacta. Erro lançado fora do loop de retry
 * (ex.: `ZdkConfigError`, que nunca chega a fazer requisição) fica só com o
 * default seguro: 1 tentativa, não retryable.
 */

export interface ZdkErrorOptions {
  readonly cause?: unknown;
  readonly attempts?: number;
  readonly retryable?: boolean;
}

export abstract class ZdkError extends Error {
  abstract readonly code: string;

  readonly cause?: unknown;
  /** Mutável — ver comentário do módulo. */
  attempts: number;
  /** Mutável — ver comentário do módulo. */
  retryable: boolean;

  protected constructor(message: string, options: ZdkErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.cause = options.cause;
    this.attempts = options.attempts ?? 1;
    this.retryable = options.retryable ?? false;

    // `Error` nativo quebra a cadeia de protótipo ao ser transpilado para
    // ES5-alvo; no target es2022 isto é um no-op inócuo, mantido por segurança.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** `baseUrl` ou `token` ausente ou inválido (§5.6). Nunca chega a fazer requisição. */
export class ZdkConfigError extends ZdkError {
  readonly code = "ZDK_CONFIG_ERROR";

  constructor(message: string, options: ZdkErrorOptions = {}) {
    super(message, options);
  }
}

export interface ZdkNetworkErrorOptions extends ZdkErrorOptions {
  /**
   * Código real da falha de transporte (`ENOTFOUND`, `ECONNREFUSED`,
   * `ECONNRESET`, …), extraído de `cause.cause.code` por quem constrói o
   * erro (`http-client.ts`) — `fetch` nativo não expõe isso em nenhum outro
   * lugar (R4 do plano). Estruturado aqui para o classificador de retry
   * (T16) não precisar conhecer essa cadeia de `cause` aninhada.
   */
  readonly transportCode?: string;
}

/** Falha de transporte (DNS, conexão recusada, socket derrubado, …). */
export class ZdkNetworkError extends ZdkError {
  readonly code = "ZDK_NETWORK_ERROR";
  readonly transportCode?: string;

  constructor(message: string, options: ZdkNetworkErrorOptions = {}) {
    super(message, options);
    this.transportCode = options.transportCode;
  }
}

/** Estourou o timeout de uma tentativa (§5.8.1). Nunca sofre retry automático por default. */
export class ZdkTimeoutError extends ZdkError {
  readonly code = "ZDK_TIMEOUT_ERROR";
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, options: ZdkErrorOptions = {}) {
    super(message, options);
    this.timeoutMs = timeoutMs;
  }
}

/** `AbortSignal` do próprio consumidor foi acionado. Nunca sofre retry — é vontade de quem chamou. */
export class ZdkAbortError extends ZdkError {
  readonly code = "ZDK_ABORT_ERROR";

  constructor(message: string, options: ZdkErrorOptions = {}) {
    super(message, options);
  }
}

/**
 * Operação existe na união de tipos, mas não no swagger *desta* instância (§5.2, Q15).
 * `operation` é a `OperationKey` (ex.: `"GET /api/webhooks"`) — tipada como `string`
 * aqui para não acoplar `core/errors.ts` a `core/operation.ts` (T08) antes da hora.
 */
export class ZdkUnsupportedOperationError extends ZdkError {
  readonly code = "ZDK_UNSUPPORTED_OPERATION";
  readonly operation: string;

  constructor(message: string, operation: string, options: ZdkErrorOptions = {}) {
    super(message, options);
    this.operation = operation;
  }
}

export interface ZdkHttpErrorOptions extends ZdkErrorOptions {
  readonly status: number;
  /** Corpo de resposta completo, preservando `errorData` não documentado (Q17). */
  readonly payload: unknown;
  readonly requestId?: string;
}

/**
 * Erro HTTP (2xx tratado como erro pelo contrato, ou 4xx/5xx). `code` não é fixo
 * por classe — vem do campo `error` do corpo (`ERR_*` da Zappy), o discriminante
 * real (§5.4). Quem decide a subclasse é `error-mapper.ts` (T09), a partir do
 * `status`.
 */
export abstract class ZdkHttpError extends ZdkError {
  readonly code: string;
  readonly status: number;
  readonly payload: unknown;
  readonly requestId?: string;

  protected constructor(message: string, code: string, options: ZdkHttpErrorOptions) {
    super(message, options);
    this.code = code;
    this.status = options.status;
    this.payload = options.payload;
    this.requestId = options.requestId;
  }
}

/** 400 genérico. */
export class ZdkValidationError extends ZdkHttpError {
  constructor(message: string, code: string, options: ZdkHttpErrorOptions) {
    super(message, code, options);
  }
}

/**
 * 400 com `code === "ERR_OFFICIAL_API_WINDOW_CLOSED"` (Q6): a janela de 24h da
 * API Oficial fechou e a mensagem exige template em vez de texto livre.
 */
export class ZdkOfficialApiWindowError extends ZdkHttpError {
  constructor(message: string, code: string, options: ZdkHttpErrorOptions) {
    super(message, code, options);
  }
}

/**
 * 401 ou 403. `code` distingue a causa real — `ERR_INVALID_API_KEY` (token
 * errado, problema do consumidor) de `ERR_NO_AUTH_HEADER_PRESENT` (header não
 * foi enviado, bug do SDK) — observado em produção (Q13, Q17).
 */
export class ZdkAuthError extends ZdkHttpError {
  constructor(message: string, code: string, options: ZdkHttpErrorOptions) {
    super(message, code, options);
  }
}

/** 404. */
export class ZdkNotFoundError extends ZdkHttpError {
  constructor(message: string, code: string, options: ZdkHttpErrorOptions) {
    super(message, code, options);
  }
}

export interface ZdkRateLimitErrorOptions extends ZdkHttpErrorOptions {
  /** Espera recomendada antes de repetir, derivada de `Retry-After` ou de `x-ratelimit-reset` (§5.8.4). */
  readonly retryAfterMs?: number;
}

/** 429 (Q8/Q14). O rate limit da Zappy roda antes da autenticação — observado, não documentado. */
export class ZdkRateLimitError extends ZdkHttpError {
  readonly retryAfterMs?: number;

  constructor(message: string, code: string, options: ZdkRateLimitErrorOptions) {
    super(message, code, options);
    this.retryAfterMs = options.retryAfterMs;
  }
}

/** 5xx. */
export class ZdkServerError extends ZdkHttpError {
  constructor(message: string, code: string, options: ZdkHttpErrorOptions) {
    super(message, code, options);
  }
}
