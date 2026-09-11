[ZDK](../README.md) / ZdkValidationError

# Class: ZdkValidationError

400 genérico.

## Hierarchy

- [`ZdkHttpError`](ZdkHttpError.md)

  ↳ **`ZdkValidationError`**

## Table of contents

### Constructors

- [constructor](ZdkValidationError.md#constructor)

### Properties

- [attempts](ZdkValidationError.md#attempts)
- [cause](ZdkValidationError.md#cause)
- [code](ZdkValidationError.md#code)
- [message](ZdkValidationError.md#message)
- [name](ZdkValidationError.md#name)
- [payload](ZdkValidationError.md#payload)
- [requestId](ZdkValidationError.md#requestid)
- [retryable](ZdkValidationError.md#retryable)
- [stack](ZdkValidationError.md#stack)
- [status](ZdkValidationError.md#status)
- [prepareStackTrace](ZdkValidationError.md#preparestacktrace)
- [stackTraceLimit](ZdkValidationError.md#stacktracelimit)

### Methods

- [captureStackTrace](ZdkValidationError.md#capturestacktrace)

## Constructors

### constructor

• **new ZdkValidationError**(`message`, `code`, `options`): [`ZdkValidationError`](ZdkValidationError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `code` | `string` |
| `options` | [`ZdkHttpErrorOptions`](../interfaces/ZdkHttpErrorOptions.md) |

#### Returns

[`ZdkValidationError`](ZdkValidationError.md)

#### Overrides

ZdkHttpError.constructor

#### Defined in

[src/core/errors.ts:143](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L143)

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
