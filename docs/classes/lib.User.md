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

[lib/user.ts:5](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/lib/user.ts#L5)

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

[lib/user.ts:26](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/lib/user.ts#L26)

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

[lib/user.ts:7](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/lib/user.ts#L7)
