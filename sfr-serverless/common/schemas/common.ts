import * as Joi from "joi";
import { StatusCode } from "../models";

export const StatusSchema = Joi.string().valid([
  StatusCode.Active, StatusCode.Deleted,
  StatusCode.Suspended
]);
