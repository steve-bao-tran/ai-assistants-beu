import { IUser, StatusCode, UserBlock, UserFollowing } from "../models";

export async function parseFollowers(currentUserId: string, users: IUser[]) {
  const followingUser = (await UserFollowing.find({
    createdBy: currentUserId,
    followingId: {
      $in: users.map((e) => (e._id || e.id))
    }
  }).populate("followingId"))
    .map((e) => <any> e.followingId)
    .filter((e) => e)
    .filter((e) => e.status !== StatusCode.Deleted);

  return users.map((e) => ({
    ...e.toJSON ? e.toJSON() : e,
    isFollowing: followingUser
      .find((f) => f._id.toString() === e._id.toString())
      ? true : false
  }));
}

export async function parseBlock(currentUserId: string, users: IUser[]) {
  const userBlock = await UserBlock.findOne({ createdBy: currentUserId });
  const userIsBlocked = await UserBlock.find({ userIds: { $all: [currentUserId] } });

  return users.map((e) => ({
    ...e.toJSON ? e.toJSON() : e,
    isBlock: (userBlock ? userBlock.userIds : [])
      .find((f) => f.toString() === e._id.toString())
      ? true : false,
    isBlocked: (userIsBlocked && userIsBlocked.length ? userIsBlocked : [])
      .find((f) => f.createdBy.toString() === e._id.toString())
      ? true : false
  }));
}

export async function filterUserBlock(currentUserId: string, users: string[]): Promise<string[]> {
  const userBlock: any = (await UserBlock.findOne({ createdBy: currentUserId })) || {};
  const userIdsBlocked = (await UserBlock.find({ userIds: { $all: [currentUserId] } })).map((e) => e.createdBy);
  userBlock.userIds = (userBlock.userIds || []).concat(userIdsBlocked);
  if (userBlock && userBlock.userIds.length > 0) {
    userBlock.userIds = userBlock.userIds.concat(userIdsBlocked);
    users = users.filter((e) => !userBlock.userIds.find((u) => u.toString() === e.toString()));
  }

  return users;
}
