[ZDK](../README.md) / [lib](../modules/lib.md) / Ticket

# Class: Ticket

[lib](../modules/lib.md).Ticket

## Table of contents

### Constructors

- [constructor](lib.Ticket.md#constructor)

### Methods

- [get](lib.Ticket.md#get)
- [list](lib.Ticket.md#list)
- [resolve](lib.Ticket.md#resolve)
- [transfer](lib.Ticket.md#transfer)
- [update](lib.Ticket.md#update)

## Constructors

### constructor

• **new Ticket**(`api`): [`Ticket`](lib.Ticket.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `api` | [`ZappyApi`](index.ZappyApi.md) |

#### Returns

[`Ticket`](lib.Ticket.md)

#### Defined in

lib/ticket.ts:13

## Methods

### get

▸ **get**(`id`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Defined in

lib/ticket.ts:34

___

### list

▸ **list**(`params?`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicketList`](../interfaces/index.ITicketList.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`IParamsList`](../interfaces/index.IParamsList.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicketList`](../interfaces/index.ITicketList.md)\>

#### Defined in

lib/ticket.ts:15

___

### resolve

▸ **resolve**(`id`, `data`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `data` | [`ITicketResolveForm`](../interfaces/index.ITicketResolveForm.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Defined in

lib/ticket.ts:69

___

### transfer

▸ **transfer**(`id`, `data`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `data` | [`ITicketTransferForm`](../interfaces/index.ITicketTransferForm.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Defined in

lib/ticket.ts:48

___

### update

▸ **update**(`id`, `data`): `Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `data` | [`ITicketUpdateForm`](../interfaces/index.ITicketUpdateForm.md) |

#### Returns

`Promise`\<[`IError`](../interfaces/index.IError.md) \| [`ITicket`](../interfaces/index.ITicket.md)\>

#### Defined in

lib/ticket.ts:90
