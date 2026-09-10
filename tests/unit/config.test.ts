import { describe, expect, it } from "vitest";
import { ZdkConfigError } from "../../src/core/errors";
import { parseBaseUrl, parseToken, resolveConfig } from "../../src/core/config";

describe("parseBaseUrl — vetores rejeitados (§5.6)", () => {
  it.each([
    ["sem esquema", "api-x.zapcontabil.chat"],
    ["não-HTTPS", "http://api-x.zapcontabil.chat"],
    ["porta arbitrária", "https://api-x.zapcontabil.chat:8443"],
    ["caminho", "https://api-x.zapcontabil.chat/prefixo"],
    ["query", "https://evil.com/?x=zapcontabil.chat"],
    ["fragmento", "https://evil.com#zapcontabil.chat"],
    ["userinfo", "https://zapcontabil.chat@evil.com"],
    ["userinfo com barra escapada", "https://zapcontabil.chat%2f@evil.com"],
    ["sufixo falso de domínio", "https://zapcontabil.chat.evil.com"],
    ["homóglifo no apex (a cirílico)", "https://api.zаpcontabil.chat"],
    ["homóglifo no TLD (a cirílico)", "https://api.zapcontabil.chаt"],
    ["URL malformada", "não-uma-url"],
  ])("%s: %s", (_label, raw) => {
    expect(() => parseBaseUrl(raw)).toThrow(ZdkConfigError);
  });

  it("literal IP não pertence ao domínio", () => {
    expect(() => parseBaseUrl("https://127.0.0.1")).toThrow(ZdkConfigError);
  });
});

describe("parseBaseUrl — rótulo de painel/frontend rejeitado mesmo com domínio válido (§5.6.1)", () => {
  it.each([
    "https://admin1.zapcontabil.chat",
    "https://app.zapplataforma.chat",
    "https://www.zapcontabil.chat",
    "https://zapcontabil.chat",
  ])("%s", (raw) => {
    expect(() => parseBaseUrl(raw)).toThrow(ZdkConfigError);
  });
});

describe("parseBaseUrl — formas equivalentes aceitas e normalizadas", () => {
  it.each([
    ["caixa", "https://API-SAFIRACOSMETICOS.ZAPPLATAFORMA.CHAT", "https://api-safiracosmeticos.zapplataforma.chat"],
    ["ponto final de FQDN", "https://api-x.zapcontabil.chat.", "https://api-x.zapcontabil.chat"],
    ["barra final", "https://api-safiracosmeticos.zapplataforma.chat/", "https://api-safiracosmeticos.zapplataforma.chat"],
  ])("%s", (_label, raw, expected) => {
    expect(parseBaseUrl(raw)).toBe(expected);
  });

  it("homóglifo no SUBDOMÍNIO passa a checagem de domínio, mas cai no rótulo estrito", () => {
    // apex íntegro (zapcontabil.chat) — subdomínio só existe na zona DNS da Zappy;
    // ainda assim falha porque o rótulo vira punycode, não "api-<tenant>".
    expect(() => parseBaseUrl("https://аpi.zapcontabil.chat")).toThrow(ZdkConfigError);
  });
});

describe("parseBaseUrl — os dois hosts reais de API", () => {
  it.each([
    "https://api-zapcontabil.zapcontabil.chat",
    "https://api-safiracosmeticos.zapplataforma.chat",
  ])("%s", (raw) => {
    expect(parseBaseUrl(raw)).toBe(raw);
  });
});

describe("parseBaseUrl — strictApiHost desligável", () => {
  it("tenant sem hífen ou com underscore: rejeitado por default, aceito com strictApiHost:false", () => {
    expect(() => parseBaseUrl("https://apiapenasteste.zapcontabil.chat")).toThrow(ZdkConfigError);
    expect(
      parseBaseUrl("https://apiapenasteste.zapcontabil.chat", { strictApiHost: false }),
    ).toBe("https://apiapenasteste.zapcontabil.chat");
  });

  it("mesmo com strictApiHost:false, domínio fora da allowlist continua rejeitado (sem escape hatch para segurança)", () => {
    expect(() =>
      parseBaseUrl("https://qualquer-coisa.evil.com", { strictApiHost: false }),
    ).toThrow(ZdkConfigError);
  });

  it("tenant com formato válido mas inexistente passa no FORMATO — existência é responsabilidade de verify()", () => {
    expect(parseBaseUrl("https://api-apenasteste.zapcontabil.chat")).toBe(
      "https://api-apenasteste.zapcontabil.chat",
    );
  });
});

describe("parseToken", () => {
  it("aceita exatamente 250 caracteres", () => {
    const token = "a".repeat(250);
    expect(parseToken(token)).toBe(token);
  });

  it.each([249, 251])("rejeita %i caracteres por default", (n) => {
    expect(() => parseToken("a".repeat(n))).toThrow(ZdkConfigError);
  });

  it("strictTokenLength:false aceita outro comprimento", () => {
    const token = "a".repeat(100);
    expect(parseToken(token, { strictTokenLength: false })).toBe(token);
  });

  it("trim tolera \\n nas pontas (falha comum de copy-paste de .env)", () => {
    const token = "a".repeat(250);
    expect(parseToken(`${token}\n`)).toBe(token);
    expect(parseToken(`\n${token}`)).toBe(token);
  });

  it("rejeita espaço, CR/LF no meio, e caractere não-ASCII", () => {
    expect(() => parseToken("a".repeat(125) + " " + "a".repeat(124))).toThrow(ZdkConfigError);
    expect(() => parseToken("a".repeat(125) + "\n" + "a".repeat(124))).toThrow(ZdkConfigError);
    expect(() => parseToken("a".repeat(249) + "é")).toThrow(ZdkConfigError);
  });

  it("token ausente ou só espaço", () => {
    expect(() => parseToken("")).toThrow(ZdkConfigError);
    expect(() => parseToken("   ")).toThrow(ZdkConfigError);
  });

  it("mensagem de erro NUNCA contém o valor do token", () => {
    const secret = "S3GREDO_" + "x".repeat(240);
    expect(secret.length).toBe(248);
    try {
      parseToken(secret);
      throw new Error("deveria ter lançado");
    } catch (error) {
      expect(error).toBeInstanceOf(ZdkConfigError);
      expect((error as Error).message).not.toContain(secret);
      expect((error as Error).message).not.toContain("S3GREDO");
    }
  });
});

describe("resolveConfig", () => {
  it("usa o objeto explícito quando fornecido", () => {
    const config = resolveConfig({
      baseUrl: "https://api-x.zapcontabil.chat",
      token: "a".repeat(250),
    });
    expect(config.baseUrl).toBe("https://api-x.zapcontabil.chat");
    expect(config.token).toBe("a".repeat(250));
  });

  it("cai para ZAPPY_URL/ZAPPY_TOKEN quando o objeto não traz os valores", () => {
    const originalUrl = process.env.ZAPPY_URL;
    const originalToken = process.env.ZAPPY_TOKEN;
    process.env.ZAPPY_URL = "https://api-y.zapplataforma.chat";
    process.env.ZAPPY_TOKEN = "b".repeat(250);

    try {
      const config = resolveConfig();
      expect(config.baseUrl).toBe("https://api-y.zapplataforma.chat");
      expect(config.token).toBe("b".repeat(250));
    } finally {
      process.env.ZAPPY_URL = originalUrl;
      process.env.ZAPPY_TOKEN = originalToken;
    }
  });

  it("lança quando nem objeto nem ambiente fornecem baseUrl/token", () => {
    const originalUrl = process.env.ZAPPY_URL;
    const originalToken = process.env.ZAPPY_TOKEN;
    delete process.env.ZAPPY_URL;
    delete process.env.ZAPPY_TOKEN;

    try {
      expect(() => resolveConfig()).toThrow(ZdkConfigError);
    } finally {
      process.env.ZAPPY_URL = originalUrl;
      process.env.ZAPPY_TOKEN = originalToken;
    }
  });

  it("devolve config congelada", () => {
    const config = resolveConfig({
      baseUrl: "https://api-x.zapcontabil.chat",
      token: "a".repeat(250),
    });
    expect(Object.isFrozen(config)).toBe(true);
  });
});
