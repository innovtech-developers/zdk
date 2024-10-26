[ZDK](../README.md) / [lib](../modules/lib.md) / User

# Class: User

[lib](../modules/lib.md).User

## Table of contents

### Constructors

- [constructor](lib.User.md#constructor)

### Methods

- [get](lib.User.md#get)
- [list](lib.User.md#list)

## Constructors

### constructor

• **new User**(`api`): [`User`](lib.User.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`User`](lib.User.md)

#### Defined in

lib/user.ts:5

## Methods

### get

▸ **get**(`id`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IUser`](../interfaces/index.IUser.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IUser`](../interfaces/index.IUser.md)\>

#### Defined in

lib/user.ts:26

___

### list

▸ **list**(`params?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IUserList`](../interfaces/index.IUserList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`IParamsList`](../interfaces/index.IParamsList.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IUserList`](../interfaces/index.IUserList.md)\>

#### Defined in

lib/user.ts:7
