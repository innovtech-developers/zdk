/**
 * Forma mínima de um documento OpenAPI 3 e `listOperations` — publicado
 * porque `capabilities.ts` (runtime, T17) precisa disso tanto quanto
 * `scripts/sync-api.ts` (build-time, T06/T07). Sem `zod` nem parser
 * completo: o documento já vem validado pela própria Zappy.
 */

export const HTTP_VERBS = ["get", "post", "put", "patch", "delete"] as const;
export type HttpVerb = (typeof HTTP_VERBS)[number];

export interface OpenApiOperation {
  readonly tags?: readonly string[];
  readonly [key: string]: unknown;
}

export type OpenApiPathItem = Partial<Record<HttpVerb, OpenApiOperation>>;

export interface OpenApiDocument {
  readonly paths: Record<string, OpenApiPathItem>;
  readonly [key: string]: unknown;
}

/** `"MÉTODO /path"` para cada operação que de fato existe (verbo presente no path item). */
export function listOperations(doc: OpenApiDocument): ReadonlySet<string> {
  const operations = new Set<string>();
  for (const [pathName, pathItem] of Object.entries(doc.paths)) {
    for (const verb of HTTP_VERBS) {
      if (pathItem[verb] !== undefined) {
        operations.add(`${verb.toUpperCase()} ${pathName}`);
      }
    }
  }
  return operations;
}
