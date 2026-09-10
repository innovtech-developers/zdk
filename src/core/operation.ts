/**
 * Tipos derivados de `src/generated/openapi.d.ts` (§5.1 da spec). Este código
 * foi compilado e verificado no spike da Fase 2 contra a saída real do
 * `openapi-typescript@7.13` sobre o snapshot da `api-zapcontabil` antes de
 * entrar aqui — as asserções que provam isso estão em
 * `tests/types/operation.test-d.ts`.
 */

import type { paths } from "../generated/openapi";

type HttpVerb = "get" | "post" | "put" | "patch" | "delete";

/**
 * `openapi-typescript` emite TODO verbo em TODO path, marcando os inexistentes
 * como `put?: never`. Um `Extract<keyof paths[P], HttpVerb>` cru aceitaria
 * "PUT /api/connections", que não existe. Filtrar por valor `undefined` é
 * obrigatório — sem isso a garantia central da lib ("chave inexistente não
 * compila") estaria furada.
 */
type VerbsOf<P extends keyof paths> = {
  [M in Extract<keyof paths[P], HttpVerb>]-?: paths[P][M] extends undefined ? never : M;
}[Extract<keyof paths[P], HttpVerb>];

/** Toda operação que existe de fato no contrato. Ex: `"POST /api/send/{to}"`. */
export type OperationKey = {
  [P in keyof paths]: `${Uppercase<VerbsOf<P>>} ${P & string}`;
}[keyof paths];

type Operation<K extends OperationKey> = K extends `${infer M} ${infer P}`
  ? P extends keyof paths
    ? Lowercase<M> extends keyof paths[P]
      ? paths[P][Lowercase<M>]
      : never
    : never
  : never;

/** `requestBody` sai OPCIONAL do gerador (o swagger não o marca obrigatório) → `NonNullable`. */
type Content<K extends OperationKey> =
  NonNullable<Operation<K>> extends { requestBody?: infer RB }
    ? NonNullable<RB> extends { content: infer C }
      ? C
      : never
    : never;

/** Três operações aceitam dois content-types (Q20), então ele é parâmetro. */
export type ApiContentType<K extends OperationKey> = keyof Content<K>;

type DefaultContentType<K extends OperationKey> =
  "application/json" extends ApiContentType<K> ? "application/json" : ApiContentType<K>;

export type ApiBody<
  K extends OperationKey,
  CT extends ApiContentType<K> = DefaultContentType<K>,
> = CT extends keyof Content<K> ? Content<K>[CT] : never;

export type ApiResponse<K extends OperationKey> =
  NonNullable<Operation<K>> extends {
    responses: { 200: { content: { "application/json": infer R } } };
  }
    ? R
    : never;

export type ApiParams<K extends OperationKey> =
  NonNullable<Operation<K>> extends { parameters: infer P } ? P : never;
