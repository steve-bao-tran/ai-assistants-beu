import { serializeSimpleUser, ISimpleUserResponse } from "../../../common/serializers";
import { IReportPost } from "../models";
import {
  serializeFeedAdmin, serializeFeedItemAdmin,
  IFeedAdminResponse, IFeedItemAdminResponse
} from "./feed-admin";
import { StatusCode } from "../../../common";

export interface IReportPostResponse {
  id: string;
  comment: string;
  referenceId: string;
  createdAt: Date;
  owner: ISimpleUserResponse;
  post: IFeedAdminResponse;
  status: StatusCode
}

export function serializeReportPost(model: IReportPost): IReportPostResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id,
    comment: model.comment,
    referenceId: model.referenceId,
    post: serializeFeedAdmin(model.post),
    owner: serializeSimpleUser(model.owner),
    createdAt: model.createdAt,
    status: model.status
  };
}

export interface IReportPostItemResponse {
  id: string;
  comment: string;
  referenceId: string;
  createdAt: Date;
  owner: ISimpleUserResponse;
  post: IFeedItemAdminResponse;
  status: StatusCode
}

export function serializeReportPostItem(model: IReportPost): IReportPostItemResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id,
    comment: model.comment,
    referenceId: model.referenceId,
    post: serializeFeedItemAdmin(model.post),
    owner: serializeSimpleUser(model.owner),
    createdAt: model.createdAt,
    status: model.status
  };
}
