[ZDK](../README.md) / RateLimitSnapshot

# Interface: RateLimitSnapshot

Leitura do orçamento de rate limit a partir dos headers de resposta (§5.8.4,
Q8/Q14). A Zappy expõe `x-ratelimit-*` (legacy, confirmado por observação
real) — este módulo também lê `ratelimit-*` (draft IETF) para sobreviver a
uma troca do limitador no servidor.

Toda conta de tempo aqui é contra o relógio do SERVIDOR (`observedAt`, o
header `date` da resposta) — nunca `Date.now()`. Provado na prática:
`x-ratelimit-reset` é epoch absoluto (uma amostra deu `reset - date = 2s`
com a janela fechando; outra deu 31s com `remaining` no máximo — a duração
da janela não é derivável e não faz falta, só o instante final importa).

## Table of contents

### Properties

- [limit](RateLimitSnapshot.md#limit)
- [observedAt](RateLimitSnapshot.md#observedat)
- [remaining](RateLimitSnapshot.md#remaining)
- [resetAt](RateLimitSnapshot.md#resetat)

## Properties

### limit

• `Readonly` **limit**: `number`

#### Defined in

[src/core/rate-limit.ts:15](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/rate-limit.ts#L15)

___

### observedAt

• `Readonly` **observedAt**: `Date`

#### Defined in

[src/core/rate-limit.ts:18](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/rate-limit.ts#L18)

___

### remaining

• `Readonly` **remaining**: `number`

#### Defined in

[src/core/rate-limit.ts:16](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/rate-limit.ts#L16)

___

### resetAt

• `Readonly` **resetAt**: `Date`

#### Defined in

[src/core/rate-limit.ts:17](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/rate-limit.ts#L17)
