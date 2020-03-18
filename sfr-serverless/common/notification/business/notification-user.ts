import { IOptions } from "../../models";
import { INotificationUser, NotificationUser } from "../models";

export function createManyNotificationUsers(
  notificationId: number | number, receiverIds: string[], options: IOptions): Promise<INotificationUser[]> {

  return <any> receiverIds.map((userId) => NotificationUser.create({
    notificationId,
    userId,
    isRead: false,
    createdBy: options.actorId
  }));
}

export function markNotificationUserAsRead(userId: number | string): Promise<any> {

  return <any> NotificationUser.update({ isRead: true }, {
    where: { userId }
  });
}

export function countNewNotificationUser(userId: number | string): Promise<number> {

  return <any> NotificationUser.count({
    where: {
      userId,
      isRead: false
    }
  });
}
