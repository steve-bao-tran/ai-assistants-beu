import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";
import { IPost, PostSchemaName } from "./post";
import { IUser } from "./user";

export enum ReactionType {
  Like = "like"
}

export interface IReaction extends IModelBase {
  referenceId: string;
  type: ReactionType;

  reference?: IPost;
  owner?: IUser;
}

export const ReactionSchemaName = "reactions";

const ReactionSchema = new mongoose.Schema(SchemaBase({
  referenceId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: PostSchemaName
  },
  type: {
    required: true,
    type: String,
    enum: [ReactionType.Like]
  }
}), {
  timestamps: true
});

ReactionSchema.index({ referenceId: 1, createdBy: 1, type: 1 }, { unique: true });

export const Reaction = mongoose.model<IReaction>(ReactionSchemaName, ReactionSchema);
