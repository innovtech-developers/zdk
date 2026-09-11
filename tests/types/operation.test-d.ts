/**
 * Prova em compilação (`npm run test:types`) das garantias da §5.1: chave de
 * operação inexistente não compila, body/response inferidos corretamente, e
 * os quirks descobertos no spike (Q18, Q20, Q21) continuam valendo contra o
 * gerado real em `src/generated/openapi.d.ts`.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { ApiBody, ApiContentType, ApiResponse, OperationKey } from "../../src/core/operation";

describe("OperationKey", () => {
  it("aceita operações que existem de fato no contrato", () => {
    expectTypeOf<"GET /api/connections">().toExtend<OperationKey>();
    expectTypeOf<"POST /api/send/{to}">().toExtend<OperationKey>();
    expectTypeOf<"DELETE /api/webhooks/{id}">().toExtend<OperationKey>();
    expectTypeOf<"GET /api/webhooks">().toExtend<OperationKey>();
  });

  it("rejeita verbo que o gerador marca como ausente no path (o bug do Extract cru)", () => {
    // "PUT /api/connections" não existe no contrato — só GET.
    expectTypeOf<"PUT /api/connections">().not.toExtend<OperationKey>();
  });

  it("rejeita path e método inventados", () => {
    expectTypeOf<"GET /api/nao-existe">().not.toExtend<OperationKey>();
    expectTypeOf<"PATCH /api/tickets/{id}">().not.toExtend<OperationKey>();
  });
});

describe("ApiBody", () => {
  it("infere o schema do requestBody por padrão (application/json)", () => {
    type Body = ApiBody<"POST /api/send/{to}">;
    expectTypeOf<Body>().toHaveProperty("body");
    expectTypeOf<Body>().toHaveProperty("connectionFrom");
  });

  it("Q20: os dois content-types da mesma operação resolvem para schemas diferentes", () => {
    type Multipart = ApiBody<"POST /api/send/{type}/{to}", "multipart/form-data">;
    type Json = ApiBody<"POST /api/send/{type}/{to}", "application/json">;

    expectTypeOf<Multipart>().toHaveProperty("media");
    expectTypeOf<Json>().toHaveProperty("url");
    // são schemas DISTINTOS — json não tem "media", multipart não tem "url"
    expectTypeOf<Json>().not.toHaveProperty("media");
    expectTypeOf<Multipart>().not.toHaveProperty("url");
  });

  it("operação com um único content-type expõe só ele", () => {
    expectTypeOf<ApiContentType<"POST /api/send/{to}">>().toEqualTypeOf<"application/json">();
  });
});

describe("ApiResponse", () => {
  it("Q18: GET /api/connections infere Connection (objeto único, sem .connections) — defeito real do contrato", () => {
    type Response = ApiResponse<"GET /api/connections">;
    expectTypeOf<Response>().not.toHaveProperty("connections");
    expectTypeOf<Response>().toHaveProperty("status");
  });

  it("resposta de envio de texto não vem embrulhada — Q19 segue em aberto até T22 confirmar com chamada real", () => {
    type Response = ApiResponse<"POST /api/send/{to}">;
    expectTypeOf<Response>().not.toHaveProperty("message");
    expectTypeOf<Response>().toHaveProperty("body");
  });

  it("Q21: Message.subtype é number no contrato (a v0.7 tipava string)", () => {
    type Response = ApiResponse<"POST /api/send/{to}">;
    expectTypeOf<Response>().toHaveProperty("subtype").toEqualTypeOf<number | undefined>();
  });
});
