import { Gender, IPhone, IUser, Permissions, Role } from "../../../common";

export interface IUserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  avatar: string;
  cover: string;
  gender: Gender;
  birthday: Date;
  country: string;
  city: string;
  role: Role;
  profession: string[];
  email: string;
  webpage: string;
  phone: IPhone;
  permissions: Permissions[];
  isVerified: boolean;

  numPosts: number;
  numFollowers: number;
  numFollowing: number;
  isFollowing: boolean;
  isBlock: boolean;
  isBlocked: boolean;
  shareUrl: string;
}

export function serializerUser(model: IUser): IUserResponse {
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
    isVerified: model.isVerified || false,

    numPosts: model.numPosts,
    numFollowers: model.numFollowers,
    numFollowing: model.numFollowing,
    isFollowing: model.isFollowing,
    isBlock: model.isBlock,
    isBlocked: model.isBlocked,
    shareUrl: shareUrlProfile(model)
  };
}

export function shareUrlProfile(model: IUser) {
  return process.env.LINK_USER_WEB + `/${model.username}`;
}
