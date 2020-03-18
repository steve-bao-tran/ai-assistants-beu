import axios, { AxiosRequestConfig } from "axios";
import {
  ICreateNotificationRequest,
  ICreateNotificationResults
} from "../types";

export function createNotification(
  data: ICreateNotificationRequest,
  options: AxiosRequestConfig): Promise<ICreateNotificationResults> {

  return axios.post("/api/v1/notifications", data, options)
    .then((res) => res.data).catch((error) => Promise.reject(error));
}
