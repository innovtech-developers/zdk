[ZDK](../README.md) / ConcurrencyLimiter

# Class: ConcurrencyLimiter

Limite de concorrência opcional (§5.8.5 — substituto de custo quase nulo ao
circuit breaker). Sem estado entre chamadas além do contador de ativos;
default é ilimitado, para não mudar throughput de quem já usa a lib em
lote em upgrade da v0.7.

## Implements

- [`Semaphore`](../interfaces/Semaphore.md)

## Table of contents

### Constructors

- [constructor](ConcurrencyLimiter.md#constructor)

### Methods

- [acquire](ConcurrencyLimiter.md#acquire)

## Constructors

### constructor

• **new ConcurrencyLimiter**(`maxConcurrent`): [`ConcurrencyLimiter`](ConcurrencyLimiter.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `maxConcurrent` | `number` |

#### Returns

[`ConcurrencyLimiter`](ConcurrencyLimiter.md)

#### Defined in

[src/core/semaphore.ts:17](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/semaphore.ts#L17)

## Methods

### acquire

▸ **acquire**(): `Promise`\<() => `void`\>

Resolve quando há vaga; devolve a função de liberar (chamar sempre, inclusive em erro).

#### Returns

`Promise`\<() => `void`\>

#### Implementation of

[Semaphore](../interfaces/Semaphore.md).[acquire](../interfaces/Semaphore.md#acquire)

#### Defined in

[src/core/semaphore.ts:23](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/semaphore.ts#L23)
