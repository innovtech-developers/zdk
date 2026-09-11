[ZDK](../README.md) / RateLimitOptions

# Interface: RateLimitOptions

## Table of contents

### Properties

- [mode](RateLimitOptions.md#mode)
- [reserve](RateLimitOptions.md#reserve)

## Properties

### mode

• `Optional` `Readonly` **mode**: ``"observe"`` \| ``"throttle"``

`"observe"` (default): nunca dorme sozinho — só expõe o snapshot via
`onRateLimit`. Latência escondida em SDK é pior que erro visível.
`"throttle"`: pausa PROATIVAMENTE, antes da próxima chamada, quando o
orçamento observado da chamada anterior já está no ou abaixo de
`reserve` — para job em lote, onde esperar é melhor que tomar `429`.

#### Defined in

[src/core/api-client.ts:47](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/api-client.ts#L47)

___

### reserve

• `Optional` `Readonly` **reserve**: `number`

Em modo `throttle`: pausa quando `remaining <= reserve`.

**`Default`**

```ts
0
```

#### Defined in

[src/core/api-client.ts:49](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/core/api-client.ts#L49)
