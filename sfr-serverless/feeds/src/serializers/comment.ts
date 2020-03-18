import { IComment } from "../../../common";
import { serializeSimpleUser, ISimpleUserResponse } from "../../../common/serializers";

export interface ICommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  owner: ISimpleUserResponse;
  childComments: ICommentResponse[];
}

export function serializeComment(model: IComment): ICommentResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id,
    content: model.content,
    createdAt: model.createdAt,
    owner: serializeSimpleUser(model.owner),
    childComments: model.childComments ? model.childComments.map(serializeComment) : null
  };
}
