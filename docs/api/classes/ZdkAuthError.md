[ZDK](../README.md) / ZdkAuthError

# Class: ZdkAuthError

401 ou 403. `code` distingue a causa real — `ERR_INVALID_API_KEY` (token
errado, problema do consumidor) de `ERR_NO_AUTH_HEADER_PRESENT` (header não
foi enviado, bug do SDK) — observado em produção (Q13, Q17).

## Hierarchy

- [`ZdkHttpError`](ZdkHttpError.md)

  ↳ **`ZdkAuthError`**

## Table of contents

### Constructors

- [constructor](ZdkAuthError.md#constructor)

### Properties

- [attempts](ZdkAuthError.md#attempts)
- [cause](ZdkAuthError.md#cause)
- [code](ZdkAuthError.md#code)
- [message](ZdkAuthError.md#message)
- [name](ZdkAuthError.md#name)
- [payload](ZdkAuthError.md#payload)
- [requestId](ZdkAuthError.md#requestid)
- [retryable](ZdkAuthError.md#retryable)
- [stack](ZdkAuthError.md#stack)
- [status](ZdkAuthError.md#status)
- [prepareStackTrace](ZdkAuthError.md#preparestacktrace)
- [stackTraceLimit](ZdkAuthError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkAuthError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkAuthError**(`message`, `code`, `options`): [`ZdkAuthError`](ZdkAuthError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `code` | `string` |
| `options` | [`ZdkHttpErrorOptions`](../interfaces/ZdkHttpErrorOptions.md) |

#### Returns

[`ZdkAuthError`](ZdkAuthError.md)

#### Overrides

ZdkHttpError.constructor

#### Defined in

[src/core/errors.ts:164](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L164)

## Properties

### attempts

• **attempts**: `number`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[attempts](ZdkHttpError.md#attempts)

#### Defined in

[src/core/errors.ts:30](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L30)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[cause](ZdkHttpError.md#cause)

#### Defined in

[src/core/errors.ts:28](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L28)

___

### code

• `Readonly` **code**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[code](ZdkHttpError.md#code)

#### Defined in

[src/core/errors.ts:127](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L127)

___

### message

• **message**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[message](ZdkHttpError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[name](ZdkHttpError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### payload

• `Readonly` **payload**: `unknown`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[payload](ZdkHttpError.md#payload)

#### Defined in

[src/core/errors.ts:129](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L129)

___

### requestId

• `Optional` `Readonly` **requestId**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[requestId](ZdkHttpError.md#requestid)

#### Defined in

[src/core/errors.ts:130](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L130)

___

### retryable

• **retryable**: `boolean`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[retryable](ZdkHttpError.md#retryable)

#### Defined in

[src/core/errors.ts:32](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L32)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[stack](ZdkHttpError.md#stack)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

___

### status

• `Readonly` **status**: `number`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[status](ZdkHttpError.md#status)

#### Defined in

[src/core/errors.ts:128](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L128)

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

[ZdkHttpError](ZdkHttpError.md).[prepareStackTrace](ZdkHttpError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:98

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[stackTraceLimit](ZdkHttpError.md#stacktracelimit)

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

[ZdkHttpError](ZdkHttpError.md).[captureStackTrace](ZdkHttpError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:91
