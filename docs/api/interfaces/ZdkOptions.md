[ZDK](../README.md) / ZdkOptions

# Interface: ZdkOptions

## Hierarchy

- `ZdkConfigInput`

  ↳ **`ZdkOptions`**

## Table of contents

### Properties

- [baseUrl](ZdkOptions.md#baseurl)
- [defaultTimeoutMs](ZdkOptions.md#defaulttimeoutms)
- [onRateLimit](ZdkOptions.md#onratelimit)
- [rateLimit](ZdkOptions.md#ratelimit)
- [retryConfig](ZdkOptions.md#retryconfig)
- [semaphore](ZdkOptions.md#semaphore)
- [strictApiHost](ZdkOptions.md#strictapihost)
- [strictTokenLength](ZdkOptions.md#stricttokenlength)
- [token](ZdkOptions.md#token)
- [verifyCapabilities](ZdkOptions.md#verifycapabilities)

## Properties

### baseUrl

• `Optional` `Readonly` **baseUrl**: `string`

**`Default`**

```ts
process.env.ZAPPY_URL
```

#### Inherited from

ZdkConfigInput.baseUrl

#### Defined in

[src/core/config.ts:116](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/config.ts#L116)

___

### defaultTimeoutMs

• `Optional` `Readonly` **defaultTimeoutMs**: `number`

Timeout global de fallback — só vale para operação sem motivo técnico próprio (§5.8.1).

**`Default`**

```ts
10_000
```

#### Defined in

[src/zdk.ts:36](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L36)

___

### onRateLimit

• `Optional` `Readonly` **onRateLimit**: (`snapshot`: [`RateLimitSnapshot`](RateLimitSnapshot.md)) => `void`

Observa o orçamento de rate limit em toda resposta com os headers presentes — além de `zdk.rateLimit`, que é sempre atualizado.

#### Type declaration

▸ (`snapshot`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `snapshot` | [`RateLimitSnapshot`](RateLimitSnapshot.md) |

##### Returns

`void`

#### Defined in

[src/zdk.ts:42](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L42)

___

### rateLimit

• `Optional` `Readonly` **rateLimit**: [`RateLimitOptions`](RateLimitOptions.md)

Comportamento de rate limit (§5.8.4).

**`Default`**

`{ mode: "observe" }` — nunca dorme sozinho.

#### Defined in

[src/zdk.ts:40](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L40)

___

### retryConfig

• `Optional` `Readonly` **retryConfig**: `Partial`\<[`RetryConfig`](RetryConfig.md)\>

Parcial: mesclado por cima de DEFAULT_RETRY_CONFIG (não precisa especificar todos os campos).

#### Defined in

[src/zdk.ts:34](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L34)

___

### semaphore

• `Optional` `Readonly` **semaphore**: [`Semaphore`](Semaphore.md)

#### Defined in

[src/zdk.ts:32](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L32)

___

### strictApiHost

• `Optional` `Readonly` **strictApiHost**: `boolean`

#### Inherited from

ZdkConfigInput.strictApiHost

#### Defined in

[src/core/config.ts:119](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/config.ts#L119)

___

### strictTokenLength

• `Optional` `Readonly` **strictTokenLength**: `boolean`

#### Inherited from

ZdkConfigInput.strictTokenLength

#### Defined in

[src/core/config.ts:120](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/config.ts#L120)

___

### token

• `Optional` `Readonly` **token**: `string`

**`Default`**

```ts
process.env.ZAPPY_TOKEN
```

#### Inherited from

ZdkConfigInput.token

#### Defined in

[src/core/config.ts:118](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/config.ts#L118)

___

### verifyCapabilities

• `Optional` `Readonly` **verifyCapabilities**: `boolean`

Pré-checa `capabilities` em toda chamada, antes do HTTP.

**`Default`**

```ts
false
```

#### Defined in

[src/zdk.ts:38](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/zdk.ts#L38)
