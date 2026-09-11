/**
 * Validação de formato de `baseUrl` e `token`, e resolução da config a partir
 * do objeto explícito ou do fallback de ambiente (§5.6 da spec).
 *
 * Duas famílias de checagem aqui, com pesos diferentes:
 *  - allowlist de domínio + `https:` obrigatório: controle de SEGURANÇA, sem
 *    escape hatch — protegem o token, que vai no header `Authorization`.
 *  - rótulo `api-<tenant>` e comprimento do token: guarda de ERGONOMIA, com
 *    escape hatch (`strictApiHost`/`strictTokenLength`), porque o padrão saiu
 *    de poucas amostras e o custo do falso positivo cai sobre um cliente
 *    legítimo, não sobre um atacante.
 */

import { ZdkConfigError } from "./errors";

/** Os dois domínios documentados da Zappy — mesmo sistema, apex diferente por marketing (Q15/§5.6.1). */
export const ALLOWED_APEX_DOMAINS = Object.freeze(["zapcontabil.chat", "zapplataforma.chat"] as const);

/** Primeiro rótulo do host: `api-<tenant>` nos dois domínios conhecidos; `api` puro tolerado. */
const API_LABEL_PATTERN = /^api(-[a-z0-9-]+)?$/;

const TOKEN_LENGTH = 250;
/** ASCII imprimível sem espaço: barra injeção de header via CR/LF e erro opaco do `fetch`. */
const TOKEN_PATTERN = /^[!-~]+$/;

export interface ParseBaseUrlOptions {
  /** @default true — desligar só quando um formato de host novo, legítimo, ainda não estiver na allowlist. */
  readonly strictApiHost?: boolean;
}

/**
 * Valida e normaliza `baseUrl`.
 * @throws {ZdkConfigError} URL malformada, esquema não-HTTPS, credenciais/porta/query/fragmento/caminho
 *   presentes, domínio fora da allowlist, ou (com `strictApiHost`) rótulo que não é `api-<tenant>`.
 */
export function parseBaseUrl(raw: string, options: ParseBaseUrlOptions = {}): string {
  const strictApiHost = options.strictApiHost ?? true;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ZdkConfigError(`baseUrl inválida: ${raw}`);
  }

  if (url.protocol !== "https:") {
    throw new ZdkConfigError("baseUrl exige HTTPS");
  }
  if (url.username || url.password) {
    throw new ZdkConfigError("baseUrl não pode conter credenciais");
  }
  if (url.port && url.port !== "443") {
    throw new ZdkConfigError("baseUrl não pode declarar porta");
  }
  if (url.search || url.hash) {
    throw new ZdkConfigError("baseUrl não pode conter query nem fragmento");
  }
  if (url.pathname !== "/") {
    throw new ZdkConfigError("baseUrl não pode conter caminho");
  }

  // `new URL` já normalizou caixa, %-escapes e IDN (punycode). Resta o ponto
  // final de FQDN, que precisa cair antes da comparação e do valor retornado.
  const host = url.hostname.replace(/\.$/, "");

  const domainAllowed = ALLOWED_APEX_DOMAINS.some(
    (apex) => host === apex || host.endsWith(`.${apex}`),
  );
  if (!domainAllowed) {
    throw new ZdkConfigError(`domínio não permitido: ${host}`);
  }

  const firstLabel = host.split(".")[0] ?? "";
  if (strictApiHost && !API_LABEL_PATTERN.test(firstLabel)) {
    throw new ZdkConfigError(
      `${host} não parece ser host de API Zappy (esperado api-<tenant>.${ALLOWED_APEX_DOMAINS.join(" ou api-<tenant>.")})`,
    );
  }

  return `https://${host}`;
}

export interface ParseTokenOptions {
  /** @default true — desligar só se a Zappy mudar o comprimento documentado do token. */
  readonly strictTokenLength?: boolean;
}

/**
 * Valida e normaliza o token.
 * @throws {ZdkConfigError} vazio, com caractere fora de ASCII imprimível, ou
 *   (com `strictTokenLength`) diferente de 250 caracteres. A mensagem nunca
 *   ecoa o valor do token — só o comprimento.
 */
export function parseToken(raw: string, options: ParseTokenOptions = {}): string {
  const strictTokenLength = options.strictTokenLength ?? true;

  // `trim`: newline de `.env` ou de `kubectl create secret` é a falha real mais
  // comum; sem isso o erro aparece como 401 confuso três camadas adiante.
  const token = raw.trim();

  if (!token) {
    throw new ZdkConfigError("token ausente");
  }
  if (!TOKEN_PATTERN.test(token)) {
    throw new ZdkConfigError("token contém caractere inválido (espaço, CR/LF ou não-ASCII)");
  }
  if (strictTokenLength && token.length !== TOKEN_LENGTH) {
    throw new ZdkConfigError(`token deve ter ${TOKEN_LENGTH} caracteres, recebeu ${token.length}`);
  }

  return token;
}

export interface ZdkConfigInput {
  /** @default process.env.ZAPPY_URL */
  readonly baseUrl?: string;
  /** @default process.env.ZAPPY_TOKEN */
  readonly token?: string;
  readonly strictApiHost?: boolean;
  readonly strictTokenLength?: boolean;
}

export interface ZdkConfig {
  readonly baseUrl: string;
  readonly token: string;
}

/**
 * Resolve `baseUrl`/`token` do objeto explícito ou do fallback de ambiente
 * (`ZAPPY_URL`/`ZAPPY_TOKEN`), valida os dois e devolve uma config congelada.
 * Nenhum `dotenv` é carregado aqui nem em nenhum outro ponto da lib — quem
 * quiser `.env` carrega antes de instanciar o `Zdk`.
 * @throws {ZdkConfigError} `baseUrl`/`token` ausentes dos dois lugares, ou inválidos.
 */
export function resolveConfig(input: ZdkConfigInput = {}): ZdkConfig {
  const rawBaseUrl = input.baseUrl ?? process.env.ZAPPY_URL;
  const rawToken = input.token ?? process.env.ZAPPY_TOKEN;

  if (!rawBaseUrl) {
    throw new ZdkConfigError(
      "baseUrl ausente: informe no objeto de config ou defina a variável de ambiente ZAPPY_URL",
    );
  }
  if (!rawToken) {
    throw new ZdkConfigError(
      "token ausente: informe no objeto de config ou defina a variável de ambiente ZAPPY_TOKEN",
    );
  }

  const baseUrl = parseBaseUrl(rawBaseUrl, { strictApiHost: input.strictApiHost });
  const token = parseToken(rawToken, { strictTokenLength: input.strictTokenLength });

  return Object.freeze({ baseUrl, token });
}
