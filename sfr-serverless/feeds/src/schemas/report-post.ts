import * as Joi from "joi";
import { ReportTypes } from "../models";

export const ReportPostCreateSchema = Joi.object({
  comment: Joi.string().trim().optional(),
  type: Joi.string()
    .valid([ReportTypes.Inappropriate, ReportTypes.Others, ReportTypes.Spam])
    .optional()
});
