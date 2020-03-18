import { NotificationKeyType } from "./types";

export default {
  [NotificationKeyType.LikePost]: {
    title: "loved your post"
  },
  [NotificationKeyType.CommentPost]: {
    title: "commented your post"
  },
  [NotificationKeyType.StartPlugging]: {
    title: "started plugging you"
  },
  [NotificationKeyType.NewPost]: {
    title: "published a new post"
  },
  [NotificationKeyType.NewRepost]: {
    title: "reposted a post"
  },
  [NotificationKeyType.TaggedYou]: {
    title: "tagged you"
  },
  [NotificationKeyType.LikeRepost]: {
    title: "loved your repost"
  },
  [NotificationKeyType.CommentRepost]: {
    title: "commented your repost"
  },
  [NotificationKeyType.EditPost]: {
    title: "edited post"
  }
};
