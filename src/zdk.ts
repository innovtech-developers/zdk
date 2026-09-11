/**
 * Fachada pública do ZDK v1 (§5.6/§5.7 da spec). Compõe os 12 recursos sobre
 * um `ApiClient` único; `new Zdk()` é síncrono e sem I/O — só valida
 * formato. Prova de credencial é sempre explícita, via `verify()` ou
 * `Zdk.connect()`.
 */

import { resolveConfig, type ZdkConfigInput } from "./core/config";
import { ApiClient, type RateLimitOptions } from "./core/api-client";
import { FetchHttpClient } from "./core/http-client";
import { Capabilities } from "./core/capabilities";
import type { RetryConfig } from "./core/retry";
import { UNLIMITED_CONCURRENCY, type Semaphore } from "./core/semaphore";
import type { RateLimitSnapshot } from "./core/rate-limit";
import { ZdkConfigError } from "./core/errors";
import type { Connection } from "./schema/types";

import { Connections } from "./resources/connections";
import { Contacts } from "./resources/contacts";
import { Tags } from "./resources/tags";
import { Queues } from "./resources/queues";
import { Users } from "./resources/users";
import { Messages } from "./resources/messages";
import { Tickets } from "./resources/tickets";
import { Templates } from "./resources/templates";
import { Storage } from "./resources/storage";
import { Webhooks } from "./resources/webhooks";
import { Dashboard } from "./resources/dashboard";
import { Metrics } from "./resources/metrics";

export interface ZdkOptions extends ZdkConfigInput {
  readonly semaphore?: Semaphore;
  /** Parcial: mesclado por cima de DEFAULT_RETRY_CONFIG (não precisa especificar todos os campos). */
  readonly retryConfig?: Partial<RetryConfig>;
  /** Timeout global de fallback — só vale para operação sem motivo técnico próprio (§5.8.1). @default 10_000 */
  readonly defaultTimeoutMs?: number;
  /** Pré-checa `capabilities` em toda chamada, antes do HTTP. @default false */
  readonly verifyCapabilities?: boolean;
  /** Comportamento de rate limit (§5.8.4). @default `{ mode: "observe" }` — nunca dorme sozinho. */
  readonly rateLimit?: RateLimitOptions;
  /** Observa o orçamento de rate limit em toda resposta com os headers presentes — além de `zdk.rateLimit`, que é sempre atualizado. */
  readonly onRateLimit?: (snapshot: RateLimitSnapshot) => void;
}

export interface VerifyResult {
  readonly connections: readonly Connection[];
  readonly rateLimit: RateLimitSnapshot | null;
}

export class Zdk {
  private readonly apiClient: ApiClient;
  private readonly capabilityRegistry: Capabilities;
  private lastRateLimit: RateLimitSnapshot | null = null;

  readonly connections: Connections;
  readonly contacts: Contacts;
  readonly tags: Tags;
  readonly queues: Queues;
  readonly users: Users;
  readonly messages: Messages;
  readonly tickets: Tickets;
  readonly templates: Templates;
  readonly storage: Storage;
  readonly webhooks: Webhooks;
  readonly dashboard: Dashboard;
  readonly metrics: Metrics;

  /** Síncrono, zero I/O — valida só `baseUrl`/`token` (§5.6). Prova de credencial é `verify()`/`connect()`. */
  constructor(options: ZdkOptions = {}) {
    const config = resolveConfig(options);
    const httpClient = new FetchHttpClient();
    this.capabilityRegistry = new Capabilities({ baseUrl: config.baseUrl, httpClient });

    this.apiClient = new ApiClient({
      baseUrl: config.baseUrl,
      token: config.token,
      httpClient,
      capabilities: this.capabilityRegistry,
      semaphore: options.semaphore ?? UNLIMITED_CONCURRENCY,
      retryConfig: options.retryConfig,
      defaultTimeoutMs: options.defaultTimeoutMs,
      verifyCapabilities: options.verifyCapabilities ?? false,
      rateLimit: options.rateLimit,
      onRateLimit: (snapshot) => {
        this.lastRateLimit = snapshot;
        options.onRateLimit?.(snapshot);
      },
    });

    this.connections = new Connections(this.apiClient);
    this.contacts = new Contacts(this.apiClient);
    this.tags = new Tags(this.apiClient);
    this.queues = new Queues(this.apiClient);
    this.users = new Users(this.apiClient);
    this.messages = new Messages(this.apiClient);
    this.tickets = new Tickets(this.apiClient);
    this.templates = new Templates(this.apiClient);
    this.storage = new Storage(this.apiClient);
    this.webhooks = new Webhooks(this.apiClient);
    this.dashboard = new Dashboard(this.apiClient);
    this.metrics = new Metrics(this.apiClient);
  }

  /** Orçamento de rate limit da última resposta com os headers presentes (§5.8.4). `null` até a primeira. */
  get rateLimit(): RateLimitSnapshot | null {
    return this.lastRateLimit;
  }

  /** Gate proativo (§5.2): garante o swagger da instância carregado (1x, cacheado). */
  async capabilities(): Promise<ReadonlySet<string> | null> {
    return this.capabilityRegistry.load();
  }

  /** `true` se a operação existe no swagger desta instância. Antes de `capabilities()` carregar: assume suportado. */
  supports(operation: string): boolean {
    return this.capabilityRegistry.supports(operation);
  }

  /**
   * Prova as credenciais contra `GET /api/connections` — reusa
   * `connections.list()`, então é a chamada de bootstrap que qualquer envio
   * ia precisar de qualquer forma, não health check desperdiçado.
   * @throws {ZdkAuthError} 401 — `code` distingue `ERR_INVALID_API_KEY`
   *   (token errado) de `ERR_NO_AUTH_HEADER_PRESENT` (bug do SDK).
   * @throws {ZdkConfigError} `2xx` sem `connections` — host não parece ser a API Zappy.
   * @throws {ZdkNetworkError} host inalcançável.
   */
  async verify(): Promise<VerifyResult> {
    const connections = await this.connections.list();
    if (!Array.isArray(connections)) {
      throw new ZdkConfigError(
        "resposta de GET /api/connections não tem o formato esperado — este host não parece ser a API da Zappy",
      );
    }
    return { connections, rateLimit: this.lastRateLimit };
  }

  /** `new Zdk(options)` seguido de `verify()` — só a instância já provada. */
  static async connect(options: ZdkOptions = {}): Promise<Zdk> {
    const zdk = new Zdk(options);
    await zdk.verify();
    return zdk;
  }
}

export default Zdk;
