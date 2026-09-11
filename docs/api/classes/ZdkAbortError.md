[ZDK](../README.md) / ZdkAbortError

# Class: ZdkAbortError

`AbortSignal` do próprio consumidor foi acionado. Nunca sofre retry — é vontade de quem chamou.

## Hierarchy

- [`ZdkError`](ZdkError.md)

  ↳ **`ZdkAbortError`**

## Table of contents

### Constructors

- [constructor](ZdkAbortError.md#constructor)

### Properties

- [attempts](ZdkAbortError.md#attempts)
- [cause](ZdkAbortError.md#cause)
- [code](ZdkAbortError.md#code)
- [message](ZdkAbortError.md#message)
- [name](ZdkAbortError.md#name)
- [retryable](ZdkAbortError.md#retryable)
- [stack](ZdkAbortError.md#stack)
- [prepareStackTrace](ZdkAbortError.md#preparestacktrace)
- [stackTraceLimit](ZdkAbortError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkAbortError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkAbortError**(`message`, `options?`): [`ZdkAbortError`](ZdkAbortError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `options` | [`ZdkErrorOptions`](../interfaces/ZdkErrorOptions.md) |

#### Returns

[`ZdkAbortError`](ZdkAbortError.md)

#### Overrides

ZdkError.constructor

#### Defined in

[src/core/errors.ts:93](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L93)

## Properties

### attempts

• **attempts**: `number`

Mutável — ver comentário do módulo.

#### Inherited from

[ZdkError](ZdkError.md).[attempts](ZdkError.md#attempts)

#### Defined in

[src/core/errors.ts:30](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L30)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Inherited from

[ZdkError](ZdkError.md).[cause](ZdkError.md#cause)

#### Defined in

[src/core/errors.ts:28](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L28)

___

### code

• `Readonly` **code**: ``"ZDK_ABORT_ERROR"``

#### Overrides

[ZdkError](ZdkError.md).[code](ZdkError.md#code)

#### Defined in

[src/core/errors.ts:91](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L91)

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

[src/core/errors.ts:32](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L32)

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
