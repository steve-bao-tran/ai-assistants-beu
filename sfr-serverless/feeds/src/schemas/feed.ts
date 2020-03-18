import * as Joi from "joi";
import { FileSchema } from "../../../common";

export const ExternalLinkDataSchema = Joi.object({
  link: Joi.string().allow(""),
  description: Joi.string().allow(""),
  title: Joi.string().allow(""),
  thumbnailUrl: Joi.string().allow("")
});

export const FeedCreateSchema = Joi.object({
  attachments: Joi.array().items(FileSchema),
  title: Joi.string().allow("").optional(),
  tagFriendIds: Joi.array().items(Joi.string()),
  externalLinkData: ExternalLinkDataSchema
});

export const FeedUpdateSchemaForUserSide = Joi.object({
  attachments: Joi.array().items(FileSchema),
  title: Joi.string().allow("").optional(),
  tagFriendIds: Joi.array().items(Joi.string()),
  externalLinkData: ExternalLinkDataSchema
});

export const RepostSchema = Joi.object({
  title: Joi.string().allow("").optional(),
  tagFriendIds: Joi.array().items(Joi.string())
});
