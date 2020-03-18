import { Request, Response } from "express";
import { IUser, StatusCode, User } from "../models";

export type VerifyIdToken = (token: string) => Promise<string>;

export interface IRequestContext {
  currentUser?: IUser;
}

export interface IRequest extends Request {
  context: IRequestContext;
}

export interface IPrivateMiddlewareOptions {
  authIdKey?: string;
}

// authentication
export function privateMiddleware(verify: string | VerifyIdToken, options?: IPrivateMiddlewareOptions) {

  const { authIdKey = "authId" } = { ...options };

  return async (req: IRequest, res: Response, next) => {

    if (req.method.toLowerCase() === "options") {
      return next();
    }

    const token = req.header("Authorization");

    if (!token) {
      console.log("Authorization header is required");

      return res.status(401).send({
        message: "Authorization header is required"
      });
    }

    try {
      const uid: string = typeof verify === "function" ? await verify(token) : verify;

      const user = await User.findOne({ [authIdKey]: uid });
      if (!user) {
        const message = `Can not find user with firebase ID: ${uid}`;

        console.log(message);

        return res.status(401).send({
          message
        });
      }

      if (user.status !== StatusCode.Active) {
        const message = `User is ${user.status}`;

        console.log(message);

        return res.status(401).send({ message });
      }
      req.context.currentUser = user;

      console.log("Log request:");
      console.log("Url: " + req.originalUrl);
      console.log("Method: " + req.method);
      console.log("Headers: " + JSON.stringify(req.headers, null, 2));
      console.log("Payload: " + JSON.stringify({
        body: req.body,
        params: req.params,
        query: req.query
      }, null, 2));

      return next();

    } catch (e) {
      if (!e.statusCode || e.statusCode !== 401) {
        console.error("Authorize error:", e);
      }

      console.log(e.message);

      return res.status(e.statusCode || 401).send(e || {
        message: "Unauthorized"
      });
    }

  };
}

// authorization

// export function authorization(actionName: Action | Action[]) {

//   return (req: IRequest, res: Response, next) => {

//     const { currentUser } = req;
//     if (currentUser && currentUser.superuser) {
//       return next();
//     }

//     if (!currentUser || !currentUser.Role) {
//       return responseError(res, {
//         message: "Unauthorized",
//         code: "unauthorized"
//       }, { statusCode: 401 });
//     }

//     const listActions = currentUser.Role.actions;
//     if (typeof actionName === "string") {
//       if (listActions.includes(actionName)) {
//         return next();
//       }
//     } else if (Array.isArray(actionName)) {
//       if (listActions.some((r: Action) => actionName.includes(r))) {
//         return next();
//       }
//     }

//     return responseError(res, {
//       message: getMessageError("permission"),
//       code: "permission"
//     }, {
//         statusCode: 403
//       });
//   };

// }
