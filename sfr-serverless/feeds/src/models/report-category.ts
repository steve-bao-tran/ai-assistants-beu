import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export interface IReportCategory extends IModelBase {
  title: string;
  description: string;
}

export const ReportCategorySchemaName = "report_categories";

const ReportCategorySchema = new mongoose.Schema(SchemaBase({
  title: {
    required: true,
    type: String
  },
  description: String
}), {
  timestamps: true
});

export const ReportCategory = mongoose.model<IReportCategory>(ReportCategorySchemaName, ReportCategorySchema);
