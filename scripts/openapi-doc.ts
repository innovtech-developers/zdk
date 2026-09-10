/**
 * Formas mínimas de um documento OpenAPI 3.0 — só o que `sync-api.ts` precisa
 * para contar, diferenciar e unir. Sem `zod` nem parser completo: o documento
 * já vem validado pela própria Zappy; aqui só se lê a forma que interessa.
 */

export const HTTP_VERBS = ["get", "post", "put", "patch", "delete"] as const;
export type HttpVerb = (typeof HTTP_VERBS)[number];

export interface OpenApiOperation {
  readonly tags?: readonly string[];
  readonly [key: string]: unknown;
}

export type OpenApiPathItem = Partial<Record<HttpVerb, OpenApiOperation>>;

export interface OpenApiSchema {
  readonly properties?: Record<string, unknown>;
  readonly [key: string]: unknown;
}

export interface OpenApiDocument {
  readonly openapi?: string;
  readonly info?: { readonly version?: string; readonly title?: string };
  readonly servers?: readonly { readonly url: string }[];
  readonly paths: Record<string, OpenApiPathItem>;
  readonly components?: { readonly schemas?: Record<string, OpenApiSchema> };
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

export function listSchemaNames(doc: OpenApiDocument): ReadonlySet<string> {
  return new Set(Object.keys(doc.components?.schemas ?? {}));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isObjectSchema(schema: unknown): schema is OpenApiSchema {
  return isPlainObject(schema) && isPlainObject(schema["properties"]);
}
