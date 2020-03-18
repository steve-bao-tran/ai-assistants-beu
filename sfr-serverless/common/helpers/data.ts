export const DEFAULT_TIMEZONE = "Asia/Singapore";
export const DEFAULT_DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

export function safeParseInt(input: string | number, defaultValue: number = null): number {

  if (!input || typeof input === "number") {
    return <number> Math.floor(<number> input || defaultValue);
  }

  try {
    return parseInt(<string> input, 10);
  } catch {
    return defaultValue;
  }
}

export function isEmptyObject(input: object): boolean {

  return !input || (typeof input === "object"
    && !Array.isArray(input)
    && Object.keys(input).length === 0);
}

export function skipValueObject(input: object, valueSkip = [null, undefined]): object {

  if (isEmptyObject(input)) {
    return {};
  }

  return Object.keys(input).reduce((o, k) =>
    valueSkip.indexOf(input[k]) !== -1 ? o : { ...o, [k]: input[k] },
    {});
}

export function safeParseJSON<T = any>(input: string | T, defaultValue = {}): T {

  try {
    const result = typeof input === "string" ? JSON.parse(input) : input;

    return result || defaultValue;
  } catch (e) {

    return <T> defaultValue;
  }
}

export function toISOString(input: string | Date): string {
  if (!input) {
    return null;
  }

  return typeof input === "string" ? input : (<Date> input).toISOString();
}

export function toDateString(input: string | Date): string {
  if (!input) {
    return null;
  }
  input = new Date(input);

  return (<Date> input).toLocaleString();
}

export interface IKeyPopulate {
  field: string;
  replaceField: string;
}

export function parseDataPopulate(model: any, keys: IKeyPopulate[]): any {
  if (isEmptyObject(model)) {
    return model;
  }
  model = model.toJSON ? model.toJSON() : model;

  keys.forEach((e) => {
    model[e.replaceField] = model[e.field];
    if (!isEmptyObject(model[e.replaceField]) && model[e.replaceField] && model[e.replaceField]._id) {
      model[e.field] = model[e.replaceField]._id;
    }
  });

  return model;
}
