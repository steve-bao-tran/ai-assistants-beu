import * as lodash from "lodash";
import {
  filterPagination, getFirebaseUserById, isEmptyObject,
  updateUserFirebaseByAuthId, ErrorKey, IUser,
  Post, StatusCode, User, UsernameAccountOfficial, UserFollowing, UserSchemaName
} from "../../../common";
import { IUserFilter } from "../models";
import { serializerAdminUser } from "../serializers";

export async function getList(query, pagingQuery, sort?: any) {
  try {
    const baseQuery = {
      status: StatusCode.Active
    };
    const buildQuery = (queryMongodb, limit, skip) => {
      if (isEmptyObject(query)) {
        return queryMongodb.find(baseQuery).limit(limit).skip(skip).sort(sort || {
          createdAt: -1
        });
      }

      let baseSortSearch: any = { score: { $meta: "textScore" }, username: 1, displayName: 1 };
      if (sort) {
        baseSortSearch = {
          score: { $meta: "textScore" },
          ...sort
        };
      }

      return queryMongodb.find({
        ...baseQuery,
        ...query
      }, { score: { $meta: "textScore" } })
        .limit(limit)
        .skip(skip)
        .sort(baseSortSearch);
    };

    return await filterPagination(User, query, {
      ...pagingQuery,
      buildQuery,
      buildQueryCount: (queryMongodb) => {
        return queryMongodb.countDocuments({
          ...baseQuery,
          ...query
        });
      }
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getDetail(id: any) {
  try {
    const user = await User.findOne({
      _id: id,
      status: StatusCode.Active
    });
    if (!user) {
      return Promise.reject(ErrorKey.RecordNotFound);
    }
    const [result] = await parseProfiles([user]);
    result.emailVerified = (await getFirebaseUserById(result.authId)).emailVerified;

    return serializerAdminUser(result);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateUser(id: any, formUser: any) {
  try {

    formUser = lodash.omit(formUser, ["email"]);
    const checkUser = await User.findById(id);
    if (formUser.username && checkUser.username !== formUser.username) {
      const checkUsername = await User.findOne({
        username: { $regex: `^${formUser.username}$`, $options: "i" },
        status: StatusCode.Active
      });
      if (checkUsername) {
        return Promise.reject(ErrorKey.UsernameExisted);
      }
    }
    const user = await User.findByIdAndUpdate(id, lodash.omit(formUser, ["emailVerified"]), {
      new: true
    });
    if ("emailVerified" in formUser && checkUser) {
      user.emailVerified = (await updateUserFirebaseByAuthId(user.authId, {
        emailVerified: formUser.emailVerified
      })).emailVerified;
    } else {
      user.emailVerified = (await getFirebaseUserById(user.authId)).emailVerified;
    }

    return serializerAdminUser(user);
  } catch (error) {
    return Promise.reject(error);
  }
}

export function parseParamFullTextSearch(query: IUserFilter) {
  query = <any> lodash.omit(query, ["size", "page", "nextPageToken"]);
  const fullTextSearchUser = [];
  if (query && query.name) {
    const nameForFullTextSearch = query.name.trim();
    if (/ /g.test(nameForFullTextSearch)) {
      fullTextSearchUser.push({
        $text: {
          $search: nameForFullTextSearch
        }
      });
    } else {
      fullTextSearchUser.push({
        username: { $regex: nameForFullTextSearch, $options: "i" }
      }, {
        displayName: { $regex: nameForFullTextSearch, $options: "i" }
      });
    }

  }

  const params: any = {
    ...lodash.omit(query, ["name", "username"])
  };
  if (fullTextSearchUser.length > 0) {
    params.$or = fullTextSearchUser;
  }

  if (params.roles) {
    params.role = {
      $in: params.roles.split(",")
    };
  }
  if (params.professions) {
    params.profession = {
      $in: params.professions.split(",")
    };
  }

  return lodash.omit(params, ["roles", "professions"]);
}

export async function parseProfiles(users: IUser[]) {
  try {

    const countPosts = await Post.aggregate([
      {
        $match: {
          createdBy: {
            $in: users.map((e) => e._id)
          },
          status: StatusCode.Active
        }
      },
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 }
        }
      }
    ]);
    const countFollowers = await UserFollowing.aggregate([
      {
        $match: {
          followingId: {
            $in: users.map((e) => e._id)
          },
          status: StatusCode.Active
        }
      },
      {
        $lookup: {
          from: UserSchemaName,
          localField: "createdBy",
          foreignField: "_id",
          as: "creator"
        }
      },
      {
        $match: {
          "creator.status": StatusCode.Active
        },
      },
      {
        $group: {
          _id: "$followingId",
          count: { $sum: 1 }
        }
      }
    ]);
    const countFollowing = await UserFollowing.aggregate([
      {
        $match: {
          createdBy: {
            $in: users.map((e) => e._id)
          },
          status: StatusCode.Active
        }
      },
      {
        $lookup: {
          from: UserSchemaName,
          localField: "followingId",
          foreignField: "_id",
          as: "following"
        }
      },
      {
        $match: {
          "following.status": StatusCode.Active
        },
      },
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 }
        }
      }
    ]);

    return users.map((e) => ({
      ...e.toJSON ? e.toJSON() : e,
      numPosts: countPosts.filter((f) => f._id.toString() === e._id.toString())
        .map((m) => m.count)[0] || 0,
      numFollowers: countFollowers.filter((f) => f._id.toString() === e._id.toString())
        .map((m) => m.count)[0] || 0,
      numFollowing: countFollowing.filter((f) => f._id.toString() === e._id.toString())
        .map((m) => m.count)[0] || 0
    }));

  } catch (error) {
    return Promise.reject(error);
  }
}

export async function followDefaultAccounts(user: IUser): Promise<any[]> {

  const accounts = await User.find({
    username: { $in: UsernameAccountOfficial },
    status: StatusCode.Active
  });

  return accounts.length === 0 ? [] : Promise.all(
    <any> accounts.map(e => {
      const data = {
        createdBy: e._id,
        followingId: user._id
      };

      return UserFollowing.findOneAndUpdate(data, {
        ...data,
        status: StatusCode.Active
      }, { upsert: true });
    })
  );
}
