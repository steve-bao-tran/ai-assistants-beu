import * as Joi from "joi";
export const HeaderAuthorizationSchema = Joi.object({
  authorization: Joi.string().required()
});
