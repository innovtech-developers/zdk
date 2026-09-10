/**
 * HttpClient de teste. Não importa nada de `src/core` de propósito: o contrato
 * (`send(request): Promise<Response>`) é estrutural, então a implementação real
 * (`FetchHttpClient`, T14) só precisa satisfazer a mesma forma — LSP sem acoplar
 * o helper de teste ao módulo de produção antes dele existir.
 */

export interface FakeHttpRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string | FormData | Uint8Array;
  readonly signal?: AbortSignal;
}

export interface FakeResponseSpec {
  readonly status: number;
  readonly headers?: Record<string, string>;
  /** JSON-serializável. Omitir gera corpo vazio (ex.: 204). */
  readonly body?: unknown;
}

export class FakeHttpClient {
  readonly calls: FakeHttpRequest[] = [];

  private readonly queue: FakeResponseSpec[] = [];

  enqueue(spec: FakeResponseSpec): this {
    this.queue.push(spec);
    return this;
  }

  get requestCount(): number {
    return this.calls.length;
  }

  async send(request: FakeHttpRequest): Promise<Response> {
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
