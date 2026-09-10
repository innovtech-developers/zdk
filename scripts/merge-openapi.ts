/**
 * União de N documentos OpenAPI num só, para servir de baseline aos tipos
 * (§5.1/§5.1.2). Regra: uma operação ou propriedade que exista em QUALQUER
 * instância amostrada entra na união — nenhuma instância é "a" referência.
 *
 * Em empate (mesma chave presente em mais de uma instância com conteúdo
 * diferente), vale a primeira instância na ordem dos `--url` recebidos.
 * Determinístico, mas arbitrário — não há, hoje, um caso real de conflito
 * genuíno (só presença/ausência), então não há tie-break mais sofisticado
 * que valha a pena (YAGNI).
 */

import { HTTP_VERBS, isObjectSchema, type OpenApiDocument, type OpenApiPathItem, type OpenApiSchema } from "./openapi-doc";
import type { SampledInstance } from "./divergence-report";

function mergePathItem(items: readonly OpenApiPathItem[]): OpenApiPathItem {
  const merged: OpenApiPathItem = {};
  for (const verb of HTTP_VERBS) {
    for (const item of items) {
      const operation = item[verb];
      if (operation !== undefined && merged[verb] === undefined) {
        merged[verb] = operation;
      }
    }
  }
  return merged;
}

function mergeSchema(variants: readonly OpenApiSchema[]): OpenApiSchema {
  const base = variants[0];
  if (!base) throw new Error("mergeSchema: nenhuma variante");

  const mergedProperties: Record<string, unknown> = {};
  let sawObjectSchema = false;
  for (const schema of variants) {
    if (isObjectSchema(schema)) {
      sawObjectSchema = true;
      for (const [key, value] of Object.entries(schema.properties ?? {})) {
        if (!(key in mergedProperties)) mergedProperties[key] = value;
      }
    }
  }

  return sawObjectSchema ? { ...base, properties: mergedProperties } : base;
}

export function mergeOpenApiDocuments(instances: readonly SampledInstance[]): OpenApiDocument {
  const base = instances[0]?.document;
  if (!base) throw new Error("mergeOpenApiDocuments: nenhuma instância para unir");

  const pathNames = new Set<string>();
  for (const instance of instances) for (const name of Object.keys(instance.document.paths)) pathNames.add(name);

  const mergedPaths: Record<string, OpenApiPathItem> = {};
  for (const pathName of pathNames) {
    const items = instances
      .map((instance) => instance.document.paths[pathName])
      .filter((item): item is OpenApiPathItem => item !== undefined);
    mergedPaths[pathName] = mergePathItem(items);
  }

  const schemaNames = new Set<string>();
  for (const instance of instances) {
    for (const name of Object.keys(instance.document.components?.schemas ?? {})) schemaNames.add(name);
  }

  const mergedSchemas: Record<string, OpenApiSchema> = {};
  for (const schemaName of schemaNames) {
    const variants = instances
      .map((instance) => instance.document.components?.schemas?.[schemaName])
      .filter((schema): schema is OpenApiSchema => schema !== undefined);
    mergedSchemas[schemaName] = mergeSchema(variants);
  }

  return {
    ...base,
    paths: mergedPaths,
    components: { ...base.components, schemas: mergedSchemas },
  };
}
