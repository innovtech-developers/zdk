/**
 * Provas de tipo do `ApiRequestOptions<K>`: `json`/`multipart` precisam
 * narrowar por operação sem se contaminar. O primeiro rascunho tinha o
 * `extends` invertido — checava se a união inteira de content-types é
 * subtipo do literal `"multipart/form-data"` em vez do contrário — o que
 * silenciosamente desabilitava `multipart` em TODAS as operações, inclusive
 * as duais (Q20). `expectTypeOf(...).toEqualTypeOf<undefined>()` pegou.
 */

import { describe, expect, expectTypeOf, it } from "vitest";
import type { ApiBody } from "../../src/core/operation";
import type { MultipartBody } from "../../src/core/request-builder";
import type { ApiRequestOptions } from "../../src/core/api-client";

describe("ApiRequestOptions — narrowing de multipart", () => {
  it("operação só-json: multipart não aceita valor (só undefined)", () => {
    type ContactsOpts = ApiRequestOptions<"PUT /api/contacts/{id}">;
    expectTypeOf<ContactsOpts["multipart"]>().toEqualTypeOf<undefined>();
  });

  it("operação dual (Q20): MultipartBody real é atribuível", () => {
    type SendMediaOpts = ApiRequestOptions<"POST /api/send/{type}/{to}">;
    const value: SendMediaOpts["multipart"] = {} as MultipartBody;
    expect(value).toBeDefined();
  });

  it("operação só-multipart (upload-temp): MultipartBody real é atribuível", () => {
    type UploadOpts = ApiRequestOptions<"POST /api/upload-temp">;
    const value: UploadOpts["multipart"] = {} as MultipartBody;
    expect(value).toBeDefined();
  });
});

describe("ApiRequestOptions — narrowing de json", () => {
  it("operação só-json: aceita o body json real", () => {
    type ContactsOpts = ApiRequestOptions<"PUT /api/contacts/{id}">;
    const value: ContactsOpts["json"] = {} as ApiBody<"PUT /api/contacts/{id}", "application/json">;
    expect(value).toBeDefined();
  });

  it("operação dual: aceita a variante json real", () => {
    type SendMediaOpts = ApiRequestOptions<"POST /api/send/{type}/{to}">;
    const value: SendMediaOpts["json"] = {} as ApiBody<"POST /api/send/{type}/{to}", "application/json">;
    expect(value).toBeDefined();
  });

  it("operação só-multipart (upload-temp): json não aceita valor (só undefined)", () => {
    type UploadOpts = ApiRequestOptions<"POST /api/upload-temp">;
    expectTypeOf<UploadOpts["json"]>().toEqualTypeOf<undefined>();
  });
});
