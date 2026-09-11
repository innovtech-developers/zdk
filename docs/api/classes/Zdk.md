[ZDK](../README.md) / Zdk

# Class: Zdk

## Table of contents

### Constructors

- [constructor](Zdk.md#constructor)

### Properties

- [connections](Zdk.md#connections)
- [contacts](Zdk.md#contacts)
- [dashboard](Zdk.md#dashboard)
- [messages](Zdk.md#messages)
- [metrics](Zdk.md#metrics)
- [queues](Zdk.md#queues)
- [storage](Zdk.md#storage)
- [tags](Zdk.md#tags)
- [templates](Zdk.md#templates)
- [tickets](Zdk.md#tickets)
- [users](Zdk.md#users)
- [webhooks](Zdk.md#webhooks)

### Accessors

- [rateLimit](Zdk.md#ratelimit)

### Methods

- [capabilities](Zdk.md#capabilities)
- [supports](Zdk.md#supports)
- [verify](Zdk.md#verify)
- [connect](Zdk.md#connect)

## Constructors

### constructor

• **new Zdk**(`options?`): [`Zdk`](Zdk.md)

Síncrono, zero I/O — valida só `baseUrl`/`token` (§5.6). Prova de credencial é `verify()`/`connect()`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ZdkOptions`](../interfaces/ZdkOptions.md) |

#### Returns

[`Zdk`](Zdk.md)

#### Defined in

[src/zdk.ts:69](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L69)

## Properties

### connections

• `Readonly` **connections**: `Connections`

#### Defined in

[src/zdk.ts:55](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L55)

___

### contacts

• `Readonly` **contacts**: `Contacts`

#### Defined in

[src/zdk.ts:56](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L56)

___

### dashboard

• `Readonly` **dashboard**: `Dashboard`

#### Defined in

[src/zdk.ts:65](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L65)

___

### messages

• `Readonly` **messages**: `Messages`

#### Defined in

[src/zdk.ts:60](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L60)

___

### metrics

• `Readonly` **metrics**: `Metrics`

#### Defined in

[src/zdk.ts:66](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L66)

___

### queues

• `Readonly` **queues**: `Queues`

#### Defined in

[src/zdk.ts:58](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L58)

___

### storage

• `Readonly` **storage**: `Storage`

#### Defined in

[src/zdk.ts:63](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L63)

___

### tags

• `Readonly` **tags**: `Tags`

#### Defined in

[src/zdk.ts:57](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L57)

___

### templates

• `Readonly` **templates**: `Templates`

#### Defined in

[src/zdk.ts:62](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L62)

___

### tickets

• `Readonly` **tickets**: `Tickets`

#### Defined in

[src/zdk.ts:61](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L61)

___

### users

• `Readonly` **users**: `Users`

#### Defined in

[src/zdk.ts:59](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L59)

___

### webhooks

• `Readonly` **webhooks**: `Webhooks`

#### Defined in

[src/zdk.ts:64](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L64)

## Accessors

### rateLimit

• `get` **rateLimit**(): ``null`` \| [`RateLimitSnapshot`](../interfaces/RateLimitSnapshot.md)

Orçamento de rate limit da última resposta com os headers presentes (§5.8.4). `null` até a primeira.

#### Returns

``null`` \| [`RateLimitSnapshot`](../interfaces/RateLimitSnapshot.md)

#### Defined in

[src/zdk.ts:105](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L105)

## Methods

### capabilities

▸ **capabilities**(): `Promise`\<``null`` \| `ReadonlySet`\<`string`\>\>

Gate proativo (§5.2): garante o swagger da instância carregado (1x, cacheado).

#### Returns

`Promise`\<``null`` \| `ReadonlySet`\<`string`\>\>

#### Defined in

[src/zdk.ts:110](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L110)

___

### supports

▸ **supports**(`operation`): `boolean`

`true` se a operação existe no swagger desta instância. Antes de `capabilities()` carregar: assume suportado.

#### Parameters

| Name | Type |
| :------ | :------ |
| `operation` | `string` |

#### Returns

`boolean`

#### Defined in

[src/zdk.ts:115](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L115)

___

### verify

▸ **verify**(): `Promise`\<[`VerifyResult`](../interfaces/VerifyResult.md)\>

Prova as credenciais contra `GET /api/connections` — reusa
`connections.list()`, então é a chamada de bootstrap que qualquer envio
ia precisar de qualquer forma, não health check desperdiçado.

#### Returns

`Promise`\<[`VerifyResult`](../interfaces/VerifyResult.md)\>

**`Throws`**

401 — `code` distingue `ERR_INVALID_API_KEY`
  (token errado) de `ERR_NO_AUTH_HEADER_PRESENT` (bug do SDK).

**`Throws`**

`2xx` sem `connections` — host não parece ser a API Zappy.

**`Throws`**

host inalcançável.

#### Defined in

[src/zdk.ts:128](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L128)

___

### connect

▸ **connect**(`options?`): `Promise`\<[`Zdk`](Zdk.md)\>

`new Zdk(options)` seguido de `verify()` — só a instância já provada.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ZdkOptions`](../interfaces/ZdkOptions.md) |

#### Returns

`Promise`\<[`Zdk`](Zdk.md)\>

#### Defined in

[src/zdk.ts:139](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L139)
