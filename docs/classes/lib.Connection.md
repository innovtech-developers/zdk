[ZDK](../README.md) / [lib](../modules/lib.md) / Connection

# Class: Connection

[lib](../modules/lib.md).Connection

## Table of contents

### Constructors

- [constructor](lib.Connection.md#constructor)

### Methods

- [get](lib.Connection.md#get)
- [list](lib.Connection.md#list)

## Constructors

### constructor

• **new Connection**(`api`): [`Connection`](lib.Connection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`Connection`](lib.Connection.md)

#### Defined in

[lib/connection.ts:5](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/connection.ts#L5)

## Methods

### get

▸ **get**(`id?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IConnection`](../interfaces/index.IConnection.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id?` | `number` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IConnection`](../interfaces/index.IConnection.md)\>

#### Defined in

[lib/connection.ts:19](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/connection.ts#L19)

___

### list

▸ **list**(): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IConnectionList`](../interfaces/index.IConnectionList.md)\>

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IConnectionList`](../interfaces/index.IConnectionList.md)\>

#### Defined in

[lib/connection.ts:7](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/connection.ts#L7)
