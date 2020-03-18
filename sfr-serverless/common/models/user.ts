import * as mongoose from "mongoose";
import { IModelBase, IPhone, SchemaBase, StatusCode } from "./common";
import { Permissions } from "./permissions";

export enum Gender {
  Male = "Male",
  Female = "Female"
}

export enum Role {
  Musician = "Musician/Talent",
  Fan = "Fan"
}

export enum Provider {
  Facebook = "facebook",
  Google = "google",
  Email = "email"
}

export const UsernameAccountOfficial = ["soundfyr", "iamfyr"];
export const EmailAccountOfficial = "official@soundfyr.com";
export const PasswordAccountOfficial = "12345678";

export const UserSchemaName = "users";

export interface IUser extends IModelBase {
  authId: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  gender: Gender;
  birthday: Date;
  country: string;
  city: string;
  profession: string[];
  band: string;
  role: Role;
  email: string;
  webpage: string;
  phone: IPhone;
  status: StatusCode;
  permissions: Permissions[];
  avatar: string;
  cover: string;
  createdBy: string;
  updatedBy: string;
  isVerified: boolean;

  provider: Provider;

  numPosts?: number;
  numFollowers?: number;
  numFollowing?: number;
  isFollowing?: boolean;
  isBlock?: boolean;
  isBlocked?: boolean;
  emailVerified?: boolean;
  numFeatureFeed?: number;
}

const UserSchema = new mongoose.Schema(SchemaBase({
  authId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    text: true
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  firstName: String,
  lastName: String,
  displayName: {
    type: String,
    text: true
  },
  bio: String,
  gender: {
    type: String,
    enum: [Gender.Female, Gender.Male]
  },
  birthday: Date,
  country: {
    type: String,
    required: true,
  },
  city: String,
  profession: [String],
  band: String,
  role: {
    type: String,
    enum: [Role.Musician, Role.Fan]
  },
  email: {
    type: String,
    required: true
  },
  webpage: String,
  avatar: String,
  cover: String,
  phone: Object,
  permissions: {
    type: [String],
    default: []
  },
  provider: {
    type: String,
    default: Provider.Email
  }
}), {
  timestamps: true
});

export const User = mongoose.model<IUser>(UserSchemaName, UserSchema);

export function getNameUser(model: IUser): string {
  let name = model.displayName || model.username;
  if (name.length > 20) {
    name = name.slice(0, 20) + "...";
  }

  return name;
}
