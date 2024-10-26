[ZDK](../README.md) / [lib](../modules/lib.md) / Queue

# Class: Queue

[lib](../modules/lib.md).Queue

## Table of contents

### Constructors

- [constructor](lib.Queue.md#constructor)

### Methods

- [get](lib.Queue.md#get)
- [list](lib.Queue.md#list)

## Constructors

### constructor

• **new Queue**(`api`): [`Queue`](lib.Queue.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`Queue`](lib.Queue.md)

#### Defined in

lib/queue.ts:5

## Methods

### get

▸ **get**(`id`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IQueue`](../interfaces/index.IQueue.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IQueue`](../interfaces/index.IQueue.md)\>

#### Defined in

lib/queue.ts:26

___

### list

▸ **list**(`params?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IQueueList`](../interfaces/index.IQueueList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`IParamsList`](../interfaces/index.IParamsList.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IQueueList`](../interfaces/index.IQueueList.md)\>

#### Defined in

lib/queue.ts:7
