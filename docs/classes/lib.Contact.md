[ZDK](../README.md) / [lib](../modules/lib.md) / Contact

# Class: Contact

[lib](../modules/lib.md).Contact

## Table of contents

### Constructors

- [constructor](lib.Contact.md#constructor)

### Methods

- [get](lib.Contact.md#get)
- [list](lib.Contact.md#list)
- [update](lib.Contact.md#update)

## Constructors

### constructor

• **new Contact**(`api`): [`Contact`](lib.Contact.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`Contact`](lib.Contact.md)

#### Defined in

[lib/contact.ts:11](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/contact.ts#L11)

## Methods

### get

▸ **get**(`id`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IContact`](../interfaces/index.IContact.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IContact`](../interfaces/index.IContact.md)\>

#### Defined in

[lib/contact.ts:32](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/contact.ts#L32)

___

### list

▸ **list**(`params?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IContactList`](../interfaces/index.IContactList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`IParamsList`](../interfaces/index.IParamsList.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IContactList`](../interfaces/index.IContactList.md)\>

#### Defined in

[lib/contact.ts:13](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/contact.ts#L13)

___

### update

▸ **update**(`id`, `data`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IContact`](../interfaces/index.IContact.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `data` | [`IContactPostData`](../interfaces/index.IContactPostData.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`IContact`](../interfaces/index.IContact.md)\>

#### Defined in

[lib/contact.ts:46](https://github.com/innovtech-developers/zdk/blob/7db792f8d0888698b5c087a743b692e20fed3a78/src/lib/contact.ts#L46)
