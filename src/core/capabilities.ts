/**
 * Descoberta de operações suportadas pela instância, em runtime (§5.2, Q15).
 * O contrato varia por versão implantada — `capabilities` é o único juiz de
 * disponibilidade real, nunca um flag estático.
 */

import type { HttpClient } from "./http-client";
import { listOperations, type OpenApiDocument } from "./openapi-shape";

export interface CapabilitiesOptions {
  readonly baseUrl: string;
  readonly httpClient: HttpClient;
  /** @default 10_000 */
  readonly timeoutMs?: number;
  /** Observa falha ao buscar o swagger — nunca bloqueia a chamada, só permite registrar. */
  readonly onLoadError?: (error: unknown) => void;
}

export class Capabilities {
  private cache: ReadonlySet<string> | null = null;
  private inFlight: Promise<ReadonlySet<string> | null> | null = null;

  constructor(private readonly options: CapabilitiesOptions) {}

  /**
   * Garante que o swagger da instância foi buscado (uma vez; cacheado depois
   * disso). Nunca lança: falha de rede, timeout ou JSON inválido viram
   * `null` — `supports()` passa a assumir tudo suportado.
   */
  async load(): Promise<ReadonlySet<string> | null> {
    if (this.cache !== null) return this.cache;
    this.inFlight ??= this.fetchOperations();
    this.cache = await this.inFlight;
    return this.cache;
  }

  /**
   * `true` se a operação existe no swagger desta instância. Antes de
   * `load()` completar, ou se a busca falhou: assume suportado — um falso
   * positivo aqui vira, na pior das hipóteses, um `404` explicado por
   * `ZdkUnsupportedOperationError`; um falso negativo bloquearia operação
   * válida por indisponibilidade do próprio endpoint de swagger.
   */
  supports(operation: string): boolean {
    if (this.cache === null) return true;
    return this.cache.has(operation);
  }

  private async fetchOperations(): Promise<ReadonlySet<string> | null> {
    try {
      const response = await this.options.httpClient.send({
        method: "GET",
        url: `${this.options.baseUrl}/swagger.json`,
        headers: {},
        timeoutMs: this.options.timeoutMs ?? 10_000,
      });
      if (!response.ok) return null;

      const document = (await response.json()) as OpenApiDocument;
      return listOperations(document);
    } catch (error) {
      this.options.onLoadError?.(error);
      return null;
    }
  }
}
