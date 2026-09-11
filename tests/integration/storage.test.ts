import { describe, expect, it } from "vitest";
import { ApiClient } from "../../src/core/api-client";
import { Capabilities } from "../../src/core/capabilities";
import { Storage } from "../../src/resources/storage";
import { FakeHttpClient } from "../helpers/fake-http-client";

const BASE_URL = "https://api-x.zapcontabil.chat";

function makeStorage(httpClient: FakeHttpClient): Storage {
  const capabilities = new Capabilities({ baseUrl: BASE_URL, httpClient });
  const client = new ApiClient({ baseUrl: BASE_URL, token: "tok", httpClient, capabilities });
  return new Storage(client);
}

describe("Storage.signedUrl", () => {
  it("GET /api/storage/signed-url/{filekey} com expiresInSeconds", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({ status: 200, body: { url: "https://cdn.example/arquivo.png?sig=abc" } });
    const storage = makeStorage(httpClient);

    const result = await storage.signedUrl("pasta/arquivo.png", { expiresInSeconds: 3600 });

    expect(httpClient.calls[0]?.url).toBe(
      `${BASE_URL}/api/storage/signed-url/pasta%2Farquivo.png?expiresInSeconds=3600`,
    );
    expect(result).toEqual({ url: "https://cdn.example/arquivo.png?sig=abc" });
  });
});

describe("Storage.uploadTemp — Q3: media obrigatório, resposta sempre com url/filename/success", () => {
  it("POST /api/upload-temp multipart", async () => {
    const httpClient = new FakeHttpClient();
    httpClient.enqueue({
      status: 200,
      body: { url: "https://cdn.example/temp/x.png", filename: "x.png", success: true },
    });
    const storage = makeStorage(httpClient);

    const result = await storage.uploadTemp({ media: new Blob(["conteúdo"]) });

    expect(httpClient.calls[0]?.method).toBe("POST");
    expect(httpClient.calls[0]?.url).toBe(`${BASE_URL}/api/upload-temp`);
    expect(httpClient.calls[0]?.body).toBeInstanceOf(FormData);
    expect(result).toEqual({ url: "https://cdn.example/temp/x.png", filename: "x.png", success: true });
  });
});
