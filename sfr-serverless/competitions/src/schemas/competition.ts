import * as Joi from "joi";
import { FileSchema, StatusSchema } from "../../../common";
import { LinkType, PhaseType } from "../models";

const PhaseSchema = Joi.object({
  name: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  type: Joi.string().valid([
    PhaseType.FinalWinner, PhaseType.PrepareWorks, PhaseType.Ranking,
    PhaseType.RegisterUpload, PhaseType.Vote
  ]).required(),
  imageBanner: Joi.string(),
  textBanner: Joi.string()
});

export const CreateCompetitionSchema = Joi.object({
  title: Joi.string().required(),
  rule: Joi.string().required(),
  howItWork: Joi.string().required(),
  faq: Joi.string().required(),
  phases: Joi.array().items(PhaseSchema).required(),
  imageUrl: Joi.string()
});

export const UpdateCompetitionSchema = Joi.object({
  title: Joi.string(),
  rule: Joi.string(),
  howItWork: Joi.string(),
  faq: Joi.string(),
  phases: Joi.array().items(PhaseSchema),
  status: StatusSchema,
  imageUrl: Joi.string()
});

export const PhoneSchema = Joi.object({
  phoneNumber: Joi.number().allow(""),
  phoneCode: Joi.string().allow("")
});

export const LinkSchema = Joi.object({
  type: Joi.string().valid([LinkType.Facebook, LinkType.Instagram, LinkType.YouTube]),
  link: Joi.string().required()
});

export const JoinCompetitionSchema = Joi.object({
  bandName: Joi.string(),
  bio: Joi.string(),
  phone: PhoneSchema,
  birthday: Joi.date(),
  parentEmail: Joi.string(),
  phoneOfParent: PhoneSchema,
  relationship: Joi.string(),

  country: Joi.string(),
  city: Joi.string(),
  school: Joi.string(),

  language: Joi.string(),
  genre: Joi.string(),
  subGenre: Joi.string(),
  moreInfo: Joi.string(),
  links: Joi.array().items(LinkSchema),

  caption: Joi.string(),
  attachments: Joi.array().items(FileSchema)
});
