import { Response } from "express";
import { validate, SchemaLike, ValidationError, ValidationOptions } from "joi";
import { IRequest } from "../authentication";
import { responseError, IError } from "../helpers";

// validate

function commonValidator(schema: SchemaLike, key: string, options?: ValidationOptions) {

  return (req: IRequest, res: Response, next) => {
    const value = req[key];

    return validate(value, schema, options).then(() => {
      return next();
    }).catch((errors: ValidationError) => {
      const firstError = errors.details[0];
      const error: IError = {
        code: firstError.type,
        message: firstError.message
      };

      return responseError(req, res, error);
    });
  };
}

export function validateParams(schema: SchemaLike, options?: ValidationOptions) {
  return commonValidator(schema, "params", options);
}

export function validateBody(schema: SchemaLike, options?: ValidationOptions) {
  return commonValidator(schema, "body", options);
}

export function validateQuery(schema: SchemaLike, options?: ValidationOptions) {
  return commonValidator(schema, "query", options);
}

export function validateHeader(schema: SchemaLike, options?: ValidationOptions) {
  return commonValidator(schema, "headers", options);
}
