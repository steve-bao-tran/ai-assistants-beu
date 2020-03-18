import * as Joi from "joi";
import { Gender, Provider, Role } from "../../../common";

export const UpdateUserSchema = Joi.object({
  username: Joi.string().regex(/^[a-z0-9_.]*$/).max(40),
  email: Joi.string().email(),
  role: Joi.string().valid([Role.Fan, Role.Musician]),
  country: Joi.string(),
  avatar: Joi.string().allow(""),
  cover: Joi.string().allow(""),
  firstName: Joi.string().allow(""),
  lastName: Joi.string().allow(""),
  displayName: Joi.string().allow("").max(30),
  bio: Joi.string().allow(""),
  gender: Joi.string().valid([Gender.Female, Gender.Male]).allow(""),
  birthday: Joi.date().allow(""),
  city: Joi.string().allow(""),
  profession: Joi.array().items(Joi.string()),
  webpage: Joi.string().allow(""),
  phone: Joi.object({
    phoneNumber: Joi.number().allow(""),
    phoneCode: Joi.string().allow("")
  }),
  provider: Joi.string().valid([Provider.Email, Provider.Facebook, Provider.Google]).optional()
});

export const AllowForPasswordSchema = Joi.object({
  email: Joi.string().required()
});
