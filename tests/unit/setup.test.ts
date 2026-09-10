import { describe, expect, it } from "vitest";
import { FakeHttpClient } from "../helpers/fake-http-client";

describe("infraestrutura de teste", () => {
  it("FakeHttpClient registra chamadas e devolve a resposta enfileirada", async () => {
    const client = new FakeHttpClient();
    client.enqueue({ status: 200, body: { ok: true } });

    const response = await client.send({
      method: "GET",
      url: "https://api-x.zapcontabil.chat/api/connections",
      headers: { Authorization: "Bearer token" },
    });

    expect(client.requestCount).toBe(1);
    expect(client.calls[0]?.method).toBe("GET");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("lança quando nenhuma resposta foi enfileirada", async () => {
    const client = new FakeHttpClient();

    await expect(
      client.send({ method: "GET", url: "https://x", headers: {} }),
    ).rejects.toThrow(/nenhuma resposta enfileirada/);
  });
});
