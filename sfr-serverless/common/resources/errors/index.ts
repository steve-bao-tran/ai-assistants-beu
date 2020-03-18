
import resourcesError from "./en";

export * from "./types";

export interface IOptionMessageError {
  params?: object;
}

export function getMessageError(key: string, opts: IOptionMessageError = {}): string {
  const message = resourcesError[key];
  if (!message) {
    return getMessageError("error_unknown");
  }

  return opts.params ? parseMessageError(message, opts.params) : message;
}

export function parseMessageError(message: string, params: object): string {
  const delimiterLeft = "{{";
  const delimiterRight = "}}";
  const keyParams = Object.keys(params);
  if (keyParams.length === 0) {
    return message;
  }
  keyParams.forEach((e) => {
    message = message.replace(delimiterLeft + e + delimiterRight, params[e]);
  });

  return message;
}
