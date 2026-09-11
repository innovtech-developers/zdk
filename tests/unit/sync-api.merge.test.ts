import { describe, expect, it } from "vitest";
import { mergeOpenApiDocuments } from "../../scripts/merge-openapi";
import { listOperations, listSchemaNames } from "../../scripts/openapi-doc";
import type { OpenApiDocument } from "../../scripts/openapi-doc";
import type { SampledInstance } from "../../scripts/divergence-report";

const docA: OpenApiDocument = {
  paths: {
    "/api/connections": { get: { description: "de A" } },
    "/api/webhooks": { get: {}, post: {} },
  },
  components: {
    schemas: {
      SendMediaMessage: { type: "object", properties: { media: {}, caption: {} } },
      Connection: { type: "object", properties: { id: {}, status: {} } },
    },
  },
};

const docB: OpenApiDocument = {
  paths: {
    "/api/connections": { get: { description: "de B" } },
  },
  components: {
    schemas: {
      SendMediaMessage: {
        type: "object",
        properties: { media: {}, caption: {}, ticketStrategy: {} },
      },
      Connection: { type: "object", properties: { id: {}, status: {} } },
    },
  },
};

const instances: SampledInstance[] = [
  { label: "a", url: "https://api-a.zapcontabil.chat", document: docA },
  { label: "b", url: "https://api-b.zapplataforma.chat", document: docB },
];

describe("mergeOpenApiDocuments", () => {
  it("une operações: path só em uma instância entra na união", () => {
    const merged = mergeOpenApiDocuments(instances);
    const ops = listOperations(merged);
    expect(ops.has("GET /api/connections")).toBe(true);
    expect(ops.has("GET /api/webhooks")).toBe(true);
    expect(ops.has("POST /api/webhooks")).toBe(true);
    expect(ops.size).toBe(3);
  });

  it("primeira instância vence em empate de operação compartilhada", () => {
    const merged = mergeOpenApiDocuments(instances);
    expect(merged.paths["/api/connections"]?.get?.description).toBe("de A");
  });

  it("une propriedades de schema compartilhado: propriedade só em B entra na união (Q15)", () => {
    const merged = mergeOpenApiDocuments(instances);
    const schema = merged.components?.schemas?.["SendMediaMessage"];
    expect(Object.keys(schema?.properties ?? {}).sort()).toEqual([
      "caption",
      "media",
      "ticketStrategy",
    ]);
  });

  it("schema sem divergência permanece igual", () => {
    const merged = mergeOpenApiDocuments(instances);
    const schema = merged.components?.schemas?.["Connection"];
    expect(Object.keys(schema?.properties ?? {}).sort()).toEqual(["id", "status"]);
  });

  it("schema presente numa única instância entra inteiro na união", () => {
    const withExtraSchema: OpenApiDocument = {
      paths: {},
      components: { schemas: { OnlyInA: { type: "object", properties: { x: {} } } } },
    };
    const merged = mergeOpenApiDocuments([
      { label: "a", url: "x", document: withExtraSchema },
      { label: "b", url: "y", document: docB },
    ]);
    expect(listSchemaNames(merged).has("OnlyInA")).toBe(true);
  });

  it("união de uma única instância é a própria instância", () => {
    const merged = mergeOpenApiDocuments([instances[0]!]);
    expect(listOperations(merged)).toEqual(listOperations(docA));
  });

  it("lança quando não há instância nenhuma", () => {
    expect(() => mergeOpenApiDocuments([])).toThrow(/nenhuma instância/);
  });
});
