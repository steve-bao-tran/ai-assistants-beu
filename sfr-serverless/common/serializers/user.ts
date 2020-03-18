import { IUser } from "../models";

export interface ISimpleUserResponse {
  id: string;
  lastName: string;
  firstName: string;
  avatar: string;
  displayName: string;
  username: string;
  email: string;
  permissions: string[];
  isFollowing: boolean;
  isBlock: boolean;
  isBlocked: boolean;
  isVerified: boolean;
}

export function serializeSimpleUser(model: IUser): ISimpleUserResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id || model.id,
    lastName: model.lastName,
    firstName: model.firstName,
    avatar: model.avatar,
    email: model.email,
    displayName: model.displayName,
    username: model.username,
    permissions: model.permissions,
    isFollowing: model.isFollowing,
    isBlock: model.isBlock,
    isBlocked: model.isBlocked,
    isVerified: model.isVerified || false
  };
}
