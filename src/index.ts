/**
 * Superfície pública do ZDK v1 — único ponto de entrada do pacote (§4/§5.9).
 * Tudo em `src/core` e `src/generated` fora daqui é implementação interna;
 * o que está aqui é o contrato que este pacote garante entre versões.
 */

// Fachada — o ponto de entrada de todo consumidor.
export { Zdk, default } from "./zdk";
export type { ZdkOptions, VerifyResult } from "./zdk";

// Erros — para instanceof/catch específico (§5.4). Nunca T | IError.
export {
  ZdkError,
  ZdkConfigError,
  ZdkNetworkError,
  ZdkTimeoutError,
  ZdkAbortError,
  ZdkUnsupportedOperationError,
  ZdkHttpError,
  ZdkValidationError,
  ZdkOfficialApiWindowError,
  ZdkAuthError,
  ZdkNotFoundError,
  ZdkRateLimitError,
  ZdkServerError,
} from "./core/errors";
export type {
  ZdkErrorOptions,
  ZdkNetworkErrorOptions,
  ZdkHttpErrorOptions,
  ZdkRateLimitErrorOptions,
} from "./core/errors";

// Resiliência configurável (§5.8) — tipos usados por `ZdkOptions.retryConfig`/`.semaphore`.
export { DEFAULT_RETRY_CONFIG, classifyFailure, isRetryableByDefault } from "./core/retry";
export type { RetryConfig, FailureKind, RetryDecisionContext, RetryAttemptInfo } from "./core/retry";
export { UNLIMITED_CONCURRENCY, ConcurrencyLimiter } from "./core/semaphore";
export type { Semaphore } from "./core/semaphore";
export type { RetryClass, OperationMetadata } from "./core/operation-metadata";
export type { RateLimitSnapshot } from "./core/rate-limit";
export type { RateLimitOptions } from "./core/api-client";

// Tipos derivados do contrato (§5.1) — para quem quiser tipar precisamente
// além do que os métodos de recurso já devolvem.
export type { OperationKey, ApiBody, ApiResponse, ApiParams, ApiContentType } from "./core/operation";

// Tipos de dados públicos, já com os overrides de contrato aplicados (§5.3).
export type {
  Connection,
  ConnectionList,
  Message,
  SendMessageResult,
  MessageTemplate,
  TemplateList,
  SendTemplateData,
  UploadTempData,
  UploadTempResponse,
  SendMediaMessageData,
  ContactPostData,
  ContactTagsPostData,
  TicketResolveFormData,
  WebhookPostData,
} from "./schema/types";

// Registry de defeitos do contrato (§5.3) — auditável, não escondido.
export { CONNECTION_STATUS, isUsableConnectionStatus, API_QUIRKS } from "./schema/overrides";
export type { ConnectionStatus, ApiQuirk } from "./schema/overrides";
