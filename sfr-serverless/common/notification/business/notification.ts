import { omit } from "lodash";
import * as moment from "moment";
import { skipValueObject, DEFAULT_DATE_FORMAT } from "../../helpers";
import { getNameUser, IOptions, User } from "../../models";
import { filterUserBlock } from "../../user";
import { Notification, NotificationUser } from "../models";
import {
  validateNotificationForm, IBroadcastNotificationInput,
  INotificationInput, INotificationPusher
} from "../vendors";
import { OneSignalClient, OneSignalPusher } from "../vendors/one-signal";
import { createManyNotificationUsers } from "./notification-user";

let _pusher: INotificationPusher;

export function notificationPusher(appId?: string, apiKey?: string): INotificationPusher {
  if (_pusher) {
    return _pusher;
  }

  appId = appId || process.env.ONE_SIGNAL_APP_ID;
  apiKey = apiKey || process.env.ONE_SIGNAL_API_KEY;

  _pusher = OneSignalPusher(
    OneSignalClient({
      app_id: appId,
      api_key: apiKey,
    })
  );

  return _pusher;
}

export async function createNotification(
  input: INotificationInput, options?: IOptions): Promise<Notification> {
  const opts = { ...options };

  const model = await Notification.create({
    senderId: opts.actorId,
    createdBy: opts.actorId || input.senderId,
    updatedBy: opts.actorId || input.senderId,
    ...omit(input, ["receiverIds"]),
  });
  const receivers = await createManyNotificationUsers(model.id, input.receiverIds, options);

  return <any> {
    ...model,
    receivers,
  };
}

export interface IOptionCreateAndPushNotification extends IOptions {
  formatParams?: (params: INotificationInput) => INotificationInput;
}

export async function createAndPushNotification(
  pusher: INotificationPusher, input: INotificationInput,
  options: IOptionCreateAndPushNotification): Promise<Notification> {
  pusher = pusher || notificationPusher();

  input.content = input.content || input.title;
  const model = await createNotification(input, options);
  const payload = validateNotificationForm(input, {
    formatParams: options.formatParams
  });
  await pusher.sendToUsers(input.receiverIds, payload);

  return model;
}

export async function createAndPushNotificationWithFormat(
  pusher: INotificationPusher, input: INotificationInput,
  options: IOptions): Promise<Notification> {
  try {
    pusher = pusher || notificationPusher();

    const receiverIds = input.receiverIds
      .filter((e) => e.toString() !== options.actorId.toString());
    input.receiverIds = await filterUserBlock(options.actorId, receiverIds);
    if (receiverIds.length === 0) {
      return null;
    }

    const user = await User.findById(options.actorId);
    const model = await createNotification(input, options);
    const payload = validateNotificationForm(input, {
      formatParams: (params) => {
        const text = `${getNameUser(user)} ${params.title}`;
        params.title = process.env.APP_NAME;
        params.content = text;

        return params;
      }
    });
    await pusher.sendToUsers(input.receiverIds, payload);

    return model;
  } catch (error) {
    console.log("Error string: ", {
      error
    });

    return null;
  }

}

export async function pushNotificationBroadcast(
  pusher: INotificationPusher, input: IBroadcastNotificationInput, options: IOptions) {
  pusher = pusher || notificationPusher();
  try {
    const user = await User.findById(options.actorId);
    const notification = await Notification.create(skipValueObject({
      content: input.title,
      senderId: input.senderId,
      metadata: {
        url: input.content
      },
      type: input.type,
      expiryDate: moment(input.expiryDate).format(DEFAULT_DATE_FORMAT)
    }));
    await NotificationUser.create({
      notificationId: notification._id,
      userId: null,
      isRead: false,
      typeRole: input.tags.map((e) => e.value)
    });

    const payload = validateNotificationForm(<any> {
      ...input,
      url: input.content
    }, {
      formatParams:
          (params) => {
            params.content = params.title;
            params.title = getNameUser(user);

            return params;
          }
    });

    await pusher.broadcast(payload);

    return null;
  } catch (error) {
    console.log("Error string: ", {
      error
    });

    return null;
  }

}
