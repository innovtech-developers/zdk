[ZDK](../README.md) / [lib](../modules/lib.md) / Tag

# Class: Tag

[lib](../modules/lib.md).Tag

## Table of contents

### Constructors

- [constructor](lib.Tag.md#constructor)

### Methods

- [get](lib.Tag.md#get)
- [list](lib.Tag.md#list)

## Constructors

### constructor

• **new Tag**(`api`): [`Tag`](lib.Tag.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`Tag`](lib.Tag.md)

#### Defined in

[lib/tag.ts:5](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/lib/tag.ts#L5)

## Methods

### get

▸ **get**(`id`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITag`](../interfaces/index.ITag.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITag`](../interfaces/index.ITag.md)\>

#### Defined in

[lib/tag.ts:26](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/lib/tag.ts#L26)

___

### list

▸ **list**(`params?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITagList`](../interfaces/index.ITagList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`IParamsList`](../interfaces/index.IParamsList.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITagList`](../interfaces/index.ITagList.md)\>

#### Defined in

[lib/tag.ts:7](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/lib/tag.ts#L7)
