import { NextFunction, Response } from "express";
import { IRequest } from "../authentication";

export function ErrorHandlerMiddleware(
  error: Error,
  _req: IRequest,
  res: Response,
  next: NextFunction
) {
  if (error) {
    console.error(error);

    return res.status(500).json({
      code: "internal",
      message: error.message,
      debugMessage: error.stack
    });
  }

  return next();
}
