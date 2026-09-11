/**
 * Composição final: `request<K extends OperationKey>()` é o único ponto que
 * junta request-builder, http-client, retry, semáforo, rate-limit,
 * error-mapper e capabilities (§5). Nenhum recurso (T19+) fala com essas
 * peças diretamente — todos passam por aqui.
 */

import { buildRequest, type MultipartBody, type RequestBody } from "./request-builder";
import type { HttpClient } from "./http-client";
import { executeWithRetry, DEFAULT_RETRY_CONFIG, type RetryConfig } from "./retry";
import { UNLIMITED_CONCURRENCY, type Semaphore } from "./semaphore";
import { OPERATION_METADATA, DEFAULT_TIMEOUT_MS } from "./operation-metadata";
import { mapHttpError } from "./error-mapper";
import { ZdkUnsupportedOperationError } from "./errors";
import { millisecondsUntilReset, parseRateLimitHeaders, parseRetryAfterMs, type RateLimitSnapshot } from "./rate-limit";
import type { Capabilities } from "./capabilities";
import type { ApiContentType, ApiResponse, OperationKey } from "./operation";

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly token: string;
  readonly httpClient: HttpClient;
  readonly capabilities: Capabilities;
  readonly semaphore?: Semaphore;
  /** Parcial: mesclado por cima de DEFAULT_RETRY_CONFIG (não precisa especificar todos os campos). */
  readonly retryConfig?: Partial<RetryConfig>;
  /** Timeout global de fallback — só vale para operação sem motivo técnico próprio (§5.8.1). @default 10_000 */
  readonly defaultTimeoutMs?: number;
  /** Pré-checa `capabilities` em TODA chamada, antes do HTTP. @default false — custo de rede só quando pedido. */
  readonly verifyCapabilities?: boolean;
  /** Observa o orçamento de rate limit em toda resposta com os headers presentes (sucesso ou falha). */
  readonly onRateLimit?: (snapshot: RateLimitSnapshot) => void;
  /** Comportamento de rate limit (§5.8.4). @default `{ mode: "observe" }` */
  readonly rateLimit?: RateLimitOptions;
  /** @default setTimeout-based sleep — trocável em teste. */
  readonly sleep?: (ms: number) => Promise<void>;
}

export interface RateLimitOptions {
  /**
   * `"observe"` (default): nunca dorme sozinho — só expõe o snapshot via
   * `onRateLimit`. Latência escondida em SDK é pior que erro visível.
   * `"throttle"`: pausa PROATIVAMENTE, antes da próxima chamada, quando o
   * orçamento observado da chamada anterior já está no ou abaixo de
   * `reserve` — para job em lote, onde esperar é melhor que tomar `429`.
   */
  readonly mode?: "observe" | "throttle";
  /** Em modo `throttle`: pausa quando `remaining <= reserve`. @default 0 */
  readonly reserve?: number;
}

async function defaultSleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export interface ApiRequestOptions<K extends OperationKey> {
  readonly pathParams?: Readonly<Record<string, string | number>>;
  readonly query?: Readonly<
    Record<string, string | number | boolean | readonly (string | number)[] | undefined>
  >;
  /**
   * Corpo JSON — a maioria das operações. Mutuamente exclusivo com
   * `multipart`/`rawBody`. Valor é `unknown` (não `ApiBody<K,...>`) de
   * propósito, pelo mesmo motivo de `multipart` já usar `MultipartBody`
   * genérico: a segurança de tipo real fica no método do RECURSO (T19+),
   * que pode passar um `ApiBody<K>` cru OU um tipo corrigido por
   * `RequiredBy`/`OptionalBy` (Q3/Q24) — o primeiro é sempre mais estrito e
   * o segundo às vezes mais permissivo que o gerado, e um slot fixo em
   * `ApiBody<K,...>` não aceitaria o segundo caso. A ELEGIBILIDADE por
   * content-type continua garantida: `never` quando a operação não aceita
   * json (ex.: `upload-temp`, só multipart).
   */
  readonly json?: "application/json" extends ApiContentType<K> ? unknown : never;
  /** Corpo multipart — upload de mídia. Mutuamente exclusivo com `json`/`rawBody`. */
  readonly multipart?: "multipart/form-data" extends ApiContentType<K> ? MultipartBody : never;
  /** Escape hatch bruto (R5) — bypassa `json`/`multipart` por completo. */
  readonly rawBody?: RequestBody;
  readonly extraHeaders?: Readonly<Record<string, string>>;
  /** Override desta chamada — vence qualquer default (§5.8.1). */
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly retryConfig?: Partial<RetryConfig>;
}

function splitOperationKey(key: OperationKey): { readonly method: string; readonly path: string } {
  const spaceIndex = key.indexOf(" ");
  return { method: key.slice(0, spaceIndex), path: key.slice(spaceIndex + 1) };
}

async function safeParseJson(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}

export class ApiClient {
  private lastRateLimitSnapshot: RateLimitSnapshot | null = null;

  constructor(private readonly options: ApiClientOptions) {}

  /**
   * Executa a operação. Body é serializado por `request-builder` (§5.1);
   * resposta é o `ApiResponse<K>` cru do contrato — overrides de
   * `schema/overrides.ts` (Q18 etc.) são responsabilidade do recurso (T19+),
   * não deste método.
   * @throws {ZdkError} sempre uma subclasse; nunca `T | IError`.
   */
  async request<K extends OperationKey>(
    key: K,
    requestOptions: ApiRequestOptions<K> = {},
  ): Promise<ApiResponse<K>> {
    const { method, path } = splitOperationKey(key);
    const metadata = OPERATION_METADATA[key];
    const timeoutMs = this.resolveTimeoutMs(requestOptions.timeoutMs, metadata.timeoutMs);
    const retryConfig: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...this.options.retryConfig,
      ...requestOptions.retryConfig,
    };

    if (this.options.verifyCapabilities) {
      await this.assertSupported(key);
    }

    await this.maybeThrottle();

    const attempt = async (): Promise<Response> => {
      const prepared = buildRequest({
        method,
        path,
        baseUrl: this.options.baseUrl,
        token: this.options.token,
        pathParams: requestOptions.pathParams,
        query: requestOptions.query,
        extraHeaders: requestOptions.extraHeaders,
        body: this.resolveRequestBody(requestOptions),
      });

      const semaphore = this.options.semaphore ?? UNLIMITED_CONCURRENCY;
      const release = await semaphore.acquire();
      try {
        return await this.options.httpClient.send({
          method: prepared.method,
          url: prepared.url,
          headers: prepared.headers,
          body: prepared.body,
          timeoutMs,
          signal: requestOptions.signal,
        });
      } finally {
        release();
      }
    };

    const response = await executeWithRetry(
      async () => {
        const raw = await attempt();
        this.emitRateLimit(raw);
        if (raw.ok) return raw;
        throw await this.toError(raw, key);
      },
      { operation: key, retryClass: metadata.retryClass },
      retryConfig,
    );

    return (await safeParseJson(response)) as ApiResponse<K>;
  }

  /** `zdk.supports(key)`/gate proativo: garante o carregamento e checa sem fazer requisição HTTP nenhuma além do próprio swagger. */
  async assertSupported(key: OperationKey): Promise<void> {
    await this.options.capabilities.load();
    if (!this.options.capabilities.supports(key)) {
      throw new ZdkUnsupportedOperationError(
        `"${key}" não existe na versão desta instância`,
        key,
      );
    }
  }

  private resolveRequestBody(requestOptions: ApiRequestOptions<OperationKey>): RequestBody | undefined {
    if (requestOptions.rawBody) return requestOptions.rawBody;
    if (requestOptions.multipart) return { kind: "multipart", fields: requestOptions.multipart as MultipartBody };
    if (requestOptions.json !== undefined) return { kind: "json", value: requestOptions.json };
    return undefined;
  }

  /** Timeout resolvido por §5.8.1: chamada > operação (quando não é o sentinela genérico) > config global > 10s. */
  private resolveTimeoutMs(perCall: number | undefined, operationDefault: number): number {
    if (perCall !== undefined) return perCall;
    if (operationDefault !== DEFAULT_TIMEOUT_MS) return operationDefault;
    return this.options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private emitRateLimit(response: Response): void {
    const dateHeader = response.headers.get("date");
    const observedAt = dateHeader ? new Date(dateHeader) : new Date();
    const snapshot = parseRateLimitHeaders(response.headers, observedAt);
    if (!snapshot) return;

    // Guardado sempre (mode "throttle" precisa dele mesmo sem onRateLimit
    // configurado); o hook só dispara se o consumidor de fato o passou.
    this.lastRateLimitSnapshot = snapshot;
    this.options.onRateLimit?.(snapshot);
  }

  /**
   * Modo `"throttle"` (opt-in, §5.8.4): antes de fazer a PRÓXIMA chamada,
   * pausa até `resetAt` se o snapshot da chamada anterior já mostrava
   * `remaining <= reserve`. Nunca dorme sozinho no modo `"observe"` (default).
   */
  private async maybeThrottle(): Promise<void> {
    if ((this.options.rateLimit?.mode ?? "observe") !== "throttle") return;

    const snapshot = this.lastRateLimitSnapshot;
    if (!snapshot) return;

    const reserve = this.options.rateLimit?.reserve ?? 0;
    if (snapshot.remaining > reserve) return;

    const waitMs = millisecondsUntilReset(snapshot);
    if (waitMs <= 0) return;

    const sleep = this.options.sleep ?? defaultSleep;
    await sleep(waitMs);
  }

  private async toError(response: Response, key: OperationKey): Promise<Error> {
    if (response.status === 404) {
      const capabilities = await this.options.capabilities.load();
      if (capabilities !== null && !capabilities.has(key)) {
        return new ZdkUnsupportedOperationError(
          `"${key}" não existe na versão desta instância`,
          key,
        );
      }
      // capabilities indisponível (busca falhou) ou operação de fato existe:
      // 404 genuíno — segue para o mapeamento normal abaixo.
    }

    const payload = await safeParseJson(response);
    const requestId = response.headers.get("x-request-id") ?? undefined;
    const retryAfterMs = response.status === 429 ? this.resolveRetryAfterMs(response) : undefined;

    return mapHttpError({ status: response.status, payload, requestId, retryAfterMs });
  }

  private resolveRetryAfterMs(response: Response): number | undefined {
    const dateHeader = response.headers.get("date");
    const observedAt = dateHeader ? new Date(dateHeader) : new Date();

    const fromRetryAfter = parseRetryAfterMs(response.headers.get("retry-after"), observedAt);
    if (fromRetryAfter !== null) return fromRetryAfter;

    const snapshot = parseRateLimitHeaders(response.headers, observedAt);
    return snapshot ? millisecondsUntilReset(snapshot) : undefined;
  }
}
