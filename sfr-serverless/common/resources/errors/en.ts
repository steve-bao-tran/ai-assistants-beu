import { ErrorKey } from "./types";

export default {
  [ErrorKey.RecordNotFound]: "Content not available",
  [ErrorKey.ErrorUnknown]: "Unknown error",
  [ErrorKey.Permission]: "Permission denied",

  [ErrorKey.ProfileNotFound]: "Profile not found",
  [ErrorKey.EmailNotFound]: "Email not found",
  [ErrorKey.Unauthorized]: "Unauthorized",
  [ErrorKey.UsernameExisted]: "Username is already existed",
  [ErrorKey.AuthExisted]: "Firebase Authorization is already existed",
  [ErrorKey.EmailExisted]: "Email is already existed",
  [ErrorKey.IsAdmin]: "This action is forbidden",
  [ErrorKey.AllowForgotPassword]:
    "You are not able to reset password for this account, it has been used for Facebook login.",
  [ErrorKey.NotFollowYourSelf]: "You can't plug my self",

  [ErrorKey.CountCompetitionError]: "Article is not existed in this competition",
  [ErrorKey.CompetitionNotRegisterUpload]: "Competition can't upload in this time",

  [ErrorKey.DeleteFeed]: "You can't delete this post",
  [ErrorKey.CountAttachment]: "This feed does not contain video or audio",
  [ErrorKey.FollowBockUser]: "You can't plug this user",
  [ErrorKey.ActionUserBlock]: "Action not allow",

  [ErrorKey.CanNotUntagFeed]: "Can't untag in this feed",
  [ErrorKey.CanNotDoActionForComment]: "Can't do action on this comment"
};
