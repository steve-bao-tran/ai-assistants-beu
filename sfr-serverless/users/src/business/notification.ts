import {
  parseFollowers, serializeSimpleUser, IOptions,
  IPost, IUser, Notification, Post,
  ReferenceType, StatusCode, User
} from "../../../common";
import { serializerNotificationFeed } from "../serializers";

export async function parseMyNotification(ids: string[], options: IOptions) {
  try {
    const notifications = await Notification.find({ _id: ids }).sort({ createdAt: -1 });
    const senderIds = notifications.map((e) => e.senderId);
    const userIds = notifications
      .filter((e) => e.type === ReferenceType.User)
      .map((e) => e.referenceId)
      .concat(senderIds);
    const feedId = notifications.filter((e) => e.type === ReferenceType.Feed).map((e) => e.referenceId);
    let users: IUser[] = [];
    let feeds: IPost[] = [];
    if (userIds.length > 0) {
      users = await User.find({ _id: userIds });
      users = await parseFollowers(options.actorId, users);
    }
    if (feedId.length > 0) {
      feeds = await Post.find({ _id: feedId, status: StatusCode.Active });
    }

    return notifications.map((e) => {
      e.sender = users.find((u) => u._id.toString() === e.senderId.toString());
      if (e.type === ReferenceType.User && users.length > 0) {
        e.reference = serializeSimpleUser(users.find((u) => u._id.toString() === e.referenceId.toString()));

        return e;
      }
      if (e.type === ReferenceType.Feed && feeds.length > 0) {
        e.reference = serializerNotificationFeed(feeds.find((f) => f._id.toString() === e.referenceId.toString()));

        return e;
      }

      return e;
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
