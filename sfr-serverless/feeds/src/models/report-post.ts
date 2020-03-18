import * as mongoose from "mongoose";
import { IModelBase, IPost, IUser, PostSchemaName, SchemaBase } from "../../../common";
import { ReportCategorySchemaName } from "./report-category";

export interface IReportPostForm {
  categoryId: string;
  comment: string;
  referenceId: string;
  createdBy: string;
}

export interface IReportPost extends IModelBase {
  categoryId: string;
  comment: string;
  referenceId: string;

  owner?: IUser;
  post?: IPost;
}

export enum ReportTypes {
  Spam = "spam",
  Inappropriate = "inappropriate",
  Others = "others"
}

export const ReportPostSchemaName = "report_posts";

const ReportPostSchema = new mongoose.Schema(SchemaBase({
  referenceId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: PostSchemaName
  },
  categoryId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: ReportCategorySchemaName
  },
  type: {
    type: String,
    enum: [ReportTypes.Inappropriate, ReportTypes.Others, ReportTypes.Spam]
  },
  comment: {
    type: String
  }
}), {
  timestamps: true
});

export const ReportPost = mongoose.model<IReportPost>(ReportPostSchemaName, ReportPostSchema);
