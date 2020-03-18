import { StatusCode } from "../../../common";
import { IReportCategory } from "../models";

export interface IReportCategoryResponse {
  id: string;
  title: string;
  description: string;
  status: StatusCode;
}

export function serializeReportCategory(model: IReportCategory): IReportCategoryResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id,
    title: model.title,
    description: model.description,
    status: model.status
  };
}
