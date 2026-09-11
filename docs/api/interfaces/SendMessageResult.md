[ZDK](../README.md) / SendMessageResult

# Interface: SendMessageResult

Q19 — CONFIRMADO com uma chamada real: `POST /api/send/{to}` embrulha a
resposta em `{ message: Message }` (a v0.7 estava certa; o contrato, que
declara `Message` puro, está errado).

## Table of contents

### Properties

- [message](SendMessageResult.md#message)

## Properties

### message

• `Readonly` **message**: [`Message`](../README.md#message)

#### Defined in

[src/schema/types.ts:89](https://github.com/innovtech-developers/zdk/blob/414d9791c036db3947f156dadff78d717e65face/src/schema/types.ts#L89)
