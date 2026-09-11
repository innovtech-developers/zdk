/**
 * Cobertura bidirecional (§9 critério 2, marco do plano após T28): toda
 * operação da UNIÃO dos snapshots reais tem pelo menos um método de recurso
 * que a usa, e todo `.request("...")` em `src/resources/` aponta pra uma
 * operação que de fato existe na união — nenhuma sobra de nenhum dos lados.
 *
 * A união é recomputada aqui com os MESMOS `mergeOpenApiDocuments`/
 * `listOperations` que `sync-api.ts` usa para gerar os tipos — não uma
 * contagem hardcoded, para não dessincronizar se os fixtures mudarem.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mergeOpenApiDocuments } from "../../scripts/merge-openapi";
import { listOperations, type OpenApiDocument } from "../../src/core/openapi-shape";
import type { SampledInstance } from "../../scripts/divergence-report";

function loadFixture(name: string): OpenApiDocument {
  const p = path.resolve(__dirname, "..", "fixtures", `swagger-${name}.json`);
  return JSON.parse(readFileSync(p, "utf-8")) as OpenApiDocument;
}

const instances: readonly SampledInstance[] = [
  { label: "zapcontabil", url: "https://api-zapcontabil.zapcontabil.chat", document: loadFixture("zapcontabil") },
  {
    label: "zapplataforma",
    url: "https://api-safiracosmeticos.zapplataforma.chat",
    document: loadFixture("zapplataforma"),
  },
];

const unionDocument = mergeOpenApiDocuments(instances);
const unionOperations = listOperations(unionDocument);

/** Todo `.request("MÉTODO /path", ...)` literal em `src/resources/*.ts`, via varredura de texto. */
function findOperationKeysUsedInResources(): ReadonlySet<string> {
  const resourcesDir = path.resolve(__dirname, "..", "..", "src", "resources");
  const files = readdirSync(resourcesDir).filter((file) => file.endsWith(".ts"));
  const found = new Set<string>();
  const pattern = /\.request\(\s*"([A-Z]+ [^"]+)"/g;

  for (const file of files) {
    const content = readFileSync(path.join(resourcesDir, file), "utf-8");
    for (const match of content.matchAll(pattern)) {
      const key = match[1];
      if (key) found.add(key);
    }
  }

  return found;
}

const usedKeys = findOperationKeysUsedInResources();

describe("cobertura bidirecional: união do contrato <-> src/resources/", () => {
  it("a união dos dois snapshots reais tem exatamente 48 operações", () => {
    expect(unionOperations.size).toBe(48);
  });

  it("toda operação da união é usada por pelo menos um método de recurso — nenhuma esquecida", () => {
    const missing = [...unionOperations].filter((operation) => !usedKeys.has(operation)).sort();
    expect(missing).toEqual([]);
  });

  it("todo .request(...) em src/resources/ aponta pra uma operação real da união — nenhum método órfão", () => {
    const orphans = [...usedKeys].filter((operation) => !unionOperations.has(operation)).sort();
    expect(orphans).toEqual([]);
  });

  it("nenhuma chave usada é uma string vazia ou malformada (sanidade da própria varredura)", () => {
    expect(usedKeys.size).toBeGreaterThan(0);
    for (const key of usedKeys) {
      expect(key).toMatch(/^[A-Z]+ \/.+$/);
    }
  });
});
