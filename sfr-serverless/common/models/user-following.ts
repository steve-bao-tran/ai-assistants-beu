import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";
import { IUser, UserSchemaName } from "./user";

export interface IUserFollowing extends IModelBase {
  followingId: string;
  owner?: IUser;
  following?: IUser;
}

export const UserFollowingSchemaName = "user_followings";

const UserFollowingSchema = new mongoose.Schema(SchemaBase({
  followingId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  }
}), { timestamps: true });

export const UserFollowing = mongoose.model<IUserFollowing>(
  UserFollowingSchemaName, UserFollowingSchema
);
