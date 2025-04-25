[ZDK](../README.md) / [lib](../modules/lib.md) / Message

# Class: Message

[lib](../modules/lib.md).Message

## Table of contents

### Constructors

- [constructor](lib.Message.md#constructor)

### Methods

- [get](lib.Message.md#get)
- [list](lib.Message.md#list)
- [send](lib.Message.md#send)

## Constructors

### constructor

• **new Message**(`api`): [`Message`](lib.Message.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`Message`](lib.Message.md)

#### Defined in

[lib/message.ts:15](https://github.com/innovtech-developers/zdk/blob/e93f80c6da43b38f329b603694abcf30af4f5a5d/src/lib/message.ts#L15)

## Methods

### get

▸ **get**(`id`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IMessage`](../interfaces/index.IMessage.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IMessage`](../interfaces/index.IMessage.md)\>

#### Defined in

[lib/message.ts:43](https://github.com/innovtech-developers/zdk/blob/e93f80c6da43b38f329b603694abcf30af4f5a5d/src/lib/message.ts#L43)

___

### list

▸ **list**(`params?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IMessageList`](../interfaces/index.IMessageList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`IParamsMessageList`](../interfaces/index.IParamsMessageList.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IMessageList`](../interfaces/index.IMessageList.md)\>

#### Defined in

[lib/message.ts:17](https://github.com/innovtech-developers/zdk/blob/e93f80c6da43b38f329b603694abcf30af4f5a5d/src/lib/message.ts#L17)

___

### send

▸ **send**(`to`, `data`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`Message`](lib.Message.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | `string` |
| `data` | [`ISendMessage`](../interfaces/index.ISendMessage.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`Message`](lib.Message.md)\>

#### Defined in

[lib/message.ts:57](https://github.com/innovtech-developers/zdk/blob/e93f80c6da43b38f329b603694abcf30af4f5a5d/src/lib/message.ts#L57)

▸ **send**(`to`, `data`, `type`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`Message`](lib.Message.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | `string` |
| `data` | [`ISendMediaMessage`](../interfaces/index.ISendMediaMessage.md) |
| `type` | ``"image"`` \| ``"video"`` \| ``"audio"`` \| ``"voice"`` \| ``"document"`` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`Message`](lib.Message.md)\>

#### Defined in

[lib/message.ts:59](https://github.com/innovtech-developers/zdk/blob/e93f80c6da43b38f329b603694abcf30af4f5a5d/src/lib/message.ts#L59)
