import * as lodash from "lodash";
import { newUserTemplate } from "./templates";
import { EmailTemplateType, IParamBasicTemplateEmail, ITemplateEmail } from "./types";
export * from "./types";

export const emailTemplates: ITemplateEmail = {
  [EmailTemplateType.NewUser.toString()]: {
    title: "Email inform the new user to admin users",
    content: newUserTemplate
  }
};

export interface IParamEmail {
  type: EmailTemplateType;
  params?: IParamBasicTemplateEmail;
}

export function parseParam(params: object, text: string) {
  if (params && Object.keys(params).length > 0) {
    Object.keys(params).forEach((e) => {
      text = text.replace(`{{${e}}}`, params[e]);
    });
  }

  return text;
}

export function parseDataEmail(options: IParamEmail) {
  const emailTemplate = lodash.cloneDeep(emailTemplates[options.type]);
  if (!emailTemplate) { return null; }
  const keysEmailTemplate = Object.keys(emailTemplate);
  const paramsTemplate = options.params;
  if (paramsTemplate) {
    Object.keys(paramsTemplate).forEach((e) => {
      if (paramsTemplate[e] && keysEmailTemplate.includes(e)) {
        emailTemplate[e] = parseParam(paramsTemplate[e], emailTemplate[e]);
      }
    });
  }

  return {
    emailBody: emailTemplate.content,
    emailSubjectTitle: emailTemplate.title
  };
}
