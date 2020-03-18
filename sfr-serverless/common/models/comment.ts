import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";
import { IPost, PostSchemaName } from "./post";
import { IUser } from "./user";

export interface ICommentCreateForm {
  referenceId: string;
  parentId: string;
  content: string;

  createdBy: string;
}

export interface IComment extends IModelBase {
  referenceId: string;
  parentId: string;
  content: string;

  reference?: IPost;
  parent?: IComment;
  childComments?: IComment[];
  owner?: IUser;
}

export const CommentSchemaName = "comments";

const CommentSchema = new mongoose.Schema(SchemaBase({
  referenceId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: PostSchemaName
  },
  parentId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: CommentSchemaName
  },
  content: String
}), {
  timestamps: true
});

export const Comment = mongoose.model<IComment>(CommentSchemaName, CommentSchema);
