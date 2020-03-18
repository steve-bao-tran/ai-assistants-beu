import { NextFunction, Response } from "express";
import { IRequest } from "../authentication";
import { Permissions, StatusCode, User } from "../models";
// testsfr@gmail.com
export const EmailFakeAuth = "tranvannhut4495@gmail.com";

export function FakeAuthMiddleware(
  req: IRequest,
  _res: Response,
  next: NextFunction
) {
  const emailFakeAuthFromHeader = req.headers.emailFakeAuth;
  const email = emailFakeAuthFromHeader || process.env.EMAIL_FAKE_AUTH || EmailFakeAuth;
  const userInput = {
    email,
    authId: "aPyje3yeo2UGIYbzP7KBo8wFl5x1",
    username: "testsfr",
    firstName: "Test",
    lastName: "Soundfyr",
    country: "Singapore",
    status: StatusCode.Active,
    permissions: [Permissions.Admin]
  };

  return User.findOne({ email, status: StatusCode.Active })
    .then((u) => u || User.create(userInput))
    .then((u) => {
      req.context = req.context || {};
      req.context.currentUser = u;
      next();
    }).catch(next);
}
