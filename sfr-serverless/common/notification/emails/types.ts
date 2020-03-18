export enum EmailTemplateType {
  NewUser = "new_user"
}

export interface IParamBasicTemplateEmail {
  title?: {
    [key: string]: string
  };
  content?: {
    [key: string]: string
  };
}

export interface IParamTemplateEmail {
  title: string;
  content: string;
}

export interface ITemplateEmail {
  [key: string]: IParamTemplateEmail;
}
