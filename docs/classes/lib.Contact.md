[ZDK](../README.md) / [lib](../modules/lib.md) / Contact

# Class: Contact

[lib](../modules/lib.md).Contact

## Table of contents

### Constructors

- [constructor](lib.Contact.md#constructor)

### Methods

- [get](lib.Contact.md#get)
- [list](lib.Contact.md#list)

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

lib/contact.ts:5

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

lib/contact.ts:26

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

lib/contact.ts:7
