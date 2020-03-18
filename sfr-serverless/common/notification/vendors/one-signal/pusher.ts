import { IBroadcastNotificationPayload, INotificationPusher } from "../types";
import { IOneSignalClient } from "./client";
import { ICreateNotificationRequest } from "./types";

function filterByUserId(userId: string): object {
  return { field: "tag", key: "userId", relation: "=", value: userId };
}

function filterByEmail(email: string): object {
  return { field: "email", value: email };
}

export function OneSignalPusher(client: IOneSignalClient): INotificationPusher {

  function sendToUser(userId: string, payload: ICreateNotificationRequest): Promise<any> {

    return client.createNotification({
      ...payload,
      filters: [
        filterByUserId(userId),
      ]
    });
  }

  function broadcast(payload: IBroadcastNotificationPayload): Promise<any> {
    const payloadPush: any = payload;
    const data = payload.data;
    if (data.tags && data.tags.length > 0) {
      const tagFirstItem = data.tags[0];
      payloadPush.filters = [{ field: "tag", key: tagFirstItem.key, relation: "=", value: tagFirstItem.value }];
      data.tags.shift();
      data.tags.forEach((e) => {
        payloadPush.filters.push({ operator: "OR" });
        payloadPush.filters.push({ field: "tag", key: e.key, relation: "=", value: e.value });
      });
    } else {
      const groups = data.groups ? data.groups : ["All"];
      payloadPush.included_segments = groups;
    }
    console.log(payloadPush);

    return client.createNotification(payloadPush);

  }

  function sendToUsers(userIds: string[], payload: ICreateNotificationRequest): Promise<any> {

    const filters = [];
    const limit = 100;

    function filterFunc(start: number) {
      const result = [filterByUserId(userIds[start])];
      const end = Math.min(userIds.length, start + limit);

      for (let i = start + 1; i < end; i++) {
        result.push({ operator: "OR" });
        result.push(filterByUserId(userIds[i]));
      }

      return result;
    }

    const max = userIds.length % limit > 0
      ? Math.floor(userIds.length / limit) + 1 : userIds.length / limit;

    for (let j = 0; j < max; j++) {
      filters.push(filterFunc(j * limit));
    }

    return Promise.all(
      filters.map((f) => client.createNotification({
        ...payload,
        filters: f
      }))
    );

  }

  function sendToEmailUsers(emailUsers: string[], payload: ICreateNotificationRequest): Promise<any> {

    const filters = [];
    const limit = 100;

    function filterFunc(start: number) {
      const result = [filterByEmail(emailUsers[start])];
      const end = Math.min(emailUsers.length, start + limit);

      for (let i = start + 1; i < end; i++) {
        result.push({ operator: "OR" });
        if (parseInt(emailUsers[i], 0)) {
          result.push(filterByUserId(emailUsers[i]));
        } else {
          result.push(filterByEmail(emailUsers[i]));
        }
      }

      return result;
    }

    const max = emailUsers.length % limit > 0
      ? Math.floor(emailUsers.length / limit) + 1 : emailUsers.length / limit;

    for (let j = 0; j < max; j++) {
      filters.push(filterFunc(j * limit));
    }

    return Promise.all(
      filters.map((f) => client.createNotification({
        ...payload,
        filters: f
      }))
    );

  }

  return {
    sendToUser,
    sendToUsers,
    sendToEmailUsers,
    broadcast,
  };
}
