[ZDK](../README.md) / ZdkNetworkError

# Class: ZdkNetworkError

Falha de transporte (DNS, conexão recusada, socket derrubado, …).

## Hierarchy

- [`ZdkError`](ZdkError.md)

  ↳ **`ZdkNetworkError`**

## Table of contents

### Constructors

- [constructor](ZdkNetworkError.md#constructor)

### Properties

- [attempts](ZdkNetworkError.md#attempts)
- [cause](ZdkNetworkError.md#cause)
- [code](ZdkNetworkError.md#code)
- [message](ZdkNetworkError.md#message)
- [name](ZdkNetworkError.md#name)
- [retryable](ZdkNetworkError.md#retryable)
- [stack](ZdkNetworkError.md#stack)
- [transportCode](ZdkNetworkError.md#transportcode)
- [prepareStackTrace](ZdkNetworkError.md#preparestacktrace)
- [stackTraceLimit](ZdkNetworkError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkNetworkError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkNetworkError**(`message`, `options?`): [`ZdkNetworkError`](ZdkNetworkError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `options` | [`ZdkNetworkErrorOptions`](../interfaces/ZdkNetworkErrorOptions.md) |

#### Returns

[`ZdkNetworkError`](ZdkNetworkError.md)

#### Overrides

ZdkError.constructor

#### Defined in

[src/core/errors.ts:72](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L72)

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

• `Readonly` **code**: ``"ZDK_NETWORK_ERROR"``

#### Overrides

[ZdkError](ZdkError.md).[code](ZdkError.md#code)

#### Defined in

[src/core/errors.ts:69](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L69)

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

### transportCode

• `Optional` `Readonly` **transportCode**: `string`

#### Defined in

[src/core/errors.ts:70](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L70)

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
