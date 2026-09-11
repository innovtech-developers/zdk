import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Tickets } from "../../src/resources/tickets";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeTickets(httpClient: FakeHttpClient): Tickets {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Tickets(client);
}

describe("Tickets — uma asserção por operação (11 no total)", () => {
  it("list(): GET /api/tickets", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { tickets: [] } });
    await makeTickets(httpClient).list({ page: 1, pageSize: 10 });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets?page=1&pageSize=10`);
  });

  it("searchByContact(): GET /api/tickets/search-by-contact com contactNumber obrigatório", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { tickets: [] } });
    await makeTickets(httpClient).searchByContact("5511999999999", { page: 1 });
    expect(httpClient.calls[0]?.url).toBe(
      `${BASE_URL}/api/tickets/search-by-contact?contactNumber=5511999999999&page=1`,
    );
  });

  it("get(): GET /api/tickets/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    await makeTickets(httpClient).get(1);
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1`);
  });

  it("update(): PUT /api/tickets/{id}", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, status: "open" } });
    await makeTickets(httpClient).update(1, { status: "open" });
    expect(httpClient.calls[0]?.method).toBe("PUT");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1`);
  });

  it("transfer(): POST /api/tickets/{id}/transfer", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    await makeTickets(httpClient).transfer(1, { queueId: 2 });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/transfer`);
  });

  it("resolve(): POST /api/tickets/{id}/resolve", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, status: "closed" } });
    await makeTickets(httpClient).resolve(1, { feedbackOption: "none" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/resolve`);
  });

  it("sendText(): POST /api/tickets/{id}/send devolve Ticket, não Message", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1, status: "open" } });
    const result = await makeTickets(httpClient).sendText(1, { body: "olá" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/send`);
    expect(result).toEqual({ id: 1, status: "open" });
  });

  it("sendMedia(): POST /api/tickets/{id}/send/{type} multipart", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    await makeTickets(httpClient).sendMedia(1, "image", { media: new Blob(["x"]) });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/send/image`);
    expect(httpClient.calls[0]?.body).toBeInstanceOf(FormData);
  });

  it("sendMediaByUrl(): POST /api/tickets/{id}/send/{type} json", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    const data = { url: "https://exemplo.com/x.png" };
    await makeTickets(httpClient).sendMediaByUrl(1, "image", data);
    expect(httpClient.calls[0]?.body).toBe(JSON.stringify(data));
    expect(httpClient.calls[0]?.headers["Content-Type"]).toBe("application/json");
  });

  it("sendAndClose(): POST /api/tickets/{id}/send-and-close, resposta embrulhada { message, ticket }", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { message: { id: 1 }, ticket: { id: 1, status: "closed" } } });
    const result = await makeTickets(httpClient).sendAndClose(1, { body: "encerrando" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/send-and-close`);
    expect(httpClient.calls[0]?.body).toBeInstanceOf(FormData);
    expect(result).toEqual({ message: { id: 1 }, ticket: { id: 1, status: "closed" } });
  });

  it("info(): GET /api/tickets/{id}/info", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { canSendMessageWithOficialApi: true } });
    const result = await makeTickets(httpClient).info(1);
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/info`);
    expect(result).toEqual({ canSendMessageWithOficialApi: true });
  });

  it("sendTemplate(): POST /api/tickets/{id}/send-template — id sempre obrigatório (Q4)", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { id: 1 } });
    await makeTickets(httpClient).sendTemplate(1, { connectionFrom: 1, templateId: "t1" });
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/tickets/1/send-template`);
  });
});
