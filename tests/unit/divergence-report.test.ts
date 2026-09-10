import { describe, expect, it } from "vitest";
import { buildDivergenceReport, formatDivergenceReport } from "../../scripts/divergence-report";
import type { OpenApiDocument } from "../../scripts/openapi-doc";

/**
 * Dois documentos sintéticos pequenos, deliberadamente no formato dos reais
 * (Q15): uma operação só em A, uma propriedade só em B no mesmo schema
 * compartilhado. Mitigação de R1 antes de rodar contra os documentos reais.
 */
const docA: OpenApiDocument = {
  paths: {
    "/api/connections": { get: {} },
    "/api/webhooks": { get: {}, post: {} },
  },
  components: {
    schemas: {
      SendMediaMessage: { properties: { media: {}, caption: {} } },
      Connection: { properties: { id: {}, status: {} } },
    },
  },
};

const docB: OpenApiDocument = {
  paths: {
    "/api/connections": { get: {} },
  },
  components: {
    schemas: {
      SendMediaMessage: { properties: { media: {}, caption: {}, ticketStrategy: {} } },
      Connection: { properties: { id: {}, status: {} } },
    },
  },
};

describe("buildDivergenceReport", () => {
  it("conta operações e schemas por instância", () => {
    const report = buildDivergenceReport([
      { label: "a", url: "https://api-a.zapcontabil.chat", document: docA },
      { label: "b", url: "https://api-b.zapcontabil.chat", document: docB },
    ]);

    expect(report.instances).toEqual([
      { label: "a", url: "https://api-a.zapcontabil.chat", operationCount: 3, schemaCount: 2 },
      { label: "b", url: "https://api-b.zapcontabil.chat", operationCount: 1, schemaCount: 2 },
    ]);
  });

  it("união é a soma das operações distintas", () => {
    const report = buildDivergenceReport([
      { label: "a", url: "x", document: docA },
      { label: "b", url: "y", document: docB },
    ]);
    // GET /api/connections (comum) + GET,POST /api/webhooks (só em a) = 3
    expect(report.unionOperationCount).toBe(3);
    expect(report.unionSchemaCount).toBe(2);
  });

  it("detecta operação exclusiva de uma instância", () => {
    const report = buildDivergenceReport([
      { label: "a", url: "x", document: docA },
      { label: "b", url: "y", document: docB },
    ]);

    expect(report.exclusiveOperationsByInstance).toEqual([
      { label: "a", operations: ["GET /api/webhooks", "POST /api/webhooks"] },
    ]);
  });

  it("detecta propriedade divergente no mesmo schema compartilhado (Q15)", () => {
    const report = buildDivergenceReport([
      { label: "a", url: "x", document: docA },
      { label: "b", url: "y", document: docB },
    ]);

    expect(report.divergentProperties).toEqual([
      { schema: "SendMediaMessage", property: "ticketStrategy", presentIn: ["b"] },
    ]);
  });

  it("schema ausente por inteiro numa instância não conta como propriedade divergente", () => {
    const withExtraSchema: OpenApiDocument = {
      paths: {},
      components: { schemas: { OnlyInA: { properties: { x: {} } } } },
    };
    const report = buildDivergenceReport([
      { label: "a", url: "x", document: withExtraSchema },
      { label: "b", url: "y", document: docB },
    ]);
    expect(report.divergentProperties).toEqual([]);
    expect(report.exclusiveSchemasByInstance).toEqual([
      { label: "a", schemas: ["OnlyInA"] },
      { label: "b", schemas: ["Connection", "SendMediaMessage"] },
    ]);
  });

  it("nenhuma divergência com documentos idênticos", () => {
    const report = buildDivergenceReport([
      { label: "a", url: "x", document: docA },
      { label: "b", url: "y", document: docA },
    ]);
    expect(report.exclusiveOperationsByInstance).toEqual([]);
    expect(report.exclusiveSchemasByInstance).toEqual([]);
    expect(report.divergentProperties).toEqual([]);
  });

  it("uma única instância não gera divergência nenhuma (nada para comparar)", () => {
    const report = buildDivergenceReport([{ label: "a", url: "x", document: docA }]);
    expect(report.exclusiveOperationsByInstance).toEqual([]);
    expect(report.divergentProperties).toEqual([]);
    expect(report.unionOperationCount).toBe(3);
  });
});

describe("formatDivergenceReport", () => {
  it("produz texto legível com contagens, exclusivos e propriedades divergentes", () => {
    const report = buildDivergenceReport([
      { label: "a", url: "https://api-a.zapcontabil.chat", document: docA },
      { label: "b", url: "https://api-b.zapplataforma.chat", document: docB },
    ]);
    const text = formatDivergenceReport(report);

    expect(text).toMatch(/^a\s+3 ops, 2 schemas/m);
    expect(text).toMatch(/^b\s+1 ops, 2 schemas/m);
    expect(text).toMatch(/^união\s+3 ops, 2 schemas/m);
    expect(text).toContain("só em a (2):");
    expect(text).toContain("GET /api/webhooks, POST /api/webhooks");
    expect(text).toContain("SendMediaMessage.ticketStrategy — só em b");
  });
});
