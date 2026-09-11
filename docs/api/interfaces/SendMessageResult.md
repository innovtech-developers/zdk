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

[src/schema/types.ts:89](https://github.com/innovtech-developers/zdk/blob/32d708594b3d28018e75b42a85a514889f23bb56/src/schema/types.ts#L89)
