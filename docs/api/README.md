ZDK

# ZDK

## Table of contents

### References

- [default](README.md#default)

### Classes

- [ConcurrencyLimiter](classes/ConcurrencyLimiter.md)
- [Zdk](classes/Zdk.md)
- [ZdkAbortError](classes/ZdkAbortError.md)
- [ZdkAuthError](classes/ZdkAuthError.md)
- [ZdkConfigError](classes/ZdkConfigError.md)
- [ZdkError](classes/ZdkError.md)
- [ZdkHttpError](classes/ZdkHttpError.md)
- [ZdkNetworkError](classes/ZdkNetworkError.md)
- [ZdkNotFoundError](classes/ZdkNotFoundError.md)
- [ZdkOfficialApiWindowError](classes/ZdkOfficialApiWindowError.md)
- [ZdkRateLimitError](classes/ZdkRateLimitError.md)
- [ZdkServerError](classes/ZdkServerError.md)
- [ZdkTimeoutError](classes/ZdkTimeoutError.md)
- [ZdkUnsupportedOperationError](classes/ZdkUnsupportedOperationError.md)
- [ZdkValidationError](classes/ZdkValidationError.md)

### Interfaces

- [ApiQuirk](interfaces/ApiQuirk.md)
- [ConnectionList](interfaces/ConnectionList.md)
- [OperationMetadata](interfaces/OperationMetadata.md)
- [RateLimitOptions](interfaces/RateLimitOptions.md)
- [RateLimitSnapshot](interfaces/RateLimitSnapshot.md)
- [RetryAttemptInfo](interfaces/RetryAttemptInfo.md)
- [RetryConfig](interfaces/RetryConfig.md)
- [RetryDecisionContext](interfaces/RetryDecisionContext.md)
- [Semaphore](interfaces/Semaphore.md)
- [SendMessageResult](interfaces/SendMessageResult.md)
- [TemplateList](interfaces/TemplateList.md)
- [VerifyResult](interfaces/VerifyResult.md)
- [ZdkErrorOptions](interfaces/ZdkErrorOptions.md)
- [ZdkHttpErrorOptions](interfaces/ZdkHttpErrorOptions.md)
- [ZdkNetworkErrorOptions](interfaces/ZdkNetworkErrorOptions.md)
- [ZdkOptions](interfaces/ZdkOptions.md)
- [ZdkRateLimitErrorOptions](interfaces/ZdkRateLimitErrorOptions.md)

### Type Aliases

- [ApiBody](README.md#apibody)
- [ApiContentType](README.md#apicontenttype)
- [ApiParams](README.md#apiparams)
- [ApiResponse](README.md#apiresponse)
- [Connection](README.md#connection)
- [ConnectionStatus](README.md#connectionstatus)
- [Contact](README.md#contact)
- [ContactPostData](README.md#contactpostdata)
- [ContactTagsPostData](README.md#contacttagspostdata)
- [FailureKind](README.md#failurekind)
- [Message](README.md#message)
- [MessageTemplate](README.md#messagetemplate)
- [OperationKey](README.md#operationkey)
- [Queue](README.md#queue)
- [RetryClass](README.md#retryclass)
- [SendMediaMessageData](README.md#sendmediamessagedata)
- [SendTemplateData](README.md#sendtemplatedata)
- [Tag](README.md#tag)
- [Ticket](README.md#ticket)
- [TicketResolveFormData](README.md#ticketresolveformdata)
- [UploadTempData](README.md#uploadtempdata)
- [UploadTempResponse](README.md#uploadtempresponse)
- [User](README.md#user)
- [Webhook](README.md#webhook)
- [WebhookPostData](README.md#webhookpostdata)

### Variables

- [API\_QUIRKS](README.md#api_quirks)
- [CONNECTION\_STATUS](README.md#connection_status)
- [DEFAULT\_RETRY\_CONFIG](README.md#default_retry_config)
- [UNLIMITED\_CONCURRENCY](README.md#unlimited_concurrency)

### Functions

- [classifyFailure](README.md#classifyfailure)
- [isRetryableByDefault](README.md#isretryablebydefault)
- [isUsableConnectionStatus](README.md#isusableconnectionstatus)

## References

### default

Renames and re-exports [Zdk](classes/Zdk.md)

## Type Aliases

### ApiBody

Ƭ **ApiBody**\<`K`, `CT`\>: `CT` extends keyof `Content`\<`K`\> ? `Content`\<`K`\>[`CT`] : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends [`OperationKey`](README.md#operationkey) |
| `CT` | extends [`ApiContentType`](README.md#apicontenttype)\<`K`\> = `DefaultContentType`\<`K`\> |

#### Defined in

[src/core/operation.ts:51](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/operation.ts#L51)

___

### ApiContentType

Ƭ **ApiContentType**\<`K`\>: keyof `Content`\<`K`\>

Três operações aceitam dois content-types (Q20), então ele é parâmetro.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends [`OperationKey`](README.md#operationkey) |

#### Defined in

[src/core/operation.ts:46](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/operation.ts#L46)

___

### ApiParams

Ƭ **ApiParams**\<`K`\>: `NonNullable`\<`Operation`\<`K`\>\> extends \{ `parameters`: infer P  } ? `P` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends [`OperationKey`](README.md#operationkey) |

#### Defined in

[src/core/operation.ts:63](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/operation.ts#L63)

___

### ApiResponse

Ƭ **ApiResponse**\<`K`\>: `NonNullable`\<`Operation`\<`K`\>\> extends \{ `responses`: \{ `200`: \{ `content`: \{ `application/json`: infer R  }  }  }  } ? `R` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends [`OperationKey`](README.md#operationkey) |

#### Defined in

[src/core/operation.ts:56](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/operation.ts#L56)

___

### Connection

Ƭ **Connection**: `RequiredBy`\<`Omit`\<`RawConnection`, ``"status"``\>, `Exclude`\<keyof `RawConnection`, ``"status"``\>\> & \{ `status`: [`ConnectionStatus`](README.md#connectionstatus)  }

Q1: `status` aceita `WHATSAPP_AUTH`, ausente do enum do contrato.

#### Defined in

[src/schema/types.ts:45](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L45)

___

### ConnectionStatus

Ƭ **ConnectionStatus**: typeof [`CONNECTION_STATUS`](README.md#connection_status)[keyof typeof [`CONNECTION_STATUS`](README.md#connection_status)]

#### Defined in

[src/schema/overrides.ts:64](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/overrides.ts#L64)

___

### Contact

Ƭ **Contact**: [`ApiResponse`](README.md#apiresponse)\<``"GET /api/contacts/{id}"``\>

#### Defined in

[src/schema/types.ts:177](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L177)

___

### ContactPostData

Ƭ **ContactPostData**: `RequiredBy`\<`OptionalBy`\<`RawContactPostData`, ``"isGroup"`` \| ``"blocked"`` \| ``"noCheckNumber"``\>, ``"name"`` \| ``"number"``\>

Q3: `name`/`number` têm `required: true` inline — ignorado pelo codegen.
Q24: `isGroup`/`blocked`/`noCheckNumber` têm `default: false` — o codegen
os marca obrigatórios (defaultNonNullable), mas o servidor aceita omissão.

#### Defined in

[src/schema/types.ts:146](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L146)

___

### ContactTagsPostData

Ƭ **ContactTagsPostData**: `OptionalBy`\<`RawContactTagsPostData`, ``"replaceTags"`` \| ``"createTagIfNotExists"``\>

Q24: `replaceTags`/`createTagIfNotExists` têm `default` — servidor aceita omissão.

#### Defined in

[src/schema/types.ts:154](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L154)

___

### FailureKind

Ƭ **FailureKind**: ``"preauth-network"`` \| ``"ambiguous-network"`` \| ``"timeout"`` \| ``"rate-limit"`` \| ``"service-unavailable"`` \| ``"server-error"`` \| ``"client-error"`` \| ``"abort"`` \| ``"unknown"``

#### Defined in

[src/core/retry.ts:54](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L54)

___

### Message

Ƭ **Message**: `RequiredBy`\<`Omit`\<`RawMessage`, ``"id"`` \| ``"subtype"`` \| ``"isMedia"`` \| ``"myContact"``\>, ``"body"`` \| ``"type"`` \| ``"contactId"`` \| ``"ticketId"``\> & \{ `id`: `string` ; `isMedia`: `boolean` ; `myContact`: `boolean` ; `subtype`: `string`  }

Q21 — corrigido com uma resposta real de `POST /api/send/{to}`
(id="3EB071E13637D7398E4911", subtype="text", isMedia=false,
myContact=false): nenhum dos quatro bate com o tipo documentado no
contrato. `from` fica opcional de propósito — ausente na amostra real.

#### Defined in

[src/schema/types.ts:69](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L69)

___

### MessageTemplate

Ƭ **MessageTemplate**: `Omit`\<`RawMessageTemplate`, ``"type"`` \| ``"status"``\> & \{ `status`: `string` ; `type`: `string`  }

Q23 — observado em produção: `type`/`status` reais não batem com os enums
documentados (`type: "marketing-catalog"`, `status: "APPROVED"`). Sem
amostra suficiente para conhecer a taxonomia real inteira — widened para
`string` em vez de impor um enum que já se provou errado.

#### Defined in

[src/schema/types.ts:100](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L100)

___

### OperationKey

Ƭ **OperationKey**: \{ [P in keyof paths]: \`$\{Uppercase\<VerbsOf\<P\>\>} $\{P & string}\` }[keyof `paths`]

Toda operação que existe de fato no contrato. Ex: `"POST /api/send/{to}"`.

#### Defined in

[src/core/operation.ts:25](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/operation.ts#L25)

___

### Queue

Ƭ **Queue**: [`ApiResponse`](README.md#apiresponse)\<``"GET /api/queues/{id}"``\>

#### Defined in

[src/schema/types.ts:179](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L179)

___

### RetryClass

Ƭ **RetryClass**: ``"safe"`` \| ``"guarded"`` \| ``"unsafe"``

#### Defined in

[src/core/operation-metadata.ts:17](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/operation-metadata.ts#L17)

___

### SendMediaMessageData

Ƭ **SendMediaMessageData**: `BinaryField`\<`RawSendMediaMessage`, ``"media"``\>

`media` (`format: binary`) vira `string` puro no codegen — `Blob`/`Uint8Array` de verdade também são aceitos.

#### Defined in

[src/schema/types.ts:137](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L137)

___

### SendTemplateData

Ƭ **SendTemplateData**: `RequiredBy`\<`RawSendTemplate`, ``"connectionFrom"``\>

Q3: `connectionFrom` tem `required: true` inline no schema — ignorado pelo codegen (Q2).

#### Defined in

[src/schema/types.ts:117](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L117)

___

### Tag

Ƭ **Tag**: [`ApiResponse`](README.md#apiresponse)\<``"GET /api/tags/{id}"``\>

#### Defined in

[src/schema/types.ts:178](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L178)

___

### Ticket

Ƭ **Ticket**: [`ApiResponse`](README.md#apiresponse)\<``"GET /api/tickets/{id}"``\>

Tipos "bare" — sem nenhum quirk conhecido que exija correção, então
derivados direto da resposta de `get()` (que sempre traz o objeto
completo, ao contrário de `list()`, cujo item de array pode ser mais
enxuto em alguns contratos). Sem prefixo `I`, ao contrário da v0.7
(`ITicket` → `Ticket`) — ver docs/MIGRATION.md.

#### Defined in

[src/schema/types.ts:176](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L176)

___

### TicketResolveFormData

Ƭ **TicketResolveFormData**: `OptionalBy`\<`RawTicketResolveForm`, ``"feedbackOption"``\>

Q24: `feedbackOption` tem `default: "none"` — servidor aceita omissão.

#### Defined in

[src/schema/types.ts:162](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L162)

___

### UploadTempData

Ƭ **UploadTempData**: `BinaryField`\<`Required`\<`RawUploadTemp`\>, ``"media"``\>

Q3: `media` tem `required: true` inline — ignorado pelo codegen (único
campo do schema, `Required<>` builtin resolve isso). `format: binary`
também vira `string` puro no codegen — `BinaryField` aceita `Blob`/
`Uint8Array` de verdade, não só uma string já pronta.

#### Defined in

[src/schema/types.ts:127](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L127)

___

### UploadTempResponse

Ƭ **UploadTempResponse**: `Required`\<`RawUploadTempResponse`\>

Q3: `url`/`filename`/`success` têm `required: true` inline — ignorado pelo codegen. Únicos campos do schema.

#### Defined in

[src/schema/types.ts:132](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L132)

___

### User

Ƭ **User**: [`ApiResponse`](README.md#apiresponse)\<``"GET /api/users/{id}"``\>

#### Defined in

[src/schema/types.ts:180](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L180)

___

### Webhook

Ƭ **Webhook**: [`ApiResponse`](README.md#apiresponse)\<``"GET /api/webhooks/{id}"``\>

#### Defined in

[src/schema/types.ts:181](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L181)

___

### WebhookPostData

Ƭ **WebhookPostData**: `OptionalBy`\<`RawWebhookPostData`, ``"active"``\>

Q24: `active` tem `default: true` — servidor aceita omissão.

#### Defined in

[src/schema/types.ts:167](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L167)

## Variables

### API\_QUIRKS

• `Const` **API\_QUIRKS**: readonly [`ApiQuirk`](interfaces/ApiQuirk.md)[]

#### Defined in

[src/schema/overrides.ts:22](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/overrides.ts#L22)

___

### CONNECTION\_STATUS

• `Const` **CONNECTION\_STATUS**: `Readonly`\<\{ `connected`: ``"CONNECTED"`` = "CONNECTED"; `disconnected`: ``"DISCONNECTED"`` = "DISCONNECTED"; `qrcode`: ``"qrcode"`` = "qrcode"; `timeout`: ``"TIMEOUT"`` = "TIMEOUT"; `whatsappAuth`: ``"WHATSAPP_AUTH"`` = "WHATSAPP\_AUTH" }\>

Status de conexão real (Q1): o enum do contrato não inclui `WHATSAPP_AUTH`
(conexão com a API Oficial/Meta Cloud API autenticada) nem `qrcode`
(conexão aguardando pareamento por QR code) — os dois observados em
produção contra `api-admin1.zapcontabil.chat` (T24): de 11 conexões
reais, 7 estavam `WHATSAPP_AUTH` e 2 estavam `qrcode`.

#### Defined in

[src/schema/overrides.ts:56](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/overrides.ts#L56)

___

### DEFAULT\_RETRY\_CONFIG

• `Const` **DEFAULT\_RETRY\_CONFIG**: [`RetryConfig`](interfaces/RetryConfig.md)

#### Defined in

[src/core/retry.ts:43](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L43)

___

### UNLIMITED\_CONCURRENCY

• `Const` **UNLIMITED\_CONCURRENCY**: [`Semaphore`](interfaces/Semaphore.md)

`acquire()` resolve na hora, sempre — é o default (`maxConcurrent` ilimitado).

#### Defined in

[src/core/semaphore.ts:42](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/semaphore.ts#L42)

## Functions

### classifyFailure

▸ **classifyFailure**(`error`): [`FailureKind`](README.md#failurekind)

Classifica o erro capturado numa das categorias da tabela — pura, sem I/O.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

[`FailureKind`](README.md#failurekind)

#### Defined in

[src/core/retry.ts:69](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L69)

___

### isRetryableByDefault

▸ **isRetryableByDefault**(`kind`, `retryClass`, `config`): `boolean`

A tabela de §5.8.3, como função.

#### Parameters

| Name | Type |
| :------ | :------ |
| `kind` | [`FailureKind`](README.md#failurekind) |
| `retryClass` | [`RetryClass`](README.md#retryclass) |
| `config` | `Pick`\<[`RetryConfig`](interfaces/RetryConfig.md), ``"retryOnTimeout"`` \| ``"retryOnRateLimit"`` \| ``"retryUnsafeOnRateLimit"``\> |

#### Returns

`boolean`

#### Defined in

[src/core/retry.ts:84](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L84)

___

### isUsableConnectionStatus

▸ **isUsableConnectionStatus**(`status`): `boolean`

`true` para as duas conexões utilizáveis para envio — `CONNECTED` ou
`WHATSAPP_AUTH` (v0.7 já tratava as duas como válidas). `qrcode` não conta:
é conexão ainda não pareada, não há canal ativo para enviar nada.

#### Parameters

| Name | Type |
| :------ | :------ |
| `status` | [`ConnectionStatus`](README.md#connectionstatus) |

#### Returns

`boolean`

#### Defined in

[src/schema/overrides.ts:71](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/overrides.ts#L71)
