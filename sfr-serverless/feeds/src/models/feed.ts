import { IFile, PostContentType, PostType } from "../../../common";

export interface IFeedCreateForm {
  attachments?: IFile[];

  title?: string;
  tagFriendIds?: string[];
  contentType?: PostContentType;
  type?: PostType;
  referenceId?: string;

  createdBy?: string;
}

export interface IFeedUpdateForm {
  attachments?: IFile[];

  title?: string;
  tagFriendIds?: string[];

  updatedAt: Date;
}

export interface IFeedFilter {
  title: string;
}
