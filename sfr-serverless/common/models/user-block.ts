import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";

export interface IUserBlock extends IModelBase {
  userIds: string[];
}

export const UserBlockSchemaName = "user_blocks";

const UserBlockSchema = new mongoose.Schema(SchemaBase({
  userIds: {
    type: [mongoose.SchemaTypes.ObjectId],
  }
}), { timestamps: true });

export const UserBlock = mongoose.model<IUserBlock>(
  UserBlockSchemaName, UserBlockSchema
);
