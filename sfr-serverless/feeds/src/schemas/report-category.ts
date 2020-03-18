import * as Joi from "joi";
import { StatusSchema } from "../../../common";

export const ReportCategoryCreateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
});

export const ReportCategoryUpdateSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().optional(),
  status: StatusSchema
});
