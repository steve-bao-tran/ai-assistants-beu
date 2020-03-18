import { Permissions, Provider, Role } from "../../../common";

export interface IUserFormCreate {
  username: string;
  email: string;
  role: Role;
  country: string;
  authId: string;
  permissions: Permissions[];
  provider: Provider;
}

export interface IUserFilter {
  roles?: string[];
  profession?: string[];
  name?: string;
}
