import * as Joi from "joi";

export const InsertSettingSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required()
});
