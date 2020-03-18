import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export interface IUserFriend extends IModelBase {
  friendIds: string[];
}

export const UserFriendSchemaName = "user_friends";

const UserFriendSchema = new mongoose.Schema(SchemaBase({
  friendIds: {
    type: [mongoose.SchemaTypes.ObjectId],
    required: true
  }
}), { timestamps: true });

export const UserFriend = mongoose.model<IUserFriend>(
  UserFriendSchemaName, UserFriendSchema
);
