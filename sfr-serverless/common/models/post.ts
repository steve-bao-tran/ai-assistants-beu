import * as mongoose from "mongoose";
import { IComment } from "./comment";
import { IModelBase, SchemaBase } from "./common";
import { IUser } from "./user";

export enum PostType {
  Normal = "normal",
  Competition = "competition",
  CompetitionPost = "competition_post",
  Event = "event"
}

export enum PostContentType {
  Normal = "normal",
  RepostEvent = "repost_event",
  RepostCompetitionPost = "repost_competition_post",
  RepostNormal = "repost_normal"
}

export interface IFile extends IModelBase {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl: string;
  views: number;
  metadata: object;
}

export enum FileTypes {
  Video = "video",
  Photo = "photo",
  Audio = "audio"
}

export interface IExternalLinkData {
  link: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export interface IPost extends IModelBase {
  type: PostType;
  referenceId: string;
  contentType: PostContentType;
  title: string;
  views: number;
  isPinned: boolean;
  isFeatured: boolean;

  tagFriendIds: string[];
  tagFriends: IUser[];

  attachments: IFile[];
  externalLinkData: IExternalLinkData;

  countRepost?: number;
  countLike?: number;
  countComment?: number;
  isLike?: boolean;

  comments: IComment[];
  owner: IUser;

  original?: IPost;
  usersLiked?: IUser[];
}

export const PostSchemaName = "posts";

const PostSchema = new mongoose.Schema(SchemaBase({
  type: {
    type: String,
    required: true,
    enum: [
      PostType.Normal, PostType.Event, PostType.Competition,
      PostType.CompetitionPost
    ]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  referenceId: mongoose.SchemaTypes.ObjectId,
  tagFriendIds: [mongoose.SchemaTypes.ObjectId],
  contentType: {
    type: String,
    required: true,
    enum: [
      PostContentType.Normal, PostContentType.RepostCompetitionPost,
      PostContentType.RepostEvent, PostContentType.RepostNormal
    ]
  },
  title: {
    type: String,
    text: true
  },
  views: {
    type: Number,
    required: true,
    default: 0
  },
  attachments: [Object],
  externalLinkData: Object
}), { timestamps: true });

export const Post = mongoose.model<IPost>(PostSchemaName, PostSchema);
