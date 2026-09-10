/**
 * Tipos públicos do ZDK, sem prefixo `I` — derivados dos schemas gerados
 * (`src/generated/openapi.d.ts`) e corrigidos pelos overrides de
 * `schema/overrides.ts` (§5.3/§5.4). Só definidos aqui na medida em que um
 * recurso (T19+) de fato precisa deles — não há tipo especulativo.
 */

import type { components } from "../generated/openapi";
import { CONNECTION_STATUS, type ConnectionStatus } from "./overrides";

/**
 * Q2/Q3: o codegen marca toda property como opcional (schemas sem `required`
 * no topo, ou com `required: true` inline — inválido em OpenAPI 3, ignorado).
 * `RequiredBy` promove as chaves que sabemos ser sempre presentes na prática,
 * sem tocar nas demais.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type RawConnection = components["schemas"]["Connection"];

/** Q1: `status` aceita `WHATSAPP_AUTH`, ausente do enum do contrato. */
export type Connection = RequiredBy<
  Omit<RawConnection, "status">,
  Exclude<keyof RawConnection, "status">
> & {
  readonly status: ConnectionStatus;
};

/**
 * Q18: `GET /api/connections` declara `Connection` (objeto único) na resposta
 * 200, mas o corpo real é uma lista — não existe `ConnectionList` no
 * contrato, ao contrário de todos os outros recursos.
 */
export interface ConnectionList {
  readonly connections: readonly Connection[];
}

export { CONNECTION_STATUS };
export type { ConnectionStatus };
export { isUsableConnectionStatus } from "./overrides";
