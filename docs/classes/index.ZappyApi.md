[ZDK](../README.md) / [index](../modules/index.md) / ZappyApi

# Class: ZappyApi

[index](../modules/index.md).ZappyApi

## Hierarchy

- **`ZappyApi`**

  ↳ [`Zdk`](index.Zdk.md)

## Table of contents

### Constructors

- [constructor](index.ZappyApi.md#constructor)

### Methods

- [makeRequest](index.ZappyApi.md#makerequest)

## Constructors

### constructor

• **new ZappyApi**(`rootUrl?`, `token?`): [`ZappyApi`](index.ZappyApi.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rootUrl?` | `string` |
| `token?` | `string` |

#### Returns

[`ZappyApi`](index.ZappyApi.md)

#### Defined in

zappy-api.ts:7

## Methods

### makeRequest

▸ **makeRequest**(`method`, `endpoint`, `body?`, `contentType?`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | [`HttpMethod`](../modules/index.md#httpmethod) |
| `endpoint` | `string` |
| `body?` | `any` |
| `contentType?` | `string` |

#### Returns

`Promise`\<`any`\>

#### Defined in

zappy-api.ts:12
