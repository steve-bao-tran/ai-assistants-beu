import { isEmptyObject, IExternalLinkData, IFile, IPost, PostContentType } from "../../../common";
import {
  serializeAttachment, serializeSimpleUser,
  IAttachmentResponse, ISimpleUserResponse
} from "../../../common/serializers";
import { serializeComment, ICommentResponse } from "./comment";

export interface IFeedResponse {
  id: string;

  attachments: IAttachmentResponse[];
  title: string;
  countLike: number;
  countRepost: number;
  countComment: number;
  createdAt: Date;
  updatedAt: Date;
  isLike: boolean;
  contentType: PostContentType;

  owner: ISimpleUserResponse;
  comments: ICommentResponse[];

  tagFriends: ISimpleUserResponse[];
  usersLiked: ISimpleUserResponse[];
  original: IRepostResponse;
  shareUrl: string;

  externalLinkData: IExternalLinkData;
}

function parseLinkFeed(model: IPost) {
  return process.env.LINK_USER_WEB + `/feed/${model._id || model._id}`;
}

export function serializeFeed(model: IPost): IFeedResponse {
  return {
    id: model._id || model._id,

    attachments: model.attachments.map(serializeAttachment),
    title: model.title,
    countLike: model.countLike,
    countRepost: model.countRepost,
    countComment: model.comments ? model.comments.length : 0,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    isLike: model.isLike,
    contentType: model.contentType,

    owner: serializeSimpleUser(model.owner),
    comments: model.comments.map(serializeComment),
    tagFriends: model.tagFriends.map(serializeSimpleUser),
    original: serializeFeedItem(model.original),
    shareUrl: parseLinkFeed(model),
    usersLiked: model.usersLiked ? model.usersLiked.map(serializeSimpleUser) : null,
    externalLinkData: parseExternalLinkData(model.externalLinkData)
  };
}

export interface IFeedItemResponse {
  id: string;
  attachments: IFile[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLike: boolean;
  contentType: PostContentType;

  countLike: number;
  countRepost: number;
  countComment: number;

  owner: ISimpleUserResponse;
  tagFriends: ISimpleUserResponse[];
  comments: ICommentResponse[];
  usersLiked: ISimpleUserResponse[];

  original: IRepostResponse;
  shareUrl: string;
  externalLinkData: IExternalLinkData;
}

export function serializeFeedItem(model: IPost): IFeedItemResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id || model.id,
    attachments: model.attachments,
    title: model.title,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    isPinned: model.isPinned,
    isLike: model.isLike,
    contentType: model.contentType,

    countLike: model.countLike,
    countRepost: model.countRepost,
    countComment: model.countComment,
    comments: model.comments.map(serializeComment),

    owner: serializeSimpleUser(model.owner),
    tagFriends: model.tagFriends.map(serializeSimpleUser),
    usersLiked: model.usersLiked.map(serializeSimpleUser),
    original: serializeRepost(model.original),
    shareUrl: parseLinkFeed(model),
    externalLinkData: parseExternalLinkData(model.externalLinkData)
  };
}

export interface IRepostResponse {
  id: string;

  attachments: IFile[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
  owner: ISimpleUserResponse;
  externalLinkData: IExternalLinkData;
}

export function serializeRepost(model: IPost): IRepostResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id || model.id,

    attachments: model.attachments,
    title: model.title,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    owner: serializeSimpleUser(model.owner),
    externalLinkData: parseExternalLinkData(model.externalLinkData)
  };
}

export function parseExternalLinkData(data: IExternalLinkData) {
  if (isEmptyObject(data)) {
    return null;
  }

  return data;
}
