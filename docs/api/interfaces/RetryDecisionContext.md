[ZDK](../README.md) / RetryDecisionContext

# Interface: RetryDecisionContext

## Table of contents

### Properties

- [attempt](RetryDecisionContext.md#attempt)
- [error](RetryDecisionContext.md#error)
- [kind](RetryDecisionContext.md#kind)
- [operation](RetryDecisionContext.md#operation)
- [retryClass](RetryDecisionContext.md#retryclass)

## Properties

### attempt

• `Readonly` **attempt**: `number`

#### Defined in

[src/core/retry.ts:112](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L112)

___

### error

• `Readonly` **error**: `unknown`

#### Defined in

[src/core/retry.ts:110](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L110)

___

### kind

• `Readonly` **kind**: [`FailureKind`](../README.md#failurekind)

#### Defined in

[src/core/retry.ts:111](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L111)

___

### operation

• `Readonly` **operation**: `string`

#### Defined in

[src/core/retry.ts:114](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L114)

___

### retryClass

• `Readonly` **retryClass**: [`RetryClass`](../README.md#retryclass)

#### Defined in

[src/core/retry.ts:113](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/retry.ts#L113)
