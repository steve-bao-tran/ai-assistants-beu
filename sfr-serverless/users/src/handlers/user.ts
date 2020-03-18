// tslint:disable max-file-line-count
import { Response, Router } from "express";
import * as lodash from "lodash";
import * as moment from "moment-timezone";
import * as mongoose from "mongoose";
import {
  createAndPushNotificationWithFormat,
  filterPagination, filterUserBlock,
  getContentNotification, parseBlock, parseFollowers,
  responseError, sendEmail,
  serializeSimpleUser, validateBody, validateHeader,
  validateQuery, verifyFirebaseToken, DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT, DEFAULT_TIMEZONE, EmailTemplateType, ErrorKey, HeaderAuthorizationSchema,
  IRequest, ISimpleUserResponse, IUser,
  NotificationKeyType, NotificationSchemaName, NotificationUser, Provider,
  ReferenceType, StatusCode, User, UserBlock, UserFollowing, UserSchemaName
} from "../../../common";
import { followDefaultAccounts, getList, parseParamFullTextSearch, parseProfiles } from "../business";
import { parseMyNotification } from "../business/notification";
import { IUserFormCreate, UserFriend } from "../models";
import { AllowForPasswordSchema, UpdateUserSchema } from "../schemas";
import { serializerNotificationItem, serializerUser, serializeSimpleUserForFollower } from "../serializers";

export function userRouter(route: Router) {

  route.route("/me")
    .get(
      validateHeader(HeaderAuthorizationSchema, {
        allowUnknown: true
      }),
      getProfile
    )
    .put(
      validateHeader(HeaderAuthorizationSchema, {
        allowUnknown: true
      }),
      validateBody(UpdateUserSchema, {
        allowUnknown: true
      }),
      updateProfile
    );
  route.post("/me/following/:userId", setFollowing);
  route.get("/me/following", getFollowing);
  route.post("/me/block/:userId", setBlock);
  route.get("/me/block", getBlock);
  route.get("/me/followers", getFollowers);
  route.get("/me/friends", getFriends);
  route.get("/me/notifications", getMyNotification);
  route.get("/me/auth-id/:authId", checkAuthId);

  route.get("/users", getUserList);
  route.get("/users/allow-forgot-password", validateQuery(AllowForPasswordSchema), allowForgotPassword);
  route.get("/users/:id", getOtherProfile);
  route.get("/users/:username/username", getOtherProfileByUsername);

  route.get("/public/users/:id", getOtherProfile);
  route.get("/public/users/:username/username", getOtherProfileByUsername);

}

export async function getProfile(req: IRequest, res: Response) {
  try {

    const token = req.headers.authorization;
    const authId = await verifyFirebaseToken(token);
    const user = await User.findOne({
      authId,
      status: StatusCode.Active
    });
    if (!user) {
      return responseError(req, res, ErrorKey.ProfileNotFound, {
        statusCode: 404
      });
    }
    const [result] = await parseProfiles([user]);

    return res.json(serializerUser(result));
  } catch (error) {
    console.log("Error Get Profile", error);

    return responseError(req, res, ErrorKey.Unauthorized, {
      statusCode: 401
    });
  }
}

async function updateProfile(req: IRequest, res: Response) {
  try {

    const token = req.headers.authorization;
    const form: IUserFormCreate = req.body;
    delete form.permissions;
    const authId = await verifyFirebaseToken(token);
    const user = await User.findOne({ authId });
    let modelUpdated;
    if (user) {
      modelUpdated = await User.findByIdAndUpdate(user._id,
        lodash.omit(form, ["username", "email"]), {
          new: true
        });
    } else {
      form.authId = authId;
      form.provider = form.provider || Provider.Email;
      form.username = form.username.toLocaleLowerCase();
      const [checkEmail, checkUsername, checkAuthIdExisted] = await Promise.all([
        <any>User.findOne({
          email: form.email,
          status: StatusCode.Active
        }),
        User.findOne({
          username: { $regex: `^${form.username}$`, $options: "i" },
          status: StatusCode.Active
        }),
        User.findOne({
          authId: form.authId,
          status: StatusCode.Active
        })
      ]);
      if (checkEmail) {
        return responseError(req, res, ErrorKey.EmailExisted);
      }
      if (checkUsername) {
        return responseError(req, res, ErrorKey.UsernameExisted);
      }
      if (checkAuthIdExisted) {
        return responseError(req, res, ErrorKey.AuthExisted);
      }

      try {
        modelUpdated = await User.create(form);
        await followDefaultAccounts(modelUpdated);

        // const userAdmins = (await User.find({ permissions: Permissions.Admin, status: StatusCode.Active }))
        //   .map((e) => e.email);
        const userAdmins = process.env.EMAIL;
        if (userAdmins) {
          await sendEmail({ emailsReceive: [userAdmins] }, {
            type: EmailTemplateType.NewUser,
            params: {
              content: {
                username: modelUpdated.username,
                createdAt: moment(modelUpdated.createdAt).tz(DEFAULT_TIMEZONE)
                  .format(DEFAULT_DATE_TIME_FORMAT)
              }
            }
          });
        }
      } catch (error) {
        if (error && error.code === 11000 && /username/g.test(error.errmsg)) {
          return responseError(req, res, ErrorKey.UsernameExisted, {
            statusCode: 404
          });
        }

        if (error && error.code === 11000 && /email/g.test(error.errmsg)) {
          return responseError(req, res, ErrorKey.EmailExisted, {
            statusCode: 404
          });
        }

        return responseError(req, res, error);
      }

    }
    const [result] = await parseProfiles([modelUpdated]);

    return res.json(serializerUser(result));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function setFollowing(req: IRequest, res: Response) {
  try {

    let userId = req.params.userId;
    let currentUserId = req.context.currentUser._id;
    if (req.query.reverse) {
      userId = req.context.currentUser._id;
      currentUserId = req.params.userId;
    }
    if (userId.toString() === currentUserId.toString()) {
      return responseError(req, res, ErrorKey.NotFollowYourSelf);
    }
    if ((await filterUserBlock(currentUserId, [userId])).length === 0) {
      return responseError(req, res, ErrorKey.FollowBockUser);
    }

    // const userId = req.context.currentUser._id;
    // const currentUserId = req.params.userId;

    const form = {
      createdBy: currentUserId,
      followingId: userId
    };
    const formFriend = {
      friendIds: [userId, currentUserId]
    };
    let message = "Following";

    await UserFollowing.findOne(form).then(
      (r) => {
        if (r) {
          message = "Unfollow";

          return UserFriend.deleteOne({
            friendIds: {
              $all: formFriend.friendIds
            }
          }).then(() => UserFollowing.deleteOne(form));
        }

        return UserFollowing.create(form).then(async () => {
          await createAndPushNotificationWithFormat(null, {
            ...getContentNotification(NotificationKeyType.StartPlugging),
            senderId: currentUserId,
            receiverIds: [userId],
            referenceId: currentUserId,
            type: ReferenceType.User
          }, { actorId: currentUserId });

          return UserFollowing.findOne({
            createdBy: form.followingId,
            followingId: form.createdBy
          }).then(async (u) => {
            return u ?
              UserFriend.create(formFriend)
              : UserFollowing.deleteOne(formFriend);
          });
        });
      }
    );

    return res.json({
      message: message + " successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getFriends(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const friends = await UserFriend.find({ friendIds: currentUserId });
    const ids = friends.reduce((pre, cur) => {
      return pre.concat(cur.friendIds);
    }, [])
      .filter((e) => e.toString() !== currentUserId.toString());

    const users = (await User.find({ _id: ids, status: StatusCode.Active }))
      .map(serializeSimpleUser);

    return res.json(users);

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getFollowing(req: IRequest, res: Response) {
  try {

    if (!("nextPageToken" in req.query)) {
      const _users = (await UserFollowing.find({
        createdBy: req.context.currentUser._id
      }).populate("followingId"))
        .map((e) => <any>e.followingId)
        .filter((e) => e)
        .filter((e) => e.status !== StatusCode.Deleted)
        .map((e) => ({ ...e.toJSON ? e.toJSON() : e, isFollowing: true }))
        .map(serializeSimpleUser);

      return res.json(_users);
    }

    const modelFilter = {
      createdBy: mongoose.Types.ObjectId(req.context.currentUser._id)
    };
    const models = await filterPagination(UserFollowing, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      buildQuery: (query, limit, skip) => {
        const lookupUser = {
          $lookup: {
            from: UserSchemaName,
            localField: "followingId",
            foreignField: "_id",
            as: "following"
          }
        };
        const matchUser = {
          $match: {
            "following.status": StatusCode.Active
          },
        };
        const queryBase = query.aggregate([
          { $match: modelFilter },
          lookupUser,
          matchUser,
          { $sort: { createdAt: -1 } }
        ]);

        return queryBase.skip(skip).limit(limit);
      }
    });

    const users = models.data
      .map((e) => <any>e.following ? e.following[0] : null)
      .map((e) => ({ ...e.toJSON ? e.toJSON() : e, isFollowing: true }))
      .map(serializeSimpleUser);

    return res.json({
      data: users,
      pagination: models.pagination
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getFollowers(req: IRequest, res: Response) {
  try {
    if (!("nextPageToken" in req.query)) {
      const _users: IUser[] = (await UserFollowing.find({
        followingId: req.context.currentUser._id
      }).populate("createdBy"))
        .map((e) => <any>e.createdBy)
        .filter((e) => e)
        .filter((e) => e.status !== StatusCode.Deleted);

      const _modelParsed = (await parseFollowers(
        req.context.currentUser._id,
        _users
      )).map(serializeSimpleUserForFollower);

      return res.json(_modelParsed);
    }

    const modelFilter = {
      followingId: mongoose.Types.ObjectId(req.context.currentUser._id)
    };
    const models = await filterPagination(UserFollowing, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      buildQuery: (query, limit, skip) => {
        const lookupUser = {
          $lookup: {
            from: UserSchemaName,
            localField: "createdBy",
            foreignField: "_id",
            as: "owner"
          }
        };
        const matchUser = {
          $match: {
            "owner.status": StatusCode.Active
          },
        };
        const queryBase = query.aggregate([
          { $match: modelFilter },
          lookupUser,
          matchUser,
          { $sort: { createdAt: -1 } }
        ]);

        return queryBase.skip(skip).limit(limit);
      }
    });

    const users: IUser[] = models.data.map((e) => <any>e.owner ? e.owner[0] : null);

    const modelParsed = (await parseFollowers(
      req.context.currentUser._id,
      users
    )).map(serializeSimpleUserForFollower);

    return res.json({
      data: modelParsed,
      pagination: models.pagination
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getUserList(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const result = await getList(parseParamFullTextSearch(req.query), req.query);
    const users = await parseFollowers(currentUserId, result.data);
    const parsedBlock = await parseBlock(currentUserId, users);
    result.data = <any>parsedBlock.map(serializeSimpleUser);

    return res.json(result);
  } catch (error) {
    return responseError(req, res, error);
  }
}

export async function getOtherProfile(req: IRequest, res: Response) {
  try {

    const userId = req.params.id;
    let currentUserId;
    if (req.context.currentUser && req.context.currentUser._id) {
      currentUserId = req.context.currentUser._id;
    }
    const user = await User.findOne({
      _id: userId,
      status: StatusCode.Active
    });

    if (!user) {
      return responseError(req, res, ErrorKey.ProfileNotFound, {
        statusCode: 404
      });
    }

    const [resultParseProfile] = await parseProfiles([user]);
    let result = resultParseProfile;
    if (currentUserId) {
      const [resultParseFollowers] = await parseFollowers(currentUserId, [resultParseProfile]);
      const [resultParseIsBlock] = await parseBlock(currentUserId, [resultParseFollowers]);
      result = resultParseIsBlock;
    }

    return res.json(
      serializerUser(result)
    );
  } catch (error) {
    return responseError(req, res, error);
  }
}

export async function getOtherProfileByUsername(req: IRequest, res: Response) {
  try {

    const username = req.params.username;
    let currentUserId;
    if (req.context.currentUser && req.context.currentUser._id) {
      currentUserId = req.context.currentUser._id;
    }
    const user = await User.findOne({ username, status: StatusCode.Active });

    if (!user) {
      return responseError(req, res, ErrorKey.ProfileNotFound, {
        statusCode: 404
      });
    }

    const [resultParseProfile] = await parseProfiles([user]);
    let result = resultParseProfile;
    if (currentUserId) {
      const [resultParseFollowers] = await parseFollowers(currentUserId, [resultParseProfile]);
      const [resultParseIsBlock] = await parseBlock(currentUserId, [resultParseFollowers]);
      result = resultParseIsBlock;
    }

    return res.json(
      serializerUser(result)
    );
  } catch (error) {
    return responseError(req, res, error);
  }
}

export async function allowForgotPassword(req: IRequest, res: Response) {
  try {

    const email = req.query.email;
    const check = await User.findOne({
      email,
      status: StatusCode.Active
    });

    if (!check) {
      return responseError(req, res, ErrorKey.EmailNotFound);
    }
    if (check && check.provider === Provider.Email) {
      return res.json({
        message: "This email allow forgot password"
      });
    }

    return responseError(req, res, ErrorKey.AllowForgotPassword);
  } catch (error) {
    return responseError(req, res, error);
  }
}

export async function checkAuthId(req: IRequest, res: Response) {
  try {

    const authId = req.params.authId;
    const user = await User.findOne({
      authId,
      status: StatusCode.Active
    });
    if (!user) {
      return responseError(req, res, ErrorKey.RecordNotFound, {
        statusCode: 404
      });
    }

    return res.json({
      message: "Check authorization firebase successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getMyNotification(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const createdAt = (await User.findById(currentUserId)).createdAt;
    // const notificationUser = await filterPagination(NotificationUser, {
    //   $or: [
    //     { userId: currentUserId },
    //     { typeRole: { $all: req.context.currentUser.role } }
    //   ]
    // }, { ...req.query, sort: "-createdAt" });
    const modelFilter = {
      $or: [
        { userId: mongoose.Types.ObjectId(currentUserId) },
        { typeRole: { $all: [req.context.currentUser.role] } },
      ],
      createdAt: { $gte: createdAt }
    };
    const userBlock: any = (await UserBlock.findOne({ createdBy: currentUserId })) || {};
    const userBlocked = await UserBlock.find({ userIds: { $all: [currentUserId] } });
    const models = await filterPagination(NotificationUser, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      buildQuery: (query, limit, skip) => {
        const lookupNotification = {
          $lookup: {
            from: NotificationSchemaName,
            localField: "notificationId",
            foreignField: "_id",
            as: "notification"
          }
        };

        if (userBlocked && userBlocked.length > 0) {
          userBlock.userIds = userBlock.userIds || [];
          userBlock.userIds = userBlock.userIds.concat(userBlocked.map((e) => e.createdBy));
        }
        let matchNotification;
        if (userBlock && userBlock.userIds && userBlock.userIds.length > 0) {
          matchNotification = {
            $match: {
              "notification.senderId": { $nin: userBlock.userIds },
              $or: [
                { "notification.expiryDate": { $gte: new Date(moment(new Date()).format(DEFAULT_DATE_FORMAT)) }, },
                { "notification.expiryDate": { $exists: false }, },
              ],
            },
          };
        }

        return query.aggregate([
          { $match: modelFilter },
          lookupNotification,
          matchNotification,
          { $sort: { createdAt: -1 } }
        ].filter(e => e)).skip(skip).limit(limit);
      }
    });

    return res.json({
      data: (await parseMyNotification(models.data.map((e) => e.notificationId), {
        actorId: req.context.currentUser._id
      })).map(serializerNotificationItem),
      pagination: models.pagination
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function setBlock(req: IRequest, res: Response) {
  try {
    const userId = req.params.userId;
    const currentUserId = req.context.currentUser._id;
    const usersBlock = await UserBlock.findOne({ createdBy: currentUserId });
    let message = "Block";
    const removeRelation = async () => {
      await UserFollowing.deleteOne({
        createdBy: userId,
        followingId: currentUserId
      });
      await UserFollowing.deleteOne({
        createdBy: currentUserId,
        followingId: userId
      });
      await UserFriend.deleteOne({
        friendIds: {
          $all: [currentUserId, userId]
        }
      });
    };
    if (usersBlock) {
      if (userId && !usersBlock.userIds.map((e) => e.toString()).includes(userId.toString())) {
        usersBlock.userIds.push(userId);
        await removeRelation();
        await UserBlock.findByIdAndUpdate(usersBlock._id, {
          userIds: usersBlock.userIds
        });
      } else {
        usersBlock.userIds = usersBlock.userIds.filter((e) => e.toString() !== userId.toString());
        await UserBlock.findByIdAndUpdate(usersBlock._id, {
          userIds: usersBlock.userIds
        });
        message = "Unblock";
      }

    } else {
      await UserBlock.create({
        userIds: [userId],
        createdBy: currentUserId
      });
      await removeRelation();
    }

    return res.json({
      message: message + " user successfully"
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getBlock(req: IRequest, res: Response) {
  try {
    const userBlock = await UserBlock.findOne({ createdBy: req.context.currentUser._id });
    const userIds = userBlock ? userBlock.userIds : [];
    let result: ISimpleUserResponse[] = [];
    if (userIds && userIds.length > 0) {
      const users = await User.find({ _id: userIds });
      result = users.map(serializeSimpleUser);
    }

    return res.json(result);
  } catch (error) {
    return responseError(req, res, error);
  }
}
