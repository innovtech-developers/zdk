/**
 * Armazenamento (`Storage`). `uploadTemp` tem tag `API Oficial` no swagger,
 * mas é operação de armazenamento — a `url` que devolve serve a qualquer
 * `headerParams` de template, não só ao fluxo oficial (§5.5).
 */

import { Resource } from "./resource";
import type { ApiParams, ApiResponse } from "../core/operation";
import type { UploadTempData, UploadTempResponse } from "../schema/types";

export class Storage extends Resource {
  async signedUrl(
    fileKey: string,
    params?: ApiParams<"GET /api/storage/signed-url/{filekey}">["query"],
  ): Promise<ApiResponse<"GET /api/storage/signed-url/{filekey}">> {
    return this.client.request("GET /api/storage/signed-url/{filekey}", {
      pathParams: { filekey: fileKey },
      query: params,
    });
  }

  /** Q3: `media` é obrigatório; `url`/`filename`/`success` da resposta são sempre presentes — ambos apesar do codegen marcar opcional. */
  async uploadTemp(data: UploadTempData): Promise<UploadTempResponse> {
    const response = await this.client.request("POST /api/upload-temp", { multipart: data });
    return response as unknown as UploadTempResponse;
  }
}
