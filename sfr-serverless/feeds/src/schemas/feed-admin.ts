import * as Joi from "joi";
import { StatusSchema } from "../../../common";

export const FeedUpdateSchema = Joi.object({
  status: StatusSchema,
  isFeatured: Joi.boolean()
});
