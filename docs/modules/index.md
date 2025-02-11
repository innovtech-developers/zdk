[ZDK](../README.md) / index

# Module: index

## Table of contents

### Classes

- [ZappyApi](../classes/index.ZappyApi.md)
- [Zdk](../classes/index.Zdk.md)

### Interfaces

- [IConnection](../interfaces/index.IConnection.md)
- [IConnectionList](../interfaces/index.IConnectionList.md)
- [IContact](../interfaces/index.IContact.md)
- [IContactExtraInfo](../interfaces/index.IContactExtraInfo.md)
- [IContactList](../interfaces/index.IContactList.md)
- [IContactPostData](../interfaces/index.IContactPostData.md)
- [IError](../interfaces/index.IError.md)
- [IMessage](../interfaces/index.IMessage.md)
- [IMessageList](../interfaces/index.IMessageList.md)
- [IMessageObject](../interfaces/index.IMessageObject.md)
- [IPagination](../interfaces/index.IPagination.md)
- [IParamsList](../interfaces/index.IParamsList.md)
- [IParamsMessageList](../interfaces/index.IParamsMessageList.md)
- [IQueue](../interfaces/index.IQueue.md)
- [IQueueList](../interfaces/index.IQueueList.md)
- [ISendMediaMessage](../interfaces/index.ISendMediaMessage.md)
- [ISendMessage](../interfaces/index.ISendMessage.md)
- [ITag](../interfaces/index.ITag.md)
- [ITagList](../interfaces/index.ITagList.md)
- [ITicket](../interfaces/index.ITicket.md)
- [ITicketList](../interfaces/index.ITicketList.md)
- [ITicketResolveForm](../interfaces/index.ITicketResolveForm.md)
- [ITicketTransferForm](../interfaces/index.ITicketTransferForm.md)
- [ITicketUpdateForm](../interfaces/index.ITicketUpdateForm.md)
- [IUser](../interfaces/index.IUser.md)
- [IUserList](../interfaces/index.IUserList.md)
- [IZdkOptions](../interfaces/index.IZdkOptions.md)
- [SendMediaMessageJson](../interfaces/index.SendMediaMessageJson.md)

### Type Aliases

- [ConnectionStatus](index.md#connectionstatus)
- [FeedbackOption](index.md#feedbackoption)
- [HttpMethod](index.md#httpmethod)
- [MediaType](index.md#mediatype)
- [TicketStatus](index.md#ticketstatus)
- [TicketStrategy](index.md#ticketstrategy)

## Type Aliases

### ConnectionStatus

Ƭ **ConnectionStatus**: ``"CONNECTED"`` \| ``"DISCONNECTED"`` \| ``"TIMEOUT"``

#### Defined in

[types.ts:7](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/types.ts#L7)

___

### FeedbackOption

Ƭ **FeedbackOption**: ``"none"`` \| ``"feedback"`` \| ``"send-end-message"``

#### Defined in

[types.ts:13](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/types.ts#L13)

___

### HttpMethod

Ƭ **HttpMethod**: ``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"PATCH"`` \| ``"DELETE"``

#### Defined in

[types.ts:5](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/types.ts#L5)

___

### MediaType

Ƭ **MediaType**: ``"text"`` \| ``"image"`` \| ``"video"`` \| ``"audio"`` \| ``"voice"`` \| ``"document"``

#### Defined in

[types.ts:15](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/types.ts#L15)

___

### TicketStatus

Ƭ **TicketStatus**: ``"pending"`` \| ``"open"`` \| ``"closed"``

#### Defined in

[types.ts:11](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/types.ts#L11)

___

### TicketStrategy

Ƭ **TicketStrategy**: ``"create"`` \| ``"nocreate"`` \| ``"close"``

#### Defined in

[types.ts:9](https://github.com/innovtech-developers/zdk/blob/6a76e78c508b6f3ff70b928b5924e5ccba332fad/src/types.ts#L9)
