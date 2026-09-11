[ZDK](../README.md) / ZdkConfigError

# Class: ZdkConfigError

`baseUrl` ou `token` ausente ou inválido (§5.6). Nunca chega a fazer requisição.

## Hierarchy

- [`ZdkError`](ZdkError.md)

  ↳ **`ZdkConfigError`**

## Table of contents

### Constructors

- [constructor](ZdkConfigError.md#constructor)

### Properties

- [attempts](ZdkConfigError.md#attempts)
- [cause](ZdkConfigError.md#cause)
- [code](ZdkConfigError.md#code)
- [message](ZdkConfigError.md#message)
- [name](ZdkConfigError.md#name)
- [retryable](ZdkConfigError.md#retryable)
- [stack](ZdkConfigError.md#stack)
- [prepareStackTrace](ZdkConfigError.md#preparestacktrace)
- [stackTraceLimit](ZdkConfigError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkConfigError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkConfigError**(`message`, `options?`): [`ZdkConfigError`](ZdkConfigError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `options` | [`ZdkErrorOptions`](../interfaces/ZdkErrorOptions.md) |

#### Returns

[`ZdkConfigError`](ZdkConfigError.md)

#### Overrides

ZdkError.constructor

#### Defined in

[src/core/errors.ts:51](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L51)

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

• `Readonly` **code**: ``"ZDK_CONFIG_ERROR"``

#### Overrides

[ZdkError](ZdkError.md).[code](ZdkError.md#code)

#### Defined in

[src/core/errors.ts:49](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L49)

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
