/**
 * HttpClient de teste. Implementa a interface real (`HttpClient`, T14) — a
 * conformidade deixou de ser estrutural-por-coincidência (quando T14 ainda
 * não existia) e passou a ser garantida pelo compilador via `implements`.
 */

import type { HttpClient, HttpRequest } from "../../src/core/http-client";

export type FakeHttpRequest = HttpRequest;

export interface FakeResponseSpec {
  readonly status: number;
  readonly headers?: Record<string, string>;
  /** JSON-serializável. Omitir gera corpo vazio (ex.: 204). */
  readonly body?: unknown;
}

export class FakeHttpClient implements HttpClient {
  readonly calls: FakeHttpRequest[] = [];

  private readonly queue: FakeResponseSpec[] = [];

  enqueue(spec: FakeResponseSpec): this {
    this.queue.push(spec);
    return this;
  }

  get requestCount(): number {
    return this.calls.length;
  }

  async send(request: HttpRequest): Promise<Response> {
    this.calls.push(request);

    const spec = this.queue.shift();
    if (!spec) {
      throw new Error(
        `FakeHttpClient: nenhuma resposta enfileirada para ${request.method} ${request.url}`,
      );
    }

    return new Response(spec.body === undefined ? null : JSON.stringify(spec.body), {
      status: spec.status,
      headers: spec.headers,
    });
  }
}
