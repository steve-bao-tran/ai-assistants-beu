import * as Joi from "joi";
import { FileTypes } from "../models";

export const FileSchema = Joi.object({
  fileName: Joi.string().required(),
  fileType: Joi.string().valid([FileTypes.Audio, FileTypes.Photo, FileTypes.Video]).required(),
  fileSize: Joi.number().optional(),
  fileUrl: Joi.string().required(),
  thumbnailUrl: Joi.string(),
  metadata: Joi.object()
});
