/**
 * Extensão de `src/core/openapi-shape.ts` só para o que `sync-api.ts`
 * precisa em build-time: diferenciar e unir SCHEMAS (não só operações — isso
 * já é o núcleo publicado, reusado aqui em vez de duplicado).
 */

export { HTTP_VERBS, listOperations, type HttpVerb, type OpenApiOperation, type OpenApiPathItem } from "../src/core/openapi-shape";

export interface OpenApiSchema {
  readonly properties?: Record<string, unknown>;
  readonly [key: string]: unknown;
}

export interface OpenApiDocument {
  readonly openapi?: string;
  readonly info?: { readonly version?: string; readonly title?: string };
  readonly servers?: readonly { readonly url: string }[];
  readonly paths: Record<string, import("../src/core/openapi-shape").OpenApiPathItem>;
  readonly components?: { readonly schemas?: Record<string, OpenApiSchema> };
  readonly [key: string]: unknown;
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
