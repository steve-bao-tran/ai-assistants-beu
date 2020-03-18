import { Document, SchemaDefinition, SchemaTypes } from "mongoose";

const UserSchemaName = "users";

export enum StatusCode {
  Active = "active",
  Suspended = "suspended",
  Deleted = "deleted"
}

export interface IPhone {
  phoneCode: string;
  phoneNumber: string;
}

export interface IOptions {
  actorId: string;
  note?: string;
}

export interface IModelBase extends Document {
  _id: string;
  status: StatusCode;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function SchemaBase(schema: SchemaDefinition) {
  const defaultSchema: SchemaDefinition = {
    status: {
      type: String,
      required: true,
      default: StatusCode.Active
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      ref: UserSchemaName
    },
    updatedBy: {
      type: SchemaTypes.ObjectId,
      ref: UserSchemaName
    }
  };

  return {
    ...schema,
    ...defaultSchema
  };
}
