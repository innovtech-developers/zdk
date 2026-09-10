/**
 * Base de todo recurso (§5.9 — SRP: "Resource só compõe"). Um recurso nunca
 * fala com `HttpClient`, `retry` ou `capabilities` diretamente — só com
 * `ApiClient`, que já orquestra tudo isso (T18).
 */

import type { ApiClient } from "../core/api-client";

export abstract class Resource {
  // Público, não `protected`: a classe já é `abstract` — isso sozinho impede
  // `new Resource(...)` direto. Um construtor protegido aqui só bloquearia
  // `new Connections(client)` de fora (Zdk em T26, testes de integração)
  // sem impedir nada que já não estivesse impedido.
  constructor(protected readonly client: ApiClient) {}
}
