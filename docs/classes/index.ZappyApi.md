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

[zappy-api.ts:8](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zappy-api.ts#L8)

## Methods

### makeRequest

▸ **makeRequest**(`method`, `endpoint`, `data?`, `customHeaders?`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | [`HttpMethod`](../modules/index.md#httpmethod) |
| `endpoint` | `string` |
| `data?` | `unknown` |
| `customHeaders?` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`any`\>

#### Defined in

[zappy-api.ts:13](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zappy-api.ts#L13)
