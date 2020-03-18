import { IPost, StatusCode } from "../../../common";
import { serializeFeed, serializeFeedItem, IFeedItemResponse, IFeedResponse } from "./feed";

export interface IFeedAdminResponse extends IFeedResponse {
  referenceId: string;
  status: StatusCode;
  isFeatured: boolean;
}

export interface IFeedItemAdminResponse extends IFeedItemResponse {
  status: StatusCode;
  isFeatured: boolean;
}

export function serializeFeedAdmin(model: IPost): IFeedAdminResponse {
  return {
    ...serializeFeed(model),
    status: model.status,
    referenceId: model.referenceId,
    isFeatured: model.isFeatured
  };
}

export function serializeFeedItemAdmin(model: IPost) {
  return {
    ...serializeFeedItem(model),
    status: model.status,
    isFeatured: model.isFeatured
  };
}
