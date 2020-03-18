import { NextFunction, Response } from "express";
import { IRequest } from "../authentication";

export function LoggerMiddleware(
  req: IRequest,
  _res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV && process.env.NODE_ENV === "unit_test") {
    return next();
  }
  console.log("--------------------------- Log request ---------------------------");
  parseLogger(req, _res);

  return next();
}

export function parseLogger(req: IRequest, _res: Response) {
  console.log("Url: " + req.url);
  console.log("Method: " + req.method);
  console.log("Headers: " + JSON.stringify(req.headers, null, 2));
  console.log("Payload: " + JSON.stringify({
    body: req.body,
    params: req.params,
    query: req.query
  }, null, 2));
}
