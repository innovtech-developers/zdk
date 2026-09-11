/**
 * O compilador já garante que as 48 chaves da união têm entrada em
 * `OPERATION_METADATA` (o `Record` é exaustivo — confirmado removendo uma
 * chave de propósito e vendo `tsc` falhar). Este teste guarda o que o tipo
 * não protege: que a CLASSIFICAÇÃO de cada operação amostrada continua
 * certa, e que uma edição futura não inverte uma classe por engano nem
 * encolhe a contagem (R3 do plano).
 */

import { describe, expect, it } from "vitest";
import { OPERATION_METADATA, type RetryClass } from "../../src/core/operation-metadata";
import type { OperationKey } from "../../src/core/operation";

function classOf(key: OperationKey): RetryClass {
  return OPERATION_METADATA[key].retryClass;
}

function timeoutOf(key: OperationKey): number {
  return OPERATION_METADATA[key].timeoutMs;
}

describe("OPERATION_METADATA — contagem e distribuição", () => {
  it("tem exatamente 48 operações", () => {
    expect(Object.keys(OPERATION_METADATA)).toHaveLength(48);
  });

  it("31 safe, 2 guarded, 15 unsafe — a distribuição exata de §5.8.3", () => {
    const byClass = { safe: 0, guarded: 0, unsafe: 0 };
    for (const metadata of Object.values(OPERATION_METADATA)) {
      byClass[metadata.retryClass] += 1;
    }
    expect(byClass).toEqual({ safe: 31, guarded: 2, unsafe: 15 });
  });
});

describe("safe — os 24 GETs, os 6 PUTs, DELETE de webhook", () => {
  it.each<OperationKey>([
    "GET /api/connections",
    "GET /api/tickets",
    "GET /api/webhooks",
    "PUT /api/contacts/{id}",
    "PUT /api/tickets/{id}",
    "PUT /api/webhooks/{id}",
    "DELETE /api/webhooks/{id}",
  ])("%s é safe", (key) => {
    expect(classOf(key)).toBe("safe");
  });
});

describe("guarded — transfer e upload-temp", () => {
  it.each<OperationKey>(["POST /api/tickets/{id}/transfer", "POST /api/upload-temp"])(
    "%s é guarded",
    (key) => {
      expect(classOf(key)).toBe("guarded");
    },
  );
});

describe("unsafe — os 9 \"send\", resolve, e as 5 criações", () => {
  it.each<OperationKey>([
    "POST /api/send/{to}",
    "POST /api/send/{type}/{to}",
    "POST /api/messages/multiple/{to}",
    "POST /api/send-template/{to}",
    "POST /api/send-template-bulk",
    "POST /api/tickets/{id}/send",
    "POST /api/tickets/{id}/send/{type}",
    "POST /api/tickets/{id}/send-and-close",
    "POST /api/tickets/{id}/send-template",
  ])("%s (envio) é unsafe", (key) => {
    expect(classOf(key)).toBe("unsafe");
  });

  it("resolve é unsafe — feedbackOption send-end-message dispara mensagem ao contato", () => {
    expect(classOf("POST /api/tickets/{id}/resolve")).toBe("unsafe");
  });

  it.each<OperationKey>([
    "POST /api/contacts/",
    "POST /api/tags/",
    "POST /api/queues",
    "POST /api/many-queues",
    "POST /api/webhooks",
  ])("criação %s é unsafe", (key) => {
    expect(classOf(key)).toBe("unsafe");
  });
});

describe("timeouts — default 10s, com overrides pontuais", () => {
  it("default é 10s para operação sem motivo de exceção", () => {
    expect(timeoutOf("GET /api/connections")).toBe(10_000);
    expect(timeoutOf("POST /api/send/{to}")).toBe(10_000);
  });

  it("bulk de template é 120s — Q10, sem maxItems", () => {
    expect(timeoutOf("POST /api/send-template-bulk")).toBe(120_000);
  });

  it("upload e envio de mídia são 60s", () => {
    expect(timeoutOf("POST /api/upload-temp")).toBe(60_000);
    expect(timeoutOf("POST /api/send/{type}/{to}")).toBe(60_000);
    expect(timeoutOf("POST /api/tickets/{id}/send/{type}")).toBe(60_000);
    expect(timeoutOf("POST /api/tickets/{id}/send-and-close")).toBe(60_000);
  });
});
