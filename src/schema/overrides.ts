/**
 * Registry auditável dos defeitos reais do contrato (§5.3 da spec — Q1 a
 * Q23). Cada entrada aponta pro ponto exato do swagger e explica o motivo;
 * `tests/contract/quirks.test.ts` valida os que são estruturalmente
 * verificáveis contra os dois snapshots reais. Se a Zappy corrigir um
 * defeito, o teste falha — o registry não apodrece em silêncio.
 *
 * Q19 (confirmação), Q21 (correção), Q22 e Q23 vieram de chamadas REAIS e autenticadas contra
 * `api-admin1.zapcontabil.chat` (T24), não de inferência — `GET
 * /api/connections`, `GET /api/connections/{id}/templates` (leitura, sem
 * efeito colateral) e um único `POST /api/send/{to}` de teste, autorizado
 * explicitamente com número e conexão fornecidos para esse fim.
 */

export interface ApiQuirk {
  readonly id: string;
  /** Caminho no documento OpenAPI onde o defeito vive. */
  readonly at: string;
  readonly reason: string;
}

export const API_QUIRKS: readonly ApiQuirk[] = Object.freeze([
  { id: "Q1", at: "components.schemas.Connection.properties.status.enum", reason: "enum omite WHATSAPP_AUTH (conexão com API Oficial ativa) e `qrcode` (aguardando pareamento) — os dois observados em produção (T24)" },
  { id: "Q2", at: "components.schemas.*", reason: "42 de 47 schemas sem array `required` no topo — codegen marca tudo opcional" },
  { id: "Q3", at: "components.schemas.*.properties.*.required", reason: "12 properties com `required: true` inline — inválido em OpenAPI 3, ignorado pelo codegen" },
  { id: "Q4", at: "paths./api/tickets/{id}/send-template.post.parameters[id]", reason: "`id` de path declarado opcional, mas é sempre obrigatório na prática" },
  { id: "Q5", at: "paths./api/messages.get.parameters[ticketId|contactId|dateFrom|dateTo]", reason: "parâmetros de filtro sem `schema.type`" },
  { id: "Q6", at: "runtime: corpo de erro de POST /api/send/{to} e afins", reason: "ERR_OFFICIAL_API_WINDOW_CLOSED chega como 400 genérico — mapeado em error-mapper.ts (T09)" },
  { id: "Q7", at: "paths./api/messages/multiple/{to}.post.requestBody", reason: "`messages` é JSON stringificado dentro do multipart — serializado pelo método (T22)" },
  { id: "Q8", at: "runtime: headers de resposta", reason: "429/Retry-After/5xx não documentados; rate limit real roda antes da autenticação (observado, não no contrato)" },
  { id: "Q9", at: "paths.*.get.parameters[pageSize]", reason: "sem `maximum`/`maxItems` — resposta de duração ilimitada" },
  { id: "Q10", at: "components.schemas.SendTemplateBulk.properties.to", reason: "array `to` sem `maxItems`; resposta 200 com falha parcial por número" },
  { id: "Q11", at: "runtime: nenhuma operação", reason: "sem `Idempotency-Key` — retry de POST com efeito externo não é seguro (ver §5.8.3, receita de reconciliação)" },
  { id: "Q12", at: "runtime: formato do token", reason: "250 caracteres, não documentado — validado em `parseToken` (T05)" },
  { id: "Q13", at: "paths.*.responses", reason: "401 documentado em 1 de 48 operações; ocorre de fato em qualquer rota autenticada" },
  { id: "Q14", at: "runtime: headers de resposta", reason: "x-ratelimit-limit/remaining/reset ausentes do contrato; reset é epoch absoluto do servidor" },
  { id: "Q15", at: "documento inteiro", reason: "contrato varia por versão implantada, não por tenant/domínio; info.version não acompanha — ver docs/API-DIVERGENCE.md" },
  { id: "Q16", at: "runtime: hostname da API", reason: "padrão `api-<tenant>.<apex>` observado em 2 tenants, não documentado — validado em `parseBaseUrl` (T05)" },
  { id: "Q17", at: "components.schemas.Error", reason: "corpo real é `{error, errorData}`; o schema só declara `error: string` — `errorData` não documentado" },
  { id: "Q18", at: "paths./api/connections.get.responses.200.content", reason: "declara `Connection` (objeto único); resposta real é `{connections: Connection[]}` — não existe `ConnectionList`" },
  { id: "Q19", at: "paths./api/send/{to}.post.responses.200.content", reason: "CONFIRMADO com POST real: resposta vem embrulhada em `{message: Message}` — a v0.7 estava certa, o contrato está errado. Só verificado para este endpoint; POST /api/send-template/{to} e POST /api/send/{type}/{to} declaram o mesmo schema Message mas não foram testados — tratados como não-embrulhados até confirmação própria" },
  { id: "Q20", at: "paths./api/send/{type}/{to}.post.requestBody.content", reason: "dois content-types (multipart binário OU json com url) — capacidade que a v0.7 nunca implementou" },
  { id: "Q21", at: "components.schemas.Message.properties.{id,subtype,isMedia,myContact}", reason: "resposta real (Q19) contradiz o contrato em 4 campos: `id` é string (ID da mensagem no WhatsApp, contrato diz integer), `subtype` é string \"text\" (contrato diz integer — inverte o que se pensava antes de testar), `isMedia` e `myContact` são boolean (contrato diz string para os dois)" },
  { id: "Q22", at: "paths./api/connections/{id}/templates.get.responses.200.content", reason: "CONFIRMADO com GET real: resposta é `{templates: MessageTemplate[]}` — mesmo padrão de Q18. Divergência Q15-style: zapcontabil ainda declara `MessageTemplate` singular (o bug); zapplataforma já corrigiu para a forma certa. A união (primeiro-vence) herda a forma do zapcontabil, então o override segue necessário mesmo com uma instância já certa" },
  { id: "Q23", at: "components.schemas.MessageTemplate.properties.{type,status}", reason: "observado em produção: `type: \"marketing-catalog\"` fora do enum documentado (PHONE/URL/QUICK_REPLY/COPY_CODE — que parece copiado do enum de botão); `status: \"APPROVED\"` fora do enum documentado e com casing diferente (no-sent/wait-approval/approved/rejected/blocked). Taxonomia real desconhecida além dessa amostra — os dois campos ficam como `string`, sem forçar um enum que já se provou errado" },
] as const);

/**
 * Status de conexão real (Q1): o enum do contrato não inclui `WHATSAPP_AUTH`
 * (conexão com a API Oficial/Meta Cloud API autenticada) nem `qrcode`
 * (conexão aguardando pareamento por QR code) — os dois observados em
 * produção contra `api-admin1.zapcontabil.chat` (T24): de 11 conexões
 * reais, 7 estavam `WHATSAPP_AUTH` e 2 estavam `qrcode`.
 */
export const CONNECTION_STATUS = Object.freeze({
  connected: "CONNECTED",
  disconnected: "DISCONNECTED",
  timeout: "TIMEOUT",
  whatsappAuth: "WHATSAPP_AUTH",
  qrcode: "qrcode",
} as const);

export type ConnectionStatus = (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

/**
 * `true` para as duas conexões utilizáveis para envio — `CONNECTED` ou
 * `WHATSAPP_AUTH` (v0.7 já tratava as duas como válidas). `qrcode` não conta:
 * é conexão ainda não pareada, não há canal ativo para enviar nada.
 */
export function isUsableConnectionStatus(status: ConnectionStatus): boolean {
  return status === CONNECTION_STATUS.connected || status === CONNECTION_STATUS.whatsappAuth;
}
