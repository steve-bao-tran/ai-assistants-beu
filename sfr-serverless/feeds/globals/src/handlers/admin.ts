import { Response, Router } from "express";
import {
  filterPagination, pushNotificationBroadcast, responseError,
  validateBody, IBroadcastNotificationInput, IRequest,
  Notification, NotificationUser, ReferenceType, Role, User
} from "../../../common";
import { IFormPushNotification, PushNotificationSchema } from "../schemas/notification";
import { serializeNotificationItemAdmin } from "../serializers/notification";

function adminRouter(route: Router) {
  route.route("/notifications")
    .post(validateBody(PushNotificationSchema), pushBroadcast)
    .get(listBroadcast);
}

async function pushBroadcast(req: IRequest, res: Response) {
  try {
    const form: IFormPushNotification = req.body;
    const currentUserId = req.context.currentUser._id;
    const keyBroadcast = "role";
    const dataPush: IBroadcastNotificationInput = {
      title: form.title,
      content: form.content,
      tags: form.type.map((e) => ({ key: keyBroadcast, value: e })),
      senderId: currentUserId,
      type: ReferenceType.Broadcast,
      expiryDate: form.expiryDate
    };

    await pushNotificationBroadcast(null, dataPush, {
      actorId: req.context.currentUser._id
    });

    return res.json({
      message: "Push broadcast notification successfully"
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function listBroadcast(req: IRequest, res: Response) {
  try {
    const notificationUser = await filterPagination(NotificationUser, {
      $or: [
        { typeRole: { $all: [Role.Fan] } },
        { typeRole: { $all: [Role.Musician] } }
      ]
    }, {
      ...req.query,
      sort: { createdAt: -1 }
    });

    if (notificationUser.data.length > 0) {
      let notifications = await Notification.find({ _id: { $in: notificationUser.data.map((e) => e.notificationId) } });
      const users = await User.find({ _id: { $in: notifications.map((e) => e.senderId) } });
      notifications = notifications.map((e) => ({
        ...e.toJSON(),
        sender: users.find((u) => u._id.toString() === e.senderId.toString()).toJSON()
      }));
      notificationUser.data = <any> notificationUser.data.map((e) => ({
        ...e.toJSON(),
        notification: notifications.find((n) => n._id.toString() === e.notificationId.toString())
      })).map(serializeNotificationItemAdmin);
    }

    return res.json(notificationUser);

  } catch (error) {
    return responseError(req, res, error);
  }
}

export { adminRouter };
