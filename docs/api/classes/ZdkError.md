[ZDK](../README.md) / ZdkError

# Class: ZdkError

## Hierarchy

- `Error`

  ↳ **`ZdkError`**

  ↳↳ [`ZdkConfigError`](ZdkConfigError.md)

  ↳↳ [`ZdkNetworkError`](ZdkNetworkError.md)

  ↳↳ [`ZdkTimeoutError`](ZdkTimeoutError.md)

  ↳↳ [`ZdkAbortError`](ZdkAbortError.md)

  ↳↳ [`ZdkUnsupportedOperationError`](ZdkUnsupportedOperationError.md)

  ↳↳ [`ZdkHttpError`](ZdkHttpError.md)

## Table of contents

### Properties

- [attempts](ZdkError.md#attempts)
- [cause](ZdkError.md#cause)
- [code](ZdkError.md#code)
- [message](ZdkError.md#message)
- [name](ZdkError.md#name)
- [retryable](ZdkError.md#retryable)
- [stack](ZdkError.md#stack)
- [prepareStackTrace](ZdkError.md#preparestacktrace)
- [stackTraceLimit](ZdkError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkError.md#capturestacktrace)

## Properties

### attempts

• **attempts**: `number`

Mutável — ver comentário do módulo.

#### Defined in

[src/core/errors.ts:30](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L30)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Overrides

Error.cause

#### Defined in

[src/core/errors.ts:28](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L28)

___

### code

• `Readonly` `Abstract` **code**: `string`

#### Defined in

[src/core/errors.ts:26](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L26)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### retryable

• **retryable**: `boolean`

Mutável — ver comentário do módulo.

#### Defined in

[src/core/errors.ts:32](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L32)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

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

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:98

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

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

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:91
