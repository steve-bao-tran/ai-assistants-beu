import * as Joi from "joi";

export const CommentCreate = Joi.object({
  parentId: Joi.string(),
  content: Joi.string().required()
});

export const CommentUpdate = Joi.object({
  parentId: Joi.string(),
  content: Joi.string().required()
});
