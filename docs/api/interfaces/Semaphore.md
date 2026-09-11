[ZDK](../README.md) / Semaphore

# Interface: Semaphore

Limite de concorrência opcional (§5.8.5 — substituto de custo quase nulo ao
circuit breaker). Sem estado entre chamadas além do contador de ativos;
default é ilimitado, para não mudar throughput de quem já usa a lib em
lote em upgrade da v0.7.

## Implemented by

- [`ConcurrencyLimiter`](../classes/ConcurrencyLimiter.md)

## Table of contents

### Methods

- [acquire](Semaphore.md#acquire)

## Methods

### acquire

▸ **acquire**(): `Promise`\<() => `void`\>

Resolve quando há vaga; devolve a função de liberar (chamar sempre, inclusive em erro).

#### Returns

`Promise`\<() => `void`\>

#### Defined in

[src/core/semaphore.ts:10](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/semaphore.ts#L10)
