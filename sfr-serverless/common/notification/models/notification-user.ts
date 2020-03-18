import * as mongoose from "mongoose";
import { IModelBase, Role, UserSchemaName } from "../../models";
import { INotification, NotificationSchemaName } from "./notification";

export interface INotificationUser extends IModelBase {
  notificationId: string;
  userId: string;
  isRead: boolean;
  typeRole: Role[];
  notification: INotification;
}

export const NotificationUserSchemaName = "notification_users";

const NotificationUserSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: NotificationSchemaName
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  },
  isRead: {
    type: Boolean,
    default: false
  },
  typeRole: [String]
}, {
  timestamps: true
});

export const NotificationUser = mongoose.model<INotificationUser>(NotificationUserSchemaName, NotificationUserSchema);
