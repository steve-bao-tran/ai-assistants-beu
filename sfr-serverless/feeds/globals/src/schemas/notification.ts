import * as BaseJoi from "joi";
import * as JoiDateExtension from "joi-date-extensions";
import { DEFAULT_DATE_FORMAT, Role } from "../../../common";
const Joi = BaseJoi.extend(JoiDateExtension);

export const PushNotificationSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  type: Joi.array().items(
    Joi.string().required().valid([Role.Fan, Role.Musician])
  ).min(1).required(),
  expiryDate: Joi.date().format(DEFAULT_DATE_FORMAT)
});

export interface IFormPushNotification {
  title: string;
  content: string;
  type: string[];
  expiryDate: Date;
}
