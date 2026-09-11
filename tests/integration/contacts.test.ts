import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Contacts } from "../../src/resources/contacts";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeContacts(httpClient: FakeHttpClient): Contacts {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Contacts(client);
}

describe("Contacts.list", () => {
  it("GET /api/contacts com page/pageSize na query", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { contacts: [], count: 0, page: 2, pageSize: 10 } });
    const contacts = makeContacts(httpClient);

    const result = await contacts.list({ page: 2, pageSize: 10 });

    expect(httpClient.calls[0]?.method).toBe("GET");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/contacts?page=2&pageSize=10`);
    expect(result).toEqual({ contacts: [], count: 0, page: 2, pageSize: 10 });
  });

  it("sem params: sem query string", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { contacts: [] } });
    const contacts = makeContacts(httpClient);

    await contacts.list();

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/contacts`);
  });
});

describe("Contacts.get", () => {
  it("GET /api/contacts/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 42, name: "João" } });
    const contacts = makeContacts(httpClient);

    const result = await contacts.get(42);

    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/contacts/42`);
    expect(result).toEqual({ id: 42, name: "João" });
  });
});

describe("Contacts.create", () => {
  it("POST /api/contacts/ com barra final, corpo json", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, name: "Novo" } });
    const contacts = makeContacts(httpClient);

    const data = { name: "Novo", number: "5511999999999" };
    await contacts.create(data as never);

    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/contacts/`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
    expect(httpClient.calls[0]?.headers["Content-Type"]).toBe("application/json");
  });
});

describe("Contacts.update", () => {
  it("PUT /api/contacts/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 5, name: "Editado" } });
    const contacts = makeContacts(httpClient);

    await contacts.update(5, { name: "Editado" } as never);

    expect(httpClient.calls[0]?.method).toBe("PUT");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/contacts/5`);
  });
});

describe("Contacts.setTags", () => {
  it("PUT /api/contacts/{id}/tags com tagIds e replaceTags", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 5, name: "Com tags" } });
    const contacts = makeContacts(httpClient);

    const data = { tagIds: [1, 2], replaceTags: true };
    await contacts.setTags(5, data as never);

    expect(httpClient.calls[0]?.method).toBe("PUT");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/contacts/5/tags`);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
  });
});
