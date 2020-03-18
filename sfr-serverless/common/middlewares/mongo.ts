import { NextFunction, Response } from "express";
import { IRequest } from "../authentication";
import { initDBConnection } from "../services";

export function MongoMiddleware(
  _req: IRequest,
  _res: Response,
  next: NextFunction
) {
  return initDBConnection()
    .then((_) => next()).catch(next);
}
