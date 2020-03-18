import { replace } from "lodash";
import { INotificationInput, IPushNotificationParams } from "./types";

export interface ISerializationOptions {
  language?: string;
  formatParams?: (params: INotificationInput) => INotificationInput;
}

export interface IReplaceParams {
  [key: string]: string;
}

export type ILocaleData = string | { [key: string]: string };

export function getLocaleString(input: ILocaleData, lang = "en"): string {

  return typeof input === "string" ? input : input[lang];
}

/**
 * Replaces list dictionary key => value with pattern
 *
 * @param  {string} input       Input text
 * @param  {Object} params      Key value params
 *
 * @return {string}             Result output string
 */
function replaceParams(input, params) {
  return Object.keys(params).reduce((result, k) => {
    const val = params[k];

    return replace(result, `{{${k}}}`, val);
  }, input);
}

export function replaceNotificationParams<T = IPushNotificationParams>(
  form: IPushNotificationParams, params: IReplaceParams): T {

  return <any> {
    ...form,
    headings: typeof form.headings === "object" ? Object.keys(form.headings).reduce((o, k) =>
      ({ ...o, [k]: replaceParams(form.headings[k], params) }), {})
      : replaceParams(form.headings, params),
    contents: typeof form.contents === "object" ? Object.keys(form.contents).reduce((o, k) =>
      ({ ...o, [k]: replaceParams(form.contents[k], params) }), {})
      : replaceParams(form.contents, params),
  };
}

export function validateNotificationForm(
  params: INotificationInput, options?: ISerializationOptions): IPushNotificationParams {

  if (options && options.formatParams) {
    params = options.formatParams(params);
  }
  const opts = { language: "en", ...options };
  const headings = typeof params.title === "object" ? params.title
    : {
      en: params.title,
      vi: params.title,
    };
  const contents = typeof params.content === "object" ? params.content : {
    en: params.content,
    vi: params.content,
  };

  return <any> {
    headings,
    contents,
    data: {
      title: getLocaleString(headings, opts.language),
      content: getLocaleString(contents, opts.language),
      ...params
    },
    ios_badgeType: "Increase",
    ios_badgeCount: 1
  };
}

// export function validateEmailForm(
//   params: IValidateEmailFormInput, _options?: ISerializationOptions): IPushNotificationParams {

//   // const opts = { ...options, language: "en" };
//   const emailSubject = params.title;
//   const emailBody = params.content;

//   return <any> {
//     email_body: emailBody,
//     email_subject: emailSubject,
//     isEmail: true
//   };
// }
