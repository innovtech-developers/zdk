/**
 * Provas de tipo do `ApiRequestOptions<K>`: `json`/`multipart` precisam
 * narrowar por operação sem se contaminar. O primeiro rascunho tinha o
 * `extends` invertido — checava se a união inteira de content-types é
 * subtipo do literal `"multipart/form-data"` em vez do contrário — o que
 * silenciosamente desabilitava `multipart` em TODAS as operações, inclusive
 * as duais (Q20). `expectTypeOf(...).toEqualTypeOf<undefined>()` pegou.
 *
 * `json` virou `unknown` (não `ApiBody<K,"application/json">`) quando T25
 * revelou Q24: um tipo CORRIGIDO por `OptionalBy` (ex.: `ContactPostData`
 * com `isGroup` widened de volta a opcional) é estruturalmente mais LARGO
 * que o gerado — e não é atribuível a um slot fixo no tipo estrito. `json`
 * genérico resolve isso, igual `multipart` já fazia com `MultipartBody`.
 */

import { describe, expect, expectTypeOf, it } from "vitest";
import type { MultipartBody } from "../../src/core/request-builder";
import type { ApiRequestOptions } from "../../src/core/api-client";
import type { ContactPostData } from "../../src/schema/types";

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

describe("ApiRequestOptions — elegibilidade de json por content-type", () => {
  it("operação só-json ou dual: json é elegível (unknown), não never/undefined", () => {
    type ContactsOpts = ApiRequestOptions<"PUT /api/contacts/{id}">;
    type SendMediaOpts = ApiRequestOptions<"POST /api/send/{type}/{to}">;
    expectTypeOf<ContactsOpts["json"]>().not.toEqualTypeOf<undefined>();
    expectTypeOf<SendMediaOpts["json"]>().not.toEqualTypeOf<undefined>();
  });

  it("operação só-multipart (upload-temp): json não aceita valor (só undefined)", () => {
    type UploadOpts = ApiRequestOptions<"POST /api/upload-temp">;
    expectTypeOf<UploadOpts["json"]>().toEqualTypeOf<undefined>();
  });

  it("Q24: tipo corrigido por OptionalBy (mais LARGO que o gerado) é atribuível a json — o motivo da mudança", () => {
    type ContactsOpts = ApiRequestOptions<"PUT /api/contacts/{id}">;
    const value: ContactsOpts["json"] = {
      name: "nome",
      number: "5511999999999",
    } satisfies ContactPostData; // isGroup/blocked/noCheckNumber omitidos de propósito — têm default
    expectTypeOf(value).not.toBeNever();
  });
});
