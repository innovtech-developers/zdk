[ZDK](../README.md) / ZdkHttpError

# Class: ZdkHttpError

Erro HTTP (2xx tratado como erro pelo contrato, ou 4xx/5xx). `code` não é fixo
por classe — vem do campo `error` do corpo (`ERR_*` da Zappy), o discriminante
real (§5.4). Quem decide a subclasse é `error-mapper.ts` (T09), a partir do
`status`.

## Hierarchy

- [`ZdkError`](ZdkError.md)

  ↳ **`ZdkHttpError`**

  ↳↳ [`ZdkValidationError`](ZdkValidationError.md)

  ↳↳ [`ZdkOfficialApiWindowError`](ZdkOfficialApiWindowError.md)

  ↳↳ [`ZdkAuthError`](ZdkAuthError.md)

  ↳↳ [`ZdkNotFoundError`](ZdkNotFoundError.md)

  ↳↳ [`ZdkRateLimitError`](ZdkRateLimitError.md)

  ↳↳ [`ZdkServerError`](ZdkServerError.md)

## Table of contents

### Properties

- [attempts](ZdkHttpError.md#attempts)
- [cause](ZdkHttpError.md#cause)
- [code](ZdkHttpError.md#code)
- [message](ZdkHttpError.md#message)
- [name](ZdkHttpError.md#name)
- [payload](ZdkHttpError.md#payload)
- [requestId](ZdkHttpError.md#requestid)
- [retryable](ZdkHttpError.md#retryable)
- [stack](ZdkHttpError.md#stack)
- [status](ZdkHttpError.md#status)
- [prepareStackTrace](ZdkHttpError.md#preparestacktrace)
- [stackTraceLimit](ZdkHttpError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkHttpError.md#capturestacktrace)

## Properties

### attempts

• **attempts**: `number`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkError](ZdkError.md).[attempts](ZdkError.md#attempts)

#### Defined in

[src/core/errors.ts:30](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L30)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Inherited from

[ZdkError](ZdkError.md).[cause](ZdkError.md#cause)

#### Defined in

[src/core/errors.ts:28](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L28)

___

### code

• `Readonly` **code**: `string`

#### Overrides

[ZdkError](ZdkError.md).[code](ZdkError.md#code)

#### Defined in

[src/core/errors.ts:127](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L127)

___

### message

• **message**: `string`

#### Inherited from

[ZdkError](ZdkError.md).[message](ZdkError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

[ZdkError](ZdkError.md).[name](ZdkError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### payload

• `Readonly` **payload**: `unknown`

#### Defined in

[src/core/errors.ts:129](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L129)

___

### requestId

• `Optional` `Readonly` **requestId**: `string`

#### Defined in

[src/core/errors.ts:130](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L130)

___

### retryable

• **retryable**: `boolean`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkError](ZdkError.md).[retryable](ZdkError.md#retryable)

#### Defined in

[src/core/errors.ts:32](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L32)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[ZdkError](ZdkError.md).[stack](ZdkError.md#stack)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

___

### status

• `Readonly` **status**: `number`

#### Defined in

[src/core/errors.ts:128](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L128)

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration

▸ (`err`, `stackTraces`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

[ZdkError](ZdkError.md).[prepareStackTrace](ZdkError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:98

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[ZdkError](ZdkError.md).[stackTraceLimit](ZdkError.md#stacktracelimit)

#### Defined in

node_modules/@types/node/globals.d.ts:100

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

[ZdkError](ZdkError.md).[captureStackTrace](ZdkError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:91
