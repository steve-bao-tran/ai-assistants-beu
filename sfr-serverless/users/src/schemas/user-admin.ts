import * as Joi from "joi";
import { Gender, Permissions, Role } from "../../../common";

export const CreateUserAdminSchema = Joi.object({
  username: Joi.string().required().regex(/^[a-z0-9_.]*$/).max(40),
  email: Joi.string().email().required(),
  role: Joi.string().valid([Role.Fan, Role.Musician]).allow(""),
  country: Joi.string().required(),
  avatar: Joi.string().allow(""),
  cover: Joi.string().allow(""),
  firstName: Joi.string().allow(""),
  lastName: Joi.string().allow(""),
  displayName: Joi.string().allow(""),
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
  permissions: Joi.array().items(Joi.string().valid([
    Permissions.Admin, Permissions.User
  ])),
  password: Joi.string().required().min(6),
  isVerified: Joi.boolean(),
  emailVerified: Joi.boolean()
});

export const UpdateUserAdminSchema = Joi.object({
  username: Joi.string().regex(/^[a-z0-9_.]*$/).max(40),
  email: Joi.string().email(),
  role: Joi.string().valid([Role.Fan, Role.Musician]).allow(""),
  country: Joi.string().allow(""),
  avatar: Joi.string().allow(""),
  cover: Joi.string().allow(""),
  firstName: Joi.string().allow(""),
  lastName: Joi.string().allow(""),
  displayName: Joi.string().allow(""),
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
  permissions: Joi.array().items(Joi.string().valid([
    Permissions.Admin, Permissions.User
  ])),
  isVerified: Joi.boolean(),
  emailVerified: Joi.boolean()
});

export const ChangePasswordUserSchema = Joi.object({
  newPassword: Joi.string().required()
});

export const RecoveryPasswordUserSchema = Joi.object({
  email: Joi.string().email().required()
});
