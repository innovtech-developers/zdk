#!/usr/bin/env tsx
/**
 * Baixa o swagger de N instâncias, salva cada snapshot em `tests/fixtures/`,
 * grava o relatório de divergência, une os documentos e gera
 * `src/generated/openapi.d.ts` via `openapi-typescript` (§5.1/§5.1.2).
 *
 * Uso:
 *   npm run sync:api -- --url https://api-x.zapcontabil.chat --url https://api-y.zapplataforma.chat
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString, type OpenAPI3 } from "openapi-typescript";
import { parseBaseUrl } from "../src/core/config";
import { buildDivergenceReport, formatDivergenceReport, type SampledInstance } from "./divergence-report";
import { mergeOpenApiDocuments } from "./merge-openapi";
import type { OpenApiDocument } from "./openapi-doc";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES_DIR = path.join(REPO_ROOT, "tests", "fixtures");
const DIVERGENCE_REPORT_PATH = path.join(REPO_ROOT, "docs", "API-DIVERGENCE.md");
const GENERATED_TYPES_PATH = path.join(REPO_ROOT, "src", "generated", "openapi.d.ts");

function parseArgs(argv: readonly string[]): string[] {
  const urls: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--url") {
      const value = argv[i + 1];
      if (!value) throw new Error("--url exige um valor");
      urls.push(value);
      i += 1;
    }
  }
  if (urls.length === 0) {
    throw new Error(
      "informe ao menos um --url (ex.: npm run sync:api -- --url https://api-x.zapcontabil.chat)",
    );
  }
  return urls;
}

/**
 * Rótulo do fixture: apex sem o TLD (`zapcontabil.chat` → `zapcontabil`).
 * Duas instâncias do MESMO apex nesta chamada colidem no mesmo arquivo —
 * limitação aceita por ora (YAGNI); quando fizer falta, vira `--label` explícito.
 */
function labelFor(baseUrl: string): string {
  const host = new URL(baseUrl).hostname;
  const apex = host.split(".").slice(-2).join(".");
  return apex.replace(/\.chat$/, "");
}

async function fetchSwagger(baseUrl: string): Promise<OpenApiDocument> {
  const response = await fetch(`${baseUrl}/swagger.json`);
  if (!response.ok) {
    throw new Error(`GET ${baseUrl}/swagger.json -> HTTP ${response.status}`);
  }
  return (await response.json()) as OpenApiDocument;
}

async function sampleInstance(rawUrl: string): Promise<SampledInstance> {
  const url = parseBaseUrl(rawUrl);
  const label = labelFor(url);
  console.log(`baixando ${url}/swagger.json ...`);
  const document = await fetchSwagger(url);

  mkdirSync(FIXTURES_DIR, { recursive: true });
  const fixturePath = path.join(FIXTURES_DIR, `swagger-${label}.json`);
  writeFileSync(fixturePath, `${JSON.stringify(document, null, 2)}\n`, "utf-8");
  console.log(`  salvo em ${path.relative(REPO_ROOT, fixturePath)}`);

  return { label, url, document };
}

async function main(): Promise<void> {
  const urls = parseArgs(process.argv.slice(2));
  const instances = await Promise.all(urls.map(sampleInstance));

  const report = buildDivergenceReport(instances);
  const text = formatDivergenceReport(report);

  console.log("");
  console.log(text);

  mkdirSync(path.dirname(DIVERGENCE_REPORT_PATH), { recursive: true });
  writeFileSync(
    DIVERGENCE_REPORT_PATH,
    [
      "# Divergência entre instâncias da API Zappy",
      "",
      "Gerado por `npm run sync:api`. Não editar à mão — a próxima execução sobrescreve.",
      "",
      "```",
      text,
      "```",
      "",
    ].join("\n"),
    "utf-8",
  );
  console.log(`\nrelatório gravado em ${path.relative(REPO_ROOT, DIVERGENCE_REPORT_PATH)}`);

  const merged = mergeOpenApiDocuments(instances);
  console.log("\ngerando tipos a partir da união...");
  // `OpenApiDocument` é uma forma mínima e deliberadamente mais frouxa que
  // `OpenAPI3` (§scripts/openapi-doc.ts) — só o que o sync precisa ler. O
  // documento já é um swagger real e válido; o cast documenta a fronteira.
  const ast = await openapiTS(merged as unknown as OpenAPI3);
  const body = astToString(ast);

  mkdirSync(path.dirname(GENERATED_TYPES_PATH), { recursive: true });
  writeFileSync(
    GENERATED_TYPES_PATH,
    [
      "/**",
      " * GERADO por `npm run sync:api` a partir da união dos swaggers de:",
      ...instances.map((i) => ` *   - ${i.url}`),
      " * Não editar à mão — a próxima execução sobrescreve (§5.1.2 da spec).",
      " */",
      "",
      body,
    ].join("\n"),
    "utf-8",
  );
  console.log(`tipos gravados em ${path.relative(REPO_ROOT, GENERATED_TYPES_PATH)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
