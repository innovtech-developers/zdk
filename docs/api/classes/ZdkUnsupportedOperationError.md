[ZDK](../README.md) / ZdkUnsupportedOperationError

# Class: ZdkUnsupportedOperationError

Operação existe na união de tipos, mas não no swagger *desta* instância (§5.2, Q15).
`operation` é a `OperationKey` (ex.: `"GET /api/webhooks"`) — tipada como `string`
aqui para não acoplar `core/errors.ts` a `core/operation.ts` (T08) antes da hora.

## Hierarchy

- [`ZdkError`](ZdkError.md)

  ↳ **`ZdkUnsupportedOperationError`**

## Table of contents

### Constructors

- [constructor](ZdkUnsupportedOperationError.md#constructor)

### Properties

- [attempts](ZdkUnsupportedOperationError.md#attempts)
- [cause](ZdkUnsupportedOperationError.md#cause)
- [code](ZdkUnsupportedOperationError.md#code)
- [message](ZdkUnsupportedOperationError.md#message)
- [name](ZdkUnsupportedOperationError.md#name)
- [operation](ZdkUnsupportedOperationError.md#operation)
- [retryable](ZdkUnsupportedOperationError.md#retryable)
- [stack](ZdkUnsupportedOperationError.md#stack)
- [prepareStackTrace](ZdkUnsupportedOperationError.md#preparestacktrace)
- [stackTraceLimit](ZdkUnsupportedOperationError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkUnsupportedOperationError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkUnsupportedOperationError**(`message`, `operation`, `options?`): [`ZdkUnsupportedOperationError`](ZdkUnsupportedOperationError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `operation` | `string` |
| `options` | [`ZdkErrorOptions`](../interfaces/ZdkErrorOptions.md) |

#### Returns

[`ZdkUnsupportedOperationError`](ZdkUnsupportedOperationError.md)

#### Overrides

ZdkError.constructor

#### Defined in

[src/core/errors.ts:107](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L107)

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

• `Readonly` **code**: ``"ZDK_UNSUPPORTED_OPERATION"``

#### Overrides

[ZdkError](ZdkError.md).[code](ZdkError.md#code)

#### Defined in

[src/core/errors.ts:104](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L104)

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

### operation

• `Readonly` **operation**: `string`

#### Defined in

[src/core/errors.ts:105](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L105)

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
