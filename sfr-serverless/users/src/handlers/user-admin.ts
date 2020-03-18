import { Response, Router } from "express";
import * as lodash from "lodash";
import {
  filterPagination, isAdmin, parseSort,
  responseError, validateBody, validateHeader,
  ErrorKey, HeaderAuthorizationSchema, IRequest, Permissions,
  Provider, StatusCode, User, UsernameAccountOfficial, UserFollowing
} from "../../../common";
import {
  createFirebaseUser, deleteFirebaseUser,
  getFirebaseUserByIds, listUsersFirebase, verifyFirebaseToken
} from "../../../common/authentication";
import {
  followDefaultAccounts, getDetail, getList,
  parseCountFeatureFeed, parseParamFullTextSearch, parseProfiles, updateUser
} from "../business";
import { UserFriend } from "../models";
import { CreateUserAdminSchema, UpdateUserAdminSchema } from "../schemas/user-admin";
import { serializerAdminSimpleUser, serializerAdminUser } from "../serializers";

export function userAdminRouter(route: Router) {

  route.route("/admin/me")
    .get(
      validateHeader(HeaderAuthorizationSchema, {
        allowUnknown: true
      }),
      getProfile
    );
  route.route("/admin/users/:id")
    .all(isAdmin)
    .get(detail)
    .delete(del)
    .put(validateBody(UpdateUserAdminSchema), update);
  route.route("/admin/users")
    .all(isAdmin)
    .get(list)
    .post(validateBody(CreateUserAdminSchema), create);
  route.route("/admin/setup-account-official")
    .all(isAdmin)
    .patch(setupAccountOfficial);
  route.route("/admin/check-sync-account-firebase")
    .get(checkSyncAccountFirebase);

  route.route("/admin/convert-to-lower-case")
    .get(convertToLowerCase);

}

export async function getProfile(req: IRequest, res: Response) {
  try {

    const token = req.headers.authorization;
    const authId = await verifyFirebaseToken(token);
    const user = await User.findOne({ authId });
    if (user && !user.permissions.includes(Permissions.Admin)) {
      return responseError(req, res, ErrorKey.IsAdmin);
    }
    if (!user) {
      return responseError(req, res, ErrorKey.ProfileNotFound, {
        statusCode: 404
      });
    }
    const [result] = await parseProfiles([user]);

    return res.json(serializerAdminUser(result));
  } catch (error) {
    console.log("Error Get Profile", error);

    return responseError(req, res, ErrorKey.Unauthorized, {
      statusCode: 401
    });
  }
}

async function list(req: IRequest, res: Response) {
  try {
    let sort = req.query.sort ? req.query.sort.split(",") : null;
    if (sort) {
      sort = parseSort(sort);
    }
    const exportX = req.query.export;
    req.query = lodash.omit(req.query, ["sort", "export"]);
    const query = parseParamFullTextSearch(req.query);
    if (query.$or) {
      query.$or.push({ email: { $regex: req.query.name, $options: "i" } });
    }
    const result = await getList(query, req.query, sort);
    if (result.data.length > 0) {
      let users = await parseProfiles(result.data);
      if (!exportX) {
        const data = await getFirebaseUserByIds(users.map(e => e.authId));
        users = users.map(e => ({
          ...e,
          emailVerified: data
            .filter(d => d && d.uid === e.authId)
            .map(m => m.emailVerified)[0] || false
        }));
      }

      users = await parseCountFeatureFeed(users);
      result.data = <any> users.map(serializerAdminSimpleUser);
    }

    return res.json(result);
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function detail(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    const result = await getDetail(id);

    return res.json(result);
  } catch (error) {
    return responseError(req, res, error);
  }

}

async function create(req: IRequest, res: Response) {
  try {
    const form = req.body;
    form.provider = form.provider || Provider.Email;
    form.username = form.username.toLocaleLowerCase();
    const [checkEmail, checkUsername, checkAuthIdExisted] = await Promise.all([
      <any> User.findOne({
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
    const userFirebase = await createFirebaseUser(form);
    const newUser = await User.create({
      ...lodash.omit(form, ["password", "emailVerified"]),
      authId: userFirebase.uid
    });

    await followDefaultAccounts(newUser);

    return res.json(serializerAdminUser(newUser));
  } catch (error) {
    return responseError(req, res, error);
  }

}

async function update(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    const formUser = req.body;
    const result = await updateUser(id, formUser);

    return res.json(result);
  } catch (error) {
    return responseError(req, res, error);
  }

}

async function del(req: IRequest, res: Response) {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, {
      status: StatusCode.Deleted
    }, { new: true })
      .then((user) => {
        if (!user) {
          return responseError(req, res, ErrorKey.RecordNotFound);
        }

        return deleteFirebaseUser(user.authId);
      })
      .catch((error) => {
        return responseError(req, res, error);
      });

    return res.json({
      message: "Delete user successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function setupAccountOfficial(req: IRequest, res: Response) {
  try {
    const account = await User.find({
      username: { $in: UsernameAccountOfficial },
      status: StatusCode.Active
    });
    // if (!account) {
    //   const userFirebase = await createFirebaseUser({
    //     email: EmailAccountOfficial,
    //     password: PasswordAccountOfficial,
    //     emailVerified: true
    //   });
    //   account = await User.create({
    //     username: UsernameAccountOfficial,
    //     role: Role.Fan,
    //     email: EmailAccountOfficial,
    //     country: listCountries[0].countryName,
    //     authId: userFirebase.uid
    //   });
    // }

    const users = await filterPagination(User, {
      status: StatusCode.Active,
      username: {
        $nin: UsernameAccountOfficial
      }
    }, req.query);
    const needFriends = [];
    if (account.length > 0 && users.data.length > 0) {
      const followers = await UserFollowing.find({
        followingId: { $in: account.map(e => e._id) }
      });

      await Promise.all(<any> users.data.map((e) => {

        if (followers.length > 0) {
          const friend = followers.find(f => f.createdBy.toString() === e._id.toString());
          if (friend) {
            needFriends.push(friend);
          }
        }

        return account.map(a => {
          const data = {
            createdBy: a._id,
            followingId: e._id,
            status: StatusCode.Active
          };

          return UserFollowing.findOneAndUpdate(data, data, { upsert: true });
        });

      }).reduce((pre, cre) => {
        return pre.concat(cre);
      }, []));

      if (needFriends.length > 0) {
        await Promise.all(needFriends.map(e => {
          return UserFriend.findOne({ friendIds: { $all: [e.followingId, e.createdBy] } }).then((data) => {
            if (!data) { return UserFriend.create({ friendIds: [e.followingId, e.createdBy] }); }

            return null;
          });
        }));
      }
    }

    return res.json({
      countNeedFriends: needFriends.length,
      pagination: users.pagination
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function checkSyncAccountFirebase(req: IRequest, res: Response) {
  try {
    const listUsersResult = await listUsersFirebase(req.query.pageSize, req.query.pageToken);
    const result: any = {};
    let users = listUsersResult ? listUsersResult.users : [];
    result.usersFirebase = users.length;
    if (users && users.length > 0) {
      const usersToCheck = await User.find({
        authId: { $in: users.map((e) => e.uid.toString()) },
        status: StatusCode.Active
      });
      users = users.filter((e) => !usersToCheck.find((c) => c.authId.toString() === e.uid.toString()));
      await Promise.all(users.map(
        (e) => deleteFirebaseUser(e.uid)
      ));
      result.usersDontMatch = users.length;
    }

    return res.json({
      data: result,
      pageToken: listUsersResult.pageToken
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function convertToLowerCase(req: IRequest, res: Response) {
  try {
    const models = await filterPagination(User, {
      username: {
        $regex: /[A-Z]/,
        $options: "g"
      },
      status: StatusCode.Active
    }, req.query);
    const checkExist = await User.find({
      username: {
        $in: models.data.map(e => e.username.toLocaleLowerCase())
      },
      status: StatusCode.Active
    });
    const converted = await Promise.all(<any>
      models.data
        .filter(e =>
          !checkExist.map(c => c.username).includes(e.username.toLocaleLowerCase())
        )
        .map(e => ({
          username: e.username,
          _id: e.id
        }))
        .map(e => User.findByIdAndUpdate(e._id, { username: e.username.toLocaleLowerCase() }))
    );

    return res.json({
      converted: converted.length,
      accountDuplicate: models.data
        .filter(e => checkExist.map(c => c.username).includes(e.username.toLocaleLowerCase()))
        .map(e => (
          {
            username: e.username,
            usernameUpperCase: checkExist.find(c => c.username === e.username.toLocaleLowerCase()).username
          }
        )),
      pagination: models.pagination
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}
