# Autenticação: host, token, e onde verificar credenciais

## Allowlist de domínio — sem exceção

`baseUrl` só é aceita se o host estiver em `zapcontabil.chat` ou `zapplataforma.chat` — os dois domínios reais da Zappy (o mesmo sistema, separado por marketing; ver Q15 em [API-QUIRKS.md](./API-QUIRKS.md)). Isso protege o **token**, que vai no header `Authorization` de toda requisição: uma `baseUrl` sob controle de terceiro entregaria a credencial pra quem não devia.

A checagem usa `new URL()`, nunca regex/`includes`/`startsWith` — normaliza caixa, `%`-escapes e IDN (punycode) antes de comparar, e rejeita:

- esquema diferente de `https:`
- userinfo, porta, query, fragmento ou caminho na URL
- host fora dos dois domínios (inclusive sufixo falso como `zapcontabil.chat.evil.com`)
- homóglifo no apex (`zаpcontabil.chat` com "а" cirílico vira punycode, não bate)

Além do domínio, o **rótulo** do host precisa seguir `api-<tenant>` (ex.: `api-zapcontabil.zapcontabil.chat`, `api-safiracosmeticos.zapplataforma.chat`) — confirmado por DNS nos dois domínios. Isso bloqueia por engano apontar pro **painel** (`admin1.zapcontabil.chat`), o erro de configuração mais provável, sem precisar enumerar nomes de frontend.

```ts
new Zdk({ baseUrl: "https://admin1.zapcontabil.chat", token }); // lança ZdkConfigError — isso é painel, não API
new Zdk({ baseUrl: "https://api-x.zapcontabil.chat", token });  // ok
```

A checagem de rótulo tem valor de segurança **zero** — o apex já é a fronteira real, e ninguém cria subdomínio na zona DNS da Zappy. É guarda de ergonomia, baseada em só duas amostras observadas, então tem escape hatch (`strictApiHost: false`) pra não bloquear um formato de tenant legítimo que ainda não vimos:

```ts
new Zdk({ baseUrl: "https://apiapenasteste.zapcontabil.chat", token, strictApiHost: false }); // ok, sem hífen
```

O domínio, esse não tem escape — é controle de segurança, não ergonomia.

## Token

250 caracteres, ASCII imprimível (`/^[!-~]+$/` — bloqueia espaço, CR/LF e não-ASCII, que causariam injeção de header ou erro opaco do `fetch`). O valor é `trim()`-ado antes de validar — newline de copy-paste de `.env` ou `kubectl create secret` é a falha real mais comum, e sem isso o erro apareceria como `401` confuso três camadas adiante.

```ts
new Zdk({ baseUrl, token: "abc" }); // lança ZdkConfigError: "token deve ter 250 caracteres, recebeu 3"
```

A mensagem de erro **nunca ecoa o valor do token** — só o comprimento. Mensagem de erro vaza pra log, e log vaza.

250 é observado, não documentado em lugar nenhum do swagger — se a Zappy mudar o formato, `strictTokenLength: false` evita que a lib quebre todo consumidor de uma vez:

```ts
new Zdk({ baseUrl, token: tokenNovoFormato, strictTokenLength: false });
```

## `ZAPPY_URL`/`ZAPPY_TOKEN`

Fallback de variável de ambiente, lido só dentro de `resolveConfig` — a lib nunca carrega `.env` sozinha (sem `dotenv` embutido; carregue antes de instanciar, se precisar):

```ts
const zdk = new Zdk(); // usa process.env.ZAPPY_URL / process.env.ZAPPY_TOKEN
```

## `new Zdk()` vs `Zdk.connect()` vs `verify()`

Três camadas, cada uma com um trabalho — e um motivo concreto pra não colapsar as três em uma:

| Camada | Custo | Quando usar |
|---|---|---|
| `new Zdk(config)` | zero I/O, síncrono | DI, teste, cold start de serverless. Valida só formato (allowlist + token, acima) |
| `await Zdk.connect(config)` | 1 requisição | bootstrap de app — devolve a instância já provada |
| `await zdk.verify()` | 1 requisição | health check explícito, chamável quando quiser, reusa `connections.list()` |

```ts
const zdk = new Zdk({ baseUrl, token });       // síncrono
const zdk = await Zdk.connect({ baseUrl, token }); // = new Zdk() + verify()
const { connections, rateLimit } = await zdk.verify();
```

**Por que não no construtor:** construtor não pode ser `async` sem devolver uma `Promise` no lugar da instância — e ainda arrastaria rede pra dentro de todo teste e todo cold start que só queria compor a instância, não usá-la ainda.

**Por que não em toda requisição** — isto é o ponto que mais vale destacar: "testar sempre" dobraria o número de chamadas, e o orçamento de rate limit é **consumido mesmo em requisição que falha** (confirmado: dois `401` consecutivos, sem token nenhum, já derrubaram o `remaining` de 9999 pra 9998 — ver [RESILIENCE.md](./RESILIENCE.md)). Verificar a credencial em toda chamada custaria metade do orçamento só pra detectar, de novo e de novo, um token que já falharia com `401` na primeira tentativa real — agora tipado como `ZdkAuthError`.

`verify()` reusa `GET /api/connections` — o único `GET` do contrato com zero parâmetros, e cuja própria descrição diz que serve pra "selecionar conexões para enviar mensagens". Não é health check desperdiçado: é a chamada de bootstrap que qualquer envio ia precisar de qualquer forma, pra saber o `connectionFrom`.

```ts
try {
  await zdk.verify();
} catch (error) {
  if (error instanceof ZdkAuthError) {
    // error.code distingue a causa real:
    //   "ERR_INVALID_API_KEY"          -> token errado (seu problema)
    //   "ERR_NO_AUTH_HEADER_PRESENT"   -> header não foi enviado (bug do SDK)
  } else if (error instanceof ZdkConfigError) {
    // 2xx mas sem "connections" no corpo — este host não parece ser a API da Zappy
  }
}
```
