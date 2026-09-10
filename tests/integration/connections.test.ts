import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Connections } from "../../src/resources/connections";
import { ZdkNotFoundError } from "../../src/core/errors";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeConnections(httpClient: FakeHttpClient): Connections {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Connections(client);
}

const disconnectedPreferred = { id: 1, status: "DISCONNECTED", name: "principal" };
const connectedOther = { id: 2, status: "CONNECTED", name: "backup" };
const whatsappAuth = { id: 3, status: "WHATSAPP_AUTH", name: "oficial" };

describe("Connections.list", () => {
  it("desembrulha { connections: [...] } (Q18)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [disconnectedPreferred, connectedOther] } });
    const connections = makeConnections(httpClient);

    const result = await connections.list();

    expect(result).toEqual([disconnectedPreferred, connectedOther]);
    expect(httpClient.calls[0]?.method).toBe("GET");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/connections`);
  });
});

describe("Connections.get — estrito", () => {
  it("cenário DISCONNECTED preferida + CONNECTED outra: get() devolve a PEDIDA, não a outra", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [disconnectedPreferred, connectedOther] } });
    const connections = makeConnections(httpClient);

    const result = await connections.get(1);

    expect(result).toEqual(disconnectedPreferred);
    expect(result.status).toBe("DISCONNECTED"); // nunca troca por outra, mesmo desconectada
  });

  it("id ausente na lista: ZdkNotFoundError", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [connectedOther] } });
    const connections = makeConnections(httpClient);

    await expect(connections.get(999)).rejects.toBeInstanceOf(ZdkNotFoundError);
  });

  it("lista vazia: ZdkNotFoundError", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [] } });
    const connections = makeConnections(httpClient);

    await expect(connections.get(1)).rejects.toBeInstanceOf(ZdkNotFoundError);
  });
});

describe("Connections.findUsable", () => {
  it("mesmo cenário do get(): preferida DISCONNECTED + outra CONNECTED — findUsable devolve a CONNECTED", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [disconnectedPreferred, connectedOther] } });
    const connections = makeConnections(httpClient);

    const result = await connections.findUsable(1);

    expect(result).toEqual(connectedOther);
  });

  it("WHATSAPP_AUTH conta como utilizável, igual a CONNECTED", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [disconnectedPreferred, whatsappAuth] } });
    const connections = makeConnections(httpClient);

    const result = await connections.findUsable();

    expect(result).toEqual(whatsappAuth);
  });

  it("preferredId utilizável é devolvida diretamente, sem cair para outra", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [connectedOther, whatsappAuth] } });
    const connections = makeConnections(httpClient);

    const result = await connections.findUsable(3);

    expect(result).toEqual(whatsappAuth);
  });

  it("sem preferredId: primeira utilizável da lista", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [disconnectedPreferred, connectedOther, whatsappAuth] } });
    const connections = makeConnections(httpClient);

    const result = await connections.findUsable();

    expect(result).toEqual(connectedOther);
  });

  it("lista vazia: ZdkNotFoundError", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [] } });
    const connections = makeConnections(httpClient);

    await expect(connections.findUsable()).rejects.toBeInstanceOf(ZdkNotFoundError);
  });

  it("nenhuma utilizável (só DISCONNECTED/TIMEOUT): ZdkNotFoundError", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { connections: [disconnectedPreferred, { id: 4, status: "TIMEOUT" }] } });
    const connections = makeConnections(httpClient);

    await expect(connections.findUsable()).rejects.toBeInstanceOf(ZdkNotFoundError);
  });
});
