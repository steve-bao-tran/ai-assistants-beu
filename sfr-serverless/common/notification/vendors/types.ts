import { ReferenceType } from "../models/notification";

export interface IPushNotificationParams {

  contents: { [key: string]: string };
  headings?: { [key: string]: string };
  subtitle?: { [key: string]: string };
  data?: any;
  url?: string;
  templateId?: string;
}

export interface INotificationInput {

  title: string;
  content: string;
  senderId: string;

  type: ReferenceType;
  referenceId: string;
  referenceUrl?: string;
  receiverIds: string[];
}

export interface INotificationInput {

  title: string;
  content: string;
  senderId: string;

  type: ReferenceType;
  referenceId: string;
  referenceUrl?: string;
  receiverIds: string[];
}

export interface IBroadcastNotificationInput {
  title: string;
  content: string;
  type: ReferenceType;
  senderId: string;
  expiryDate: Date;

  groups?: string[];
  tags?: ITagBroadcastNotification[];
}

export interface ITagBroadcastNotification {
  key: string;
  value: string;
}

export interface IBroadcastNotificationPayload extends IPushNotificationParams {
  groups?: string[];
  tags?: ITagBroadcastNotification[];
}

export interface INotificationPusher {
  sendToUser(userId: string, payload: IPushNotificationParams): Promise<any>;
  sendToUsers(userIds: string[], payload: IPushNotificationParams): Promise<any>;
  sendToEmailUsers(emailUsers: string[], payload: IPushNotificationParams): Promise<any>;
  broadcast(payload: IBroadcastNotificationPayload): Promise<any>;
}
