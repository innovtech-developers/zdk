/**
 * Valida o registry de `API_QUIRKS` contra os dois snapshots reais (§5.3).
 * Quirk estruturalmente verificável no documento OpenAPI: teste próprio
 * abaixo, que FALHA se a Zappy corrigir o defeito — sinal de que o override
 * correspondente virou dívida e pode (deve) ser simplificado.
 *
 * Nem todo quirk vive no documento — vários são comportamento em runtime já
 * cobertos em outro lugar; a nota "não verificável aqui" abaixo documenta
 * onde cada um É verificado, para nenhum ficar sem teste em lugar nenhum.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { API_QUIRKS } from "../../src/schema/overrides";

interface RawSchema {
  readonly required?: readonly string[];
  readonly properties?: Record<string, { readonly required?: boolean; readonly type?: string; readonly [k: string]: unknown }>;
  readonly [key: string]: unknown;
}

interface RawParameter {
  readonly name: string;
  readonly required?: boolean;
  readonly schema?: { readonly type?: string; readonly maxItems?: number; readonly maximum?: number };
}

interface RawDocument {
  readonly paths: Record<string, Record<string, { readonly parameters?: readonly RawParameter[]; readonly requestBody?: { readonly content?: Record<string, unknown> }; readonly responses?: Record<string, unknown> }>>;
  readonly components: { readonly schemas: Record<string, RawSchema> };
}

function loadFixture(name: string): RawDocument {
  const p = path.resolve(__dirname, "..", "fixtures", `swagger-${name}.json`);
  return JSON.parse(readFileSync(p, "utf-8")) as RawDocument;
}

const zapcontabil = loadFixture("zapcontabil");
const zapplataforma = loadFixture("zapplataforma");
const bothInstances = [
  ["zapcontabil", zapcontabil] as const,
  ["zapplataforma", zapplataforma] as const,
];

describe("registry API_QUIRKS", () => {
  it("tem os 21 ids esperados, sem duplicata", () => {
    const ids = API_QUIRKS.map((q) => q.id);
    expect(ids).toHaveLength(21);
    expect(new Set(ids).size).toBe(21);
  });

  it("toda entrada tem id, at e reason não vazios", () => {
    for (const quirk of API_QUIRKS) {
      expect(quirk.id).toMatch(/^Q\d+$/);
      expect(quirk.at.length).toBeGreaterThan(0);
      expect(quirk.reason.length).toBeGreaterThan(0);
    }
  });
});

describe("Q1 — Connection.status sem WHATSAPP_AUTH no contrato", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const status = doc.components.schemas["Connection"]?.["properties"]?.["status"] as { enum?: readonly string[] } | undefined;
    expect(status?.enum).not.toContain("WHATSAPP_AUTH");
  });
});

describe("Q2 — schemas de resposta sem `required` no topo", () => {
  it.each(bothInstances)("%s: Connection e Ticket ainda sem required[]", (_label, doc) => {
    expect(doc.components.schemas["Connection"]?.required).toBeUndefined();
    expect(doc.components.schemas["Ticket"]?.required).toBeUndefined();
  });
});

describe("Q3 — required:true inline (inválido em OpenAPI 3)", () => {
  it.each(bothInstances)("%s: ContactPostData.name e TagPostData.name", (_label, doc) => {
    expect(doc.components.schemas["ContactPostData"]?.properties?.["name"]?.required).toBe(true);
    expect(doc.components.schemas["TagPostData"]?.properties?.["name"]?.required).toBe(true);
  });
});

describe("Q4 — id de path de send-template ainda não é required", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const params = doc.paths["/api/tickets/{id}/send-template"]?.["post"]?.parameters ?? [];
    const idParam = params.find((p) => p.name === "id");
    expect(idParam?.required).not.toBe(true);
  });
});

describe("Q5 — filtros de GET /api/messages ainda sem schema.type", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const params = doc.paths["/api/messages"]?.["get"]?.parameters ?? [];
    for (const name of ["ticketId", "contactId", "dateFrom", "dateTo"]) {
      const param = params.find((p) => p.name === name);
      expect(param?.schema).toBeUndefined();
    }
  });
});

describe("Q9 — pageSize ainda sem limite superior", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const params = doc.paths["/api/contacts"]?.["get"]?.parameters ?? [];
    const pageSize = params.find((p) => p.name === "pageSize");
    expect(pageSize?.schema?.maximum).toBeUndefined();
  });
});

describe("Q10 — SendTemplateBulk.to ainda sem maxItems", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const to = doc.components.schemas["SendTemplateBulk"]?.["properties"]?.["to"] as { maxItems?: number } | undefined;
    expect(to?.maxItems).toBeUndefined();
  });
});

describe("Q13 — 401 ainda documentado só numa operação (não em GET /api/connections)", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const connectionsResponses = doc.paths["/api/connections"]?.["get"]?.responses ?? {};
    expect(Object.keys(connectionsResponses)).not.toContain("401");

    const multipleResponses = doc.paths["/api/messages/multiple/{to}"]?.["post"]?.responses ?? {};
    expect(Object.keys(multipleResponses)).toContain("401");
  });
});

describe("Q18 — GET /api/connections ainda declara Connection (objeto único), não uma lista", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const schema = (
      doc.paths["/api/connections"]?.["get"]?.responses as
        | Record<string, { content?: Record<string, { schema?: { $ref?: string } }> }>
        | undefined
    )?.["200"]?.content?.["application/json"]?.schema;
    expect(schema?.$ref).toBe("#/components/schemas/Connection");
    expect(doc.components.schemas["ConnectionList"]).toBeUndefined();
  });
});

describe("Q20 — POST /api/send/{type}/{to} ainda tem os dois content-types", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const content = doc.paths["/api/send/{type}/{to}"]?.["post"]?.requestBody?.content ?? {};
    expect(Object.keys(content).sort()).toEqual(["application/json", "multipart/form-data"]);
  });
});

describe("Q21 — Message.subtype ainda é integer", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const subtype = doc.components.schemas["Message"]?.["properties"]?.["subtype"] as { type?: string } | undefined;
    expect(subtype?.type).toBe("integer");
  });
});

describe("quirks não verificáveis contra o documento (cobertos em outro lugar)", () => {
  it("Q6 (ZdkOfficialApiWindowError), Q17 (code/payload de ZdkHttpError) — tests/unit/error-mapper.test.ts", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q6")).toBeDefined();
    expect(API_QUIRKS.find((q) => q.id === "Q17")).toBeDefined();
  });

  it("Q8, Q14 (rate limit) — tests/unit/rate-limit.test.ts; Q11 (retry) — tests/unit/retry.test.ts (T16)", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q8")).toBeDefined();
    expect(API_QUIRKS.find((q) => q.id === "Q14")).toBeDefined();
    expect(API_QUIRKS.find((q) => q.id === "Q11")).toBeDefined();
  });

  it("Q12, Q16 (formato de token/host) — tests/unit/config.test.ts, tests/unit/token.test.ts", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q12")).toBeDefined();
    expect(API_QUIRKS.find((q) => q.id === "Q16")).toBeDefined();
  });

  it("Q7 (serialização de messages) e Q19 (wrapper de envio) — tests/integration/messages.test.ts (T22)", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q7")).toBeDefined();
    expect(API_QUIRKS.find((q) => q.id === "Q19")).toBeDefined();
  });

  it("Q15 (divergência entre instâncias) — tests/unit/divergence-report.test.ts, tests/unit/sync-api.merge.test.ts", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q15")).toBeDefined();
  });
});
