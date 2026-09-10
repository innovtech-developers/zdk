/**
 * Monta a requisição concreta (método, URL, headers, corpo) a partir de
 * parâmetros de path/query e de um corpo JSON ou multipart (§5). Não sabe
 * nada de `OperationKey` — isso é papel do `api-client.ts` (T18), que só usa
 * este módulo como peça.
 */

import type { ReadableStream } from "node:stream/web";

export type MultipartFieldValue = string | number | boolean | Blob | Uint8Array;

export type MultipartBody = Readonly<
  Record<string, MultipartFieldValue | readonly MultipartFieldValue[] | undefined>
>;

/** Corpo já pronto no formato final, passado direto ao `HttpClient` (escape hatch — inclusive stream, R5). */
export type RawBody = string | FormData | Blob | Uint8Array | ReadableStream;

export type RequestBody =
  | { readonly kind: "json"; readonly value: unknown }
  | { readonly kind: "multipart"; readonly fields: MultipartBody }
  | { readonly kind: "raw"; readonly value: RawBody };

export interface BuildRequestInput {
  readonly method: string;
  /** Caminho com placeholders `{nome}`, relativo à `baseUrl`. Ex.: `"/api/tickets/{id}"`. */
  readonly path: string;
  readonly baseUrl: string;
  readonly token: string;
  readonly pathParams?: Readonly<Record<string, string | number>>;
  /** Chave com valor `undefined` é OMITIDA da query — nunca vira `chave=` vazio nem sobra typo de nome. */
  readonly query?: Readonly<Record<string, string | number | boolean | undefined>>;
  readonly body?: RequestBody;
  readonly extraHeaders?: Readonly<Record<string, string>>;
}

export interface PreparedRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string | FormData | Blob | Uint8Array | ReadableStream;
  /** `false` quando repetir a requisição mandaria corpo diferente, vazio ou já consumido (R5). */
  readonly retryable: boolean;
}

function buildUrl(
  baseUrl: string,
  path: string,
  pathParams: Readonly<Record<string, string | number>> | undefined,
  query: Readonly<Record<string, string | number | boolean | undefined>> | undefined,
): string {
  let resolvedPath = path;
  for (const [key, value] of Object.entries(pathParams ?? {})) {
    const placeholder = `{${key}}`;
    if (!resolvedPath.includes(placeholder)) {
      throw new Error(
        `request-builder: parâmetro de path "${key}" não corresponde a nenhum placeholder em "${path}"`,
      );
    }
    resolvedPath = resolvedPath.replaceAll(placeholder, encodeURIComponent(String(value)));
  }
  if (/\{[^}]+\}/.test(resolvedPath)) {
    throw new Error(`request-builder: path "${path}" ficou com placeholder não resolvido: "${resolvedPath}"`);
  }

  const url = new URL(baseUrl + resolvedPath);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function appendMultipartField(
  form: FormData,
  key: string,
  value: MultipartFieldValue | readonly MultipartFieldValue[] | undefined,
): void {
  if (value === undefined) return;

  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    if (item instanceof Blob) {
      form.append(key, item);
    } else if (item instanceof Uint8Array) {
      form.append(key, new Blob([item]));
    } else {
      form.append(key, String(item));
    }
  }
}

/** Toda parte de um multipart montado por nós é string/Blob/Uint8Array — sempre em memória, sempre seguro repetir. */
function isRetryableRawBody(value: RawBody): boolean {
  if (typeof value === "string") return true;
  if (value instanceof Uint8Array) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof FormData !== "undefined" && value instanceof FormData) return true;
  return false; // ReadableStream (ou outra coisa não reconhecida): single-use, não repetir
}

export function buildRequest(input: BuildRequestInput): PreparedRequest {
  const url = buildUrl(input.baseUrl, input.path, input.pathParams, input.query);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${input.token}`,
    ...input.extraHeaders,
  };

  if (!input.body) {
    return { method: input.method, url, headers, retryable: true };
  }

  if (input.body.kind === "json") {
    headers["Content-Type"] = "application/json";
    return {
      method: input.method,
      url,
      headers,
      body: JSON.stringify(input.body.value),
      retryable: true,
    };
  }

  if (input.body.kind === "multipart") {
    // Sem Content-Type manual: o boundary do multipart precisa ser gerado
    // pelo próprio `fetch`/undici a partir do FormData.
    const form = new FormData();
    for (const [key, value] of Object.entries(input.body.fields)) {
      appendMultipartField(form, key, value);
    }
    return { method: input.method, url, headers, body: form, retryable: true };
  }

  return {
    method: input.method,
    url,
    headers,
    body: input.body.value,
    retryable: isRetryableRawBody(input.body.value),
  };
}
