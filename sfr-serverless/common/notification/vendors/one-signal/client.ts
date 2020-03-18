import { createNotification } from "./api";
import {
  ICreateNotificationRequest,
  ICreateNotificationResults
} from "./types";

export interface IOneSignalClient {
  createNotification: (data: ICreateNotificationRequest) => Promise<ICreateNotificationResults>;
}

export interface IOneSignalClientOptions {
  app_id: string;
  api_key: string;
}

export function OneSignalClient(options: IOneSignalClientOptions): IOneSignalClient {

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Basic ${options.api_key}`
  };
  const requestOptions = {
    headers,
    baseURL: "https://onesignal.com",
    port: 443,
  };

  return {
    createNotification: (data) => createNotification(
      { ...data, app_id: options.app_id }, requestOptions
    ),
  };
}
