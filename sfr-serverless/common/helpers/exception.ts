import { Response } from "express";
import { IRequest } from "../authentication";
import { getMessageError } from "../resources/errors";

export interface IError {
  code?: string;
  message?: string;
  debugMessage?: string;
}

export interface IOptionError {
  statusCode?: number;
}

function parseError(error: any): IError {
  const result: IError = {};
  result.code = error.code || "internal_error";
  result.message = error.message || "INTERNAL ERROR";
  if (error.debugMessage) {
    result.debugMessage = error.debugMessage;
  }

  return result;
}

export function responseError(
  req: IRequest, res: Response, error: any,
  options: IOptionError = { statusCode: 400 }
): any {
  console.error("------------------------ Response Error ------------------------");
  console.log("Error string: ", {
    error,
    request: req.url
  });
  const statusCode = options.statusCode;
  if (typeof error === "string") {
    return res.status(statusCode).json(parseError({
      code: error,
      message: getMessageError(error)
    }));
  }
  if (typeof error === "object") {
    const errorCode = error.code || "error_unknown";

    return res.status(statusCode).json(parseError({
      code: errorCode,
      message: error.message || getMessageError(errorCode),
      debugMessage: error.message || error.stack
    }));
  }
  if (Array.isArray(error)) {
    const errors = error.map(parseError);

    return res.status(400).json({ errors });
  }

  return res.status(statusCode).json(parseError(error));

}
