import { Gender, IPhone, IUser, Permissions, Provider, Role } from "../../../common";

export interface IAdminSimpleUserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  role: Role;
  profession: string[];
  email: string;
  phone: IPhone;
  numPosts: number;
  numFollowers: number;
  numFollowing: number;
  avatar: string;
  displayName: string;
  createdAt: Date;
  emailVerified: boolean;
  isVerified: boolean;
  provider: Provider;
  numFeatureFeed: number;
}

export interface IAdminUserResponse extends IAdminSimpleUserResponse {
  displayName: string;
  bio: string;
  cover: string;
  gender: Gender;
  birthday: Date;
  country: string;
  city: string;
  profession: string[];
  webpage: string;
  permissions: string[];
}

export function serializerAdminSimpleUser(model: IUser): IAdminSimpleUserResponse {
  return {
    id: model._id,
    username: model.username,
    firstName: model.firstName,
    lastName: model.lastName,
    country: model.country,
    role: model.role,
    profession: model.profession,
    email: model.email,
    phone: model.phone,
    avatar: model.avatar,
    displayName: model.displayName,

    numPosts: model.numPosts,
    numFollowers: model.numFollowers,
    numFollowing: model.numFollowing,
    createdAt: model.createdAt,
    emailVerified: model.emailVerified,
    isVerified: model.isVerified,
    provider: model.provider,
    numFeatureFeed: model.numFeatureFeed
  };
}

export function serializerAdminUser(model: IUser): IAdminUserResponse {
  return {
    id: model._id,
    username: model.username,
    firstName: model.firstName,
    lastName: model.lastName,
    displayName: model.displayName,
    bio: model.bio,

    avatar: model.avatar,
    cover: model.cover,
    gender: model.gender,
    birthday: model.birthday,
    country: model.country,
    city: model.city,
    role: model.role,
    profession: model.profession,
    email: model.email,
    webpage: model.webpage,
    phone: model.phone,
    permissions: model.permissions,

    numPosts: model.numPosts,
    numFollowers: model.numFollowers,
    numFollowing: model.numFollowing,
    isVerified: model.isVerified,
    createdAt: model.createdAt,
    emailVerified: model.emailVerified,
    provider: model.provider,
    numFeatureFeed: model.numFeatureFeed
  };
}

export interface ISimpleUserForFollowerResponse {
  id: string;
  lastName: string;
  firstName: string;
  avatar: string;
  displayName: string;
  username: string;
  isFollowing: boolean;
  isVerified: boolean;
  permissions: Permissions[];
}

export function serializeSimpleUserForFollower(model: IUser): ISimpleUserForFollowerResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id,
    lastName: model.lastName,
    firstName: model.firstName,
    avatar: model.avatar,
    displayName: model.displayName,
    username: model.username,
    isFollowing: model.isFollowing,
    isVerified: model.isVerified || false,
    permissions: model.permissions
  };
}
