/**
 * Transporte HTTP (§5). `HttpClient` é a interface mínima que o resto do
 * core depende — qualquer implementação a satisfaz (LSP), e é o que os
 * testes injetam no lugar de `FetchHttpClient`.
 */

import { ZdkAbortError, ZdkNetworkError, ZdkTimeoutError } from "./errors";
import type { RawBody } from "./request-builder";

export interface HttpRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: RawBody;
  /** Timeout desta tentativa. Sempre presente — quem decide o valor é `api-client.ts`/`operation-metadata.ts`. */
  readonly timeoutMs: number;
  /** `AbortSignal` do consumidor, opcional. Acionado por ele nunca conta como timeout (§5.4). */
  readonly signal?: AbortSignal;
}

export interface HttpClient {
  send(request: HttpRequest): Promise<Response>;
}

function hasStringCode(value: unknown): value is { code: string } {
  return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>)["code"] === "string";
}

export class FetchHttpClient implements HttpClient {
  async send(request: HttpRequest): Promise<Response> {
    const timeoutSignal = AbortSignal.timeout(request.timeoutMs);
    const signal = request.signal ? AbortSignal.any([timeoutSignal, request.signal]) : timeoutSignal;

    try {
      return await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal,
      });
    } catch (error) {
      // Precedência: abort do PRÓPRIO consumidor sempre vence — é vontade
      // explícita de quem chamou, nunca deve ser lido como timeout nosso.
      if (request.signal?.aborted) {
        throw new ZdkAbortError("requisição abortada pelo consumidor", { cause: error });
      }
      if (timeoutSignal.aborted) {
        throw new ZdkTimeoutError(
          `tempo limite de ${request.timeoutMs}ms excedido`,
          request.timeoutMs,
          { cause: error },
        );
      }

      // `fetch` nativo esconde o código real da falha em `error.cause.code`
      // (undici) — sem lê-lo, DNS e ECONNRESET ficam indistinguíveis (R4).
      const cause = error instanceof Error ? error.cause : undefined;
      const code = hasStringCode(cause) ? cause.code : undefined;
      throw new ZdkNetworkError(
        code ? `falha de transporte: ${code}` : "falha de transporte",
        { cause: error },
      );
    }
  }
}
