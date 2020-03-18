import { NextFunction, Response } from "express";
import { IRequest } from "../authentication";
import { responseError } from "../helpers";
import { Permissions } from "../models";
import { ErrorKey } from "../resources";

export function isAdmin(
  req: IRequest, res: Response, next: NextFunction
) {
  const currentUser = req.context.currentUser;
  if (!currentUser) {
    return responseError(req, res, ErrorKey.ProfileNotFound, {
      statusCode: 401
    });
  }
  let permissions: any = currentUser.permissions;
  if (!Array.isArray(permissions)) {
    permissions = permissions ? permissions.split(",") : [];
  }

  if (permissions.includes(Permissions.Admin)) {
    return next();
  }

  return responseError(req, res, ErrorKey.IsAdmin, {
    statusCode: 401
  });

}
