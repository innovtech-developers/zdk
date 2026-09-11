[ZDK](../README.md) / ZdkNotFoundError

# Class: ZdkNotFoundError

404.

## Hierarchy

- [`ZdkHttpError`](ZdkHttpError.md)

  ↳ **`ZdkNotFoundError`**

## Table of contents

### Constructors

- [constructor](ZdkNotFoundError.md#constructor)

### Properties

- [attempts](ZdkNotFoundError.md#attempts)
- [cause](ZdkNotFoundError.md#cause)
- [code](ZdkNotFoundError.md#code)
- [message](ZdkNotFoundError.md#message)
- [name](ZdkNotFoundError.md#name)
- [payload](ZdkNotFoundError.md#payload)
- [requestId](ZdkNotFoundError.md#requestid)
- [retryable](ZdkNotFoundError.md#retryable)
- [stack](ZdkNotFoundError.md#stack)
- [status](ZdkNotFoundError.md#status)
- [prepareStackTrace](ZdkNotFoundError.md#preparestacktrace)
- [stackTraceLimit](ZdkNotFoundError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkNotFoundError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkNotFoundError**(`message`, `code`, `options`): [`ZdkNotFoundError`](ZdkNotFoundError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `code` | `string` |
| `options` | [`ZdkHttpErrorOptions`](../interfaces/ZdkHttpErrorOptions.md) |

#### Returns

[`ZdkNotFoundError`](ZdkNotFoundError.md)

#### Overrides

ZdkHttpError.constructor

#### Defined in

[src/core/errors.ts:171](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L171)

## Properties

### attempts

• **attempts**: `number`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[attempts](ZdkHttpError.md#attempts)

#### Defined in

[src/core/errors.ts:30](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L30)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[cause](ZdkHttpError.md#cause)

#### Defined in

[src/core/errors.ts:28](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L28)

___

### code

• `Readonly` **code**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[code](ZdkHttpError.md#code)

#### Defined in

[src/core/errors.ts:127](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L127)

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

[src/core/errors.ts:129](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L129)

___

### requestId

• `Optional` `Readonly` **requestId**: `string`

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[requestId](ZdkHttpError.md#requestid)

#### Defined in

[src/core/errors.ts:130](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L130)

___

### retryable

• **retryable**: `boolean`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkHttpError](ZdkHttpError.md).[retryable](ZdkHttpError.md#retryable)

#### Defined in

[src/core/errors.ts:32](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L32)

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
