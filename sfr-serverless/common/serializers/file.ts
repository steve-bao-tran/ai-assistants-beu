import { IFile } from "../models";

export interface IAttachmentResponse {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl: string;
  views: number;
  metadata: object;
}

export function serializeAttachment(file: IFile): IAttachmentResponse {
  return <any> {
    ...file,
    views: file.views || 0
  };
}
