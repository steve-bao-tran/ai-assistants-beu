import { IUser, Post, StatusCode } from "../../../common";

export async function parseCountFeatureFeed(users: IUser[]) {
  const countFeatureFeed = await Post.aggregate([
    {
      $match: {
        createdBy: {
          $in: users.map((e) => e._id)
        },
        status: StatusCode.Active,
        isFeatured: true
      }
    },
    {
      $group: {
        _id: "$createdBy",
        count: { $sum: 1 }
      }
    }
  ]);

  return users.map(e => ({
    ...e.toJSON ? e.toJSON() : e,
    numFeatureFeed: countFeatureFeed.filter((f) => f._id.toString() === e._id.toString())
      .map((m) => m.count)[0] || 0
  }));

}
