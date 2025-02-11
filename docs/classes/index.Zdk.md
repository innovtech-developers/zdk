[ZDK](../README.md) / [index](../modules/index.md) / Zdk

# Class: Zdk

[index](../modules/index.md).Zdk

## Hierarchy

- [`ZappyApi`](index.ZappyApi.md)

  ↳ **`Zdk`**

## Table of contents

### Constructors

- [constructor](index.Zdk.md#constructor)

### Properties

- [connections](index.Zdk.md#connections)
- [contacts](index.Zdk.md#contacts)
- [messages](index.Zdk.md#messages)
- [queues](index.Zdk.md#queues)
- [tags](index.Zdk.md#tags)
- [tickets](index.Zdk.md#tickets)
- [users](index.Zdk.md#users)

### Methods

- [makeRequest](index.Zdk.md#makerequest)

## Constructors

### constructor

• **new Zdk**(`rootUrl?`, `token?`): [`Zdk`](index.Zdk.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rootUrl?` | `string` |
| `token?` | `string` |

#### Returns

[`Zdk`](index.Zdk.md)

#### Inherited from

[ZappyApi](index.ZappyApi.md).[constructor](index.ZappyApi.md#constructor)

#### Defined in

[zappy-api.ts:8](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zappy-api.ts#L8)

## Properties

### connections

• `Readonly` **connections**: [`Connection`](lib.Connection.md)

#### Defined in

[zdk.ts:15](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L15)

___

### contacts

• `Readonly` **contacts**: [`Contact`](lib.Contact.md)

#### Defined in

[zdk.ts:17](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L17)

___

### messages

• `Readonly` **messages**: [`Message`](lib.Message.md)

#### Defined in

[zdk.ts:19](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L19)

___

### queues

• `Readonly` **queues**: [`Queue`](lib.Queue.md)

#### Defined in

[zdk.ts:21](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L21)

___

### tags

• `Readonly` **tags**: [`Tag`](lib.Tag.md)

#### Defined in

[zdk.ts:23](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L23)

___

### tickets

• `Readonly` **tickets**: [`Ticket`](lib.Ticket.md)

#### Defined in

[zdk.ts:13](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L13)

___

### users

• `Readonly` **users**: [`User`](lib.User.md)

#### Defined in

[zdk.ts:25](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zdk.ts#L25)

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

#### Inherited from

[ZappyApi](index.ZappyApi.md).[makeRequest](index.ZappyApi.md#makerequest)

#### Defined in

[zappy-api.ts:13](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/zappy-api.ts#L13)
