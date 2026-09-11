[ZDK](../README.md) / ZdkTimeoutError

# Class: ZdkTimeoutError

Estourou o timeout de uma tentativa (§5.8.1). Nunca sofre retry automático por default.

## Hierarchy

- [`ZdkError`](ZdkError.md)

  ↳ **`ZdkTimeoutError`**

## Table of contents

### Constructors

- [constructor](ZdkTimeoutError.md#constructor)

### Properties

- [attempts](ZdkTimeoutError.md#attempts)
- [cause](ZdkTimeoutError.md#cause)
- [code](ZdkTimeoutError.md#code)
- [message](ZdkTimeoutError.md#message)
- [name](ZdkTimeoutError.md#name)
- [retryable](ZdkTimeoutError.md#retryable)
- [stack](ZdkTimeoutError.md#stack)
- [timeoutMs](ZdkTimeoutError.md#timeoutms)
- [prepareStackTrace](ZdkTimeoutError.md#preparestacktrace)
- [stackTraceLimit](ZdkTimeoutError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkTimeoutError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkTimeoutError**(`message`, `timeoutMs`, `options?`): [`ZdkTimeoutError`](ZdkTimeoutError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `timeoutMs` | `number` |
| `options` | [`ZdkErrorOptions`](../interfaces/ZdkErrorOptions.md) |

#### Returns

[`ZdkTimeoutError`](ZdkTimeoutError.md)

#### Overrides

ZdkError.constructor

#### Defined in

[src/core/errors.ts:83](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L83)

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

• `Readonly` **code**: ``"ZDK_TIMEOUT_ERROR"``

#### Overrides

[ZdkError](ZdkError.md).[code](ZdkError.md#code)

#### Defined in

[src/core/errors.ts:80](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L80)

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

### timeoutMs

• `Readonly` **timeoutMs**: `number`

#### Defined in

[src/core/errors.ts:81](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L81)

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
