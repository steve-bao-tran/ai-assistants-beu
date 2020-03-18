import {
  serializeSimpleUser, IFile, INotification,
  IPost, ISimpleUserResponse, ReferenceType
} from "../../../common";

export interface INotificationItemResponse {
  id: string;
  type: ReferenceType;
  title: string;
  content: string;
  referenceId: string;
  reference: any;
  createdAt: Date;
  sender: ISimpleUserResponse;
  metadata: object;
}
export interface INotificationFeedResponse {
  attachments: IFile[];
  title: string;
}

export function serializerNotificationFeed(model: IPost): INotificationFeedResponse {
  if (!model) { return null; }

  return {
    attachments: model.attachments,
    title: model.title
  };
}

export function serializerNotificationItem(model: INotification): INotificationItemResponse {
  return {
    id: model._id,
    type: model.type,
    sender: serializeSimpleUser(model.sender),
    reference: model.reference,
    createdAt: model.createdAt,
    title: model.title,
    referenceId: model.referenceId,
    metadata: model.metadata,
    content: model.content,
  };
}
