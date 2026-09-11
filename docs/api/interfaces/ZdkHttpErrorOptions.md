[ZDK](../README.md) / ZdkHttpErrorOptions

# Interface: ZdkHttpErrorOptions

Hierarquia de erros do ZDK (§5.4 da spec). Toda falha de rede, HTTP ou de
configuração chega ao consumidor como `throw` de uma destas classes — nunca
como `T | IError` (v0.7).

`attempts` e `retryable` existem em todo erro para o consumidor distinguir
"falhou de primeira" de "falhou após esgotar as tentativas". Diferente de
`code`/`status`/`payload`/`cause` — fatos fixos no instante do evento —,
estes dois são NÃO-readonly de propósito: descrevem o resultado do
PROCESSO de retry ao redor do erro, que só se conclui depois que o erro já
existe. Quem os popula é o executor de retry (T16), estampando na própria
instância antes do `throw` final — não há reconstrução genérica de uma
subclasse desconhecida, e a identidade do erro (`instanceof`) para quem
captura rio abaixo continua intacta. Erro lançado fora do loop de retry
(ex.: `ZdkConfigError`, que nunca chega a fazer requisição) fica só com o
default seguro: 1 tentativa, não retryable.

## Hierarchy

- [`ZdkErrorOptions`](ZdkErrorOptions.md)

  ↳ **`ZdkHttpErrorOptions`**

  ↳↳ [`ZdkRateLimitErrorOptions`](ZdkRateLimitErrorOptions.md)

## Table of contents

### Properties

- [attempts](ZdkHttpErrorOptions.md#attempts)
- [cause](ZdkHttpErrorOptions.md#cause)
- [payload](ZdkHttpErrorOptions.md#payload)
- [requestId](ZdkHttpErrorOptions.md#requestid)
- [retryable](ZdkHttpErrorOptions.md#retryable)
- [status](ZdkHttpErrorOptions.md#status)

## Properties

### attempts

• `Optional` `Readonly` **attempts**: `number`

#### Inherited from

[ZdkErrorOptions](ZdkErrorOptions.md).[attempts](ZdkErrorOptions.md#attempts)

#### Defined in

[src/core/errors.ts:21](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L21)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Inherited from

[ZdkErrorOptions](ZdkErrorOptions.md).[cause](ZdkErrorOptions.md#cause)

#### Defined in

[src/core/errors.ts:20](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L20)

___

### payload

• `Readonly` **payload**: `unknown`

Corpo de resposta completo, preservando `errorData` não documentado (Q17).

#### Defined in

[src/core/errors.ts:116](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L116)

___

### requestId

• `Optional` `Readonly` **requestId**: `string`

#### Defined in

[src/core/errors.ts:117](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L117)

___

### retryable

• `Optional` `Readonly` **retryable**: `boolean`

#### Inherited from

[ZdkErrorOptions](ZdkErrorOptions.md).[retryable](ZdkErrorOptions.md#retryable)

#### Defined in

[src/core/errors.ts:22](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L22)

___

### status

• `Readonly` **status**: `number`

#### Defined in

[src/core/errors.ts:114](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/core/errors.ts#L114)
