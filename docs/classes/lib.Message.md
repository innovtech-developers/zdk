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

[lib/message.ts:13](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/message.ts#L13)

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

[lib/message.ts:41](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/message.ts#L41)

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

[lib/message.ts:15](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/message.ts#L15)

___

### send

▸ **send**(`to`, `data`, `type?`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | `string` |
| `data` | [`ISendMessage`](../interfaces/index.ISendMessage.md) |
| `type?` | [`MediaType`](../modules/index.md#mediatype) |

#### Returns

`Promise`\<`any`\>

#### Defined in

[lib/message.ts:55](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/message.ts#L55)
