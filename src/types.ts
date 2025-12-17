export interface IError {
  error: Record<string, unknown> | string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "TIMEOUT" | "WHATSAPP_AUTH";

export type TicketStrategy = "create" | "nocreate" | "close" | "reuseOrClose";

export type TicketStatus = "pending" | "open" | "closed";

export type FeedbackOption = "none" | "feedback" | "send-end-message";

export type MediaType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "document";

export interface IPagination {
  count: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface IParamsList extends Pick<IPagination, "page" | "pageSize"> {}

export interface IParamsMessageList extends IParamsList {
  ticketId?: string;
  contactId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IConnection {
  id: number;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  name: string;
  platform: string;
  number: string;
  greetingMessage: string;
  endMessage: string;
  feedbackMessage: string;
}

export interface IZdkOptions {
  rootUrl: string;
  token: string;
}

export interface ISendMessage {
  body: string;
  connectionFrom: number;
  ticketStrategy: TicketStrategy;
}

export interface ISendMediaMessage {
  media: unknown;
  caption?: string;
  connectionFrom: number;
}

export interface SendMediaMessageJson {
  url: string;
  caption?: string;
  connectionFrom: string;
}

export interface IMessage {
  id: number;
  body: string;
  type: string;
  subtype: string;
  isMedia: string;
  myContact: string;
  from: string;
  contactId: number;
  ticketId: number;
}

export interface IContact {
  id: number;
  name: string;
  number: string;
  email: string;
  profilePicUrl: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  blocked: boolean;
  userId: number;
  queueId: number;
  tags: ITag[];
  extraInfo: IContactExtraInfo[];
}

export interface IContactExtraInfo {
  name: string;
  value: string;
}

export interface IContactPostData {
  name: string;
  number: string;
  email: string;
  profilePicUrl: string;
  isGroup: boolean;
  blocked: boolean;
  userId: number;
  queueId: number;
  createdAt: string;
  updatedAt: string;
  tagsIds: number[];
  extraInfo: IContactExtraInfo[];
  noCheckNumber: boolean;
}

export interface ITag {
  id: string;
  name: string;
  color: string;
}

export interface ITicket {
  id: string;
  status: string;
  userId: string;
  contactId: string;
  whatsappId: string;
  queueId: string;
  unreadMessages: number;
  lastMessage: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  status: string;
  profile: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IQueue {
  id: string;
  name: string;
  color: string;
}

export interface IMessageObject {
  id: string;
  createdAt: string;
  updatedAt: string;
  body: string;
  mediaUrl: string;
  mediaType: string;
  isDeleted: boolean;
  quotedMsgId: string;
  ticketId: string;
  contactId: string;
  fromMe: boolean;
  ack: string;
  read: boolean;
  locationLatitude: string;
  locationLongitude: string;
  editedFromId: string;
  editedToId: string;
  error: string;
}

export interface IContactList extends IPagination {
  contacts: IContact[];
}

export interface IQueueList extends IPagination {
  queues: IQueue[];
}

export interface ITicketList extends IPagination {
  tickets: ITicket[];
}

export interface ITagList extends IPagination {
  tags: ITag[];
}

export interface IMessageList extends IPagination {
  messages: IMessageObject[];
}

export interface IUserList extends IPagination {
  users: IUser[];
}

export interface IConnectionList {
  connections: IConnection[];
}

export interface ITicketUpdateForm {
  status?: TicketStatus;
  userId?: number;
  queueId?: number;
}

export interface ITicketTransferForm {
  queueId?: number;
  userId?: number;
  connectionId?: number;
}

export interface ITicketResolveForm {
  feedbackOption: FeedbackOption;
}
