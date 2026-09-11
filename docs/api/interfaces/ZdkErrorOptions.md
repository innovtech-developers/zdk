[ZDK](../README.md) / ZdkErrorOptions

# Interface: ZdkErrorOptions

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

- **`ZdkErrorOptions`**

  ↳ [`ZdkNetworkErrorOptions`](ZdkNetworkErrorOptions.md)

  ↳ [`ZdkHttpErrorOptions`](ZdkHttpErrorOptions.md)

## Table of contents

### Properties

- [attempts](ZdkErrorOptions.md#attempts)
- [cause](ZdkErrorOptions.md#cause)
- [retryable](ZdkErrorOptions.md#retryable)

## Properties

### attempts

• `Optional` `Readonly` **attempts**: `number`

#### Defined in

[src/core/errors.ts:21](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L21)

___

### cause

• `Optional` `Readonly` **cause**: `unknown`

#### Defined in

[src/core/errors.ts:20](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L20)

___

### retryable

• `Optional` `Readonly` **retryable**: `boolean`

#### Defined in

[src/core/errors.ts:22](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/errors.ts#L22)
