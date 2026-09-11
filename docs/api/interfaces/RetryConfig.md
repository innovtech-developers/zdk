[ZDK](../README.md) / RetryConfig

# Interface: RetryConfig

## Table of contents

### Properties

- [attempts](RetryConfig.md#attempts)
- [baseDelayMs](RetryConfig.md#basedelayms)
- [deadlineMs](RetryConfig.md#deadlinems)
- [maxDelayMs](RetryConfig.md#maxdelayms)
- [maxRetryAfterMs](RetryConfig.md#maxretryafterms)
- [onRetry](RetryConfig.md#onretry)
- [random](RetryConfig.md#random)
- [retryOnRateLimit](RetryConfig.md#retryonratelimit)
- [retryOnTimeout](RetryConfig.md#retryontimeout)
- [retryUnsafeOnRateLimit](RetryConfig.md#retryunsafeonratelimit)
- [shouldRetry](RetryConfig.md#shouldretry)
- [sleep](RetryConfig.md#sleep)

## Properties

### attempts

• `Readonly` **attempts**: `number`

#### Defined in

[src/core/retry.ts:21](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L21)

___

### baseDelayMs

• `Readonly` **baseDelayMs**: `number`

#### Defined in

[src/core/retry.ts:22](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L22)

___

### deadlineMs

• `Readonly` **deadlineMs**: ``null`` \| `number`

Teto de wall clock do total de tentativas. `null` = sem teto (default; pior caso documentado no README).

#### Defined in

[src/core/retry.ts:33](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L33)

___

### maxDelayMs

• `Readonly` **maxDelayMs**: `number`

#### Defined in

[src/core/retry.ts:23](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L23)

___

### maxRetryAfterMs

• `Readonly` **maxRetryAfterMs**: `number`

`Retry-After`/`x-ratelimit-reset` acima disso: falha rápido em vez de dormir.

#### Defined in

[src/core/retry.ts:25](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L25)

___

### onRetry

• `Optional` `Readonly` **onRetry**: (`info`: [`RetryAttemptInfo`](RetryAttemptInfo.md)) => `void`

#### Type declaration

▸ (`info`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `info` | [`RetryAttemptInfo`](RetryAttemptInfo.md) |

##### Returns

`void`

#### Defined in

[src/core/retry.ts:38](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L38)

___

### random

• `Optional` `Readonly` **random**: () => `number`

**`Default`**

```ts
Math.random
```

#### Type declaration

▸ (): `number`

##### Returns

`number`

#### Defined in

[src/core/retry.ts:35](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L35)

___

### retryOnRateLimit

• `Readonly` **retryOnRateLimit**: `boolean`

Rege `safe`/`guarded` em 429. RFC 9110: rejeitado antes do processamento.

#### Defined in

[src/core/retry.ts:29](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L29)

___

### retryOnTimeout

• `Readonly` **retryOnTimeout**: `boolean`

Master switch: por padrão, NENHUMA classe repete em timeout — ambíguo por natureza (§5.8.2).

#### Defined in

[src/core/retry.ts:27](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L27)

___

### retryUnsafeOnRateLimit

• `Readonly` **retryUnsafeOnRateLimit**: `boolean`

Rege `unsafe` em 429 — desligado até o código do limitador ser identificado (§5.8.4).

#### Defined in

[src/core/retry.ts:31](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L31)

___

### shouldRetry

• `Optional` `Readonly` **shouldRetry**: (`context`: [`RetryDecisionContext`](RetryDecisionContext.md)) => `undefined` \| `boolean`

`undefined` delega ao default da tabela — não é obrigado a decidir tudo.

#### Type declaration

▸ (`context`): `undefined` \| `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`RetryDecisionContext`](RetryDecisionContext.md) |

##### Returns

`undefined` \| `boolean`

#### Defined in

[src/core/retry.ts:40](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L40)

___

### sleep

• `Optional` `Readonly` **sleep**: (`ms`: `number`) => `Promise`\<`void`\>

**`Default`**

```ts
setTimeout-based sleep
```

#### Type declaration

▸ (`ms`): `Promise`\<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `ms` | `number` |

##### Returns

`Promise`\<`void`\>

#### Defined in

[src/core/retry.ts:37](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/retry.ts#L37)
