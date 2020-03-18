import { INotificationUser, Role } from "../../../common";
import { serializerAdminSimpleUser, IAdminSimpleUserResponse } from "../../../users/src/serializers";

export interface INotificationItemAdminResponse {
  id: string;
  content: string;
  sender: IAdminSimpleUserResponse;
  createdAt: Date;
  metadata: object;
  type: Role[];
  expiryDate: Date;
}

export function serializeNotificationItemAdmin(model: INotificationUser): INotificationItemAdminResponse {
  return {
    id: model.notification._id,
    content: model.notification.content,
    sender: serializerAdminSimpleUser(model.notification.sender),
    createdAt: model.createdAt,
    metadata: model.notification.metadata,
    type: model.typeRole,
    expiryDate: model.notification.expiryDate
  };
}
