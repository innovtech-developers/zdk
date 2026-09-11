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
  it("tem os 24 ids esperados, sem duplicata", () => {
    const ids = API_QUIRKS.map((q) => q.id);
    expect(ids).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
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

describe("Q21 — Message.subtype ainda declarado integer no contrato (o valor REAL observado é string, ver schema/types.ts)", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const subtype = doc.components.schemas["Message"]?.["properties"]?.["subtype"] as { type?: string } | undefined;
    expect(subtype?.type).toBe("integer");
  });
});

describe("Q22 — GET /api/connections/{id}/templates: divergência ENTRE instâncias, não bug universal (Q15-style)", () => {
  // zapcontabil ainda declara o objeto único (bug); zapplataforma já corrigiu
  // para {templates: [...]}. A união (merge-openapi.ts, primeiro-vence)
  // herda a forma do zapcontabil — por isso o override em schema/types.ts
  // continua necessário mesmo com uma das duas instâncias já certa.
  it("zapcontabil ainda declara MessageTemplate (objeto único) — o bug que motivou Q22", () => {
    const schema = (
      zapcontabil.paths["/api/connections/{id}/templates"]?.["get"]?.responses as
        | Record<string, { content?: Record<string, { schema?: { $ref?: string } }> }>
        | undefined
    )?.["200"]?.content?.["application/json"]?.schema;
    expect(schema?.$ref).toBe("#/components/schemas/MessageTemplate");
  });

  it("zapplataforma JÁ declara a forma correta {templates: MessageTemplate[]} — se isso regredir, a união muda de comportamento", () => {
    const schema = (
      zapplataforma.paths["/api/connections/{id}/templates"]?.["get"]?.responses as
        | Record<string, { content?: Record<string, { schema?: { type?: string; properties?: Record<string, unknown> } }> }>
        | undefined
    )?.["200"]?.content?.["application/json"]?.schema;
    expect(schema?.type).toBe("object");
    expect(schema?.properties).toHaveProperty("templates");
  });
});

describe("Q23 — MessageTemplate.type/status ainda com os enums documentados (o valor REAL observado não bate com nenhum, ver schema/types.ts)", () => {
  it.each(bothInstances)("%s", (_label, doc) => {
    const type = doc.components.schemas["MessageTemplate"]?.["properties"]?.["type"] as { enum?: readonly string[] } | undefined;
    const status = doc.components.schemas["MessageTemplate"]?.["properties"]?.["status"] as { enum?: readonly string[] } | undefined;
    expect(type?.enum).toEqual(["PHONE", "URL", "QUICK_REPLY", "COPY_CODE"]);
    expect(status?.enum).toEqual(["no-sent", "wait-approval", "approved", "rejected", "blocked"]);
  });
});

describe("Q24 — campos com default ainda fora do required[] (o codegen que os marca obrigatórios é comportamento da ferramenta, não do schema)", () => {
  const cases: readonly [schema: string, property: string][] = [
    ["ContactPostData", "isGroup"],
    ["ContactPostData", "blocked"],
    ["ContactPostData", "noCheckNumber"],
    ["ContactTagsPostData", "replaceTags"],
    ["ContactTagsPostData", "createTagIfNotExists"],
    ["TicketResolveForm", "feedbackOption"],
    ["WebhookPostData", "active"],
  ];

  it.each(bothInstances)("%s", (_label, doc) => {
    for (const [schemaName, property] of cases) {
      const schema = doc.components.schemas[schemaName];
      // WebhookPostData não existe na zapplataforma (Webhooks é ausente lá —
      // Q15, não Q24). Pular aqui não esconde nada: a ausência do schema
      // inteiro já é coberta pelos testes de divergência (T06/T07).
      if (!schema) continue;

      const prop = schema.properties?.[property] as { default?: unknown } | undefined;
      expect(prop).toHaveProperty("default");
      expect(schema.required ?? []).not.toContain(property);
    }
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

  it("Q7 (serialização de messages) — tests/integration/messages.test.ts (T22)", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q7")).toBeDefined();
  });

  it("Q19 (wrapper de envio, confirmado com chamada real) e Q21 (correção de tipos de Message) — tests/integration/messages.test.ts (T22/T24)", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q19")).toBeDefined();
    expect(API_QUIRKS.find((q) => q.id === "Q21")).toBeDefined();
  });

  it("Q15 (divergência entre instâncias) — tests/unit/divergence-report.test.ts, tests/unit/sync-api.merge.test.ts", () => {
    expect(API_QUIRKS.find((q) => q.id === "Q15")).toBeDefined();
  });
});
