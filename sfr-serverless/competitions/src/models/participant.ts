import * as mongoose from "mongoose";
import { IModelBase, IPhone, PostSchemaName, SchemaBase } from "../../../common";

export enum LinkType {
  Facebook = "facebook",
  Instagram = "instagram",
  YouTube = "youTube"
}

export interface ILink {
  type: LinkType;
  link: string;
}

export interface IParticipant extends IModelBase {
  competitionPostId: string;
  bandName: string;
  bio: string;
  email: string;
  phone: IPhone;
  birthday: Date;

  parentEmail: string;
  phoneOfParent: IPhone;
  relationship: string;

  country: string;
  city: string;
  school: string;

  caption: string;
  language: string;
  genre: string;
  subGenre: string;
  moreInfo: string;
  links: ILink[];
}

export const ParticipantSchemaName = "participants";

const ParticipantSchema = new mongoose.Schema(SchemaBase({
  competitionPostId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: PostSchemaName
  },
  bandName: String,
  bio: String,
  email: String,
  phone: Object,
  birthday: Date,

  parentEmail: String,
  phoneOfParent: Object,
  relationship: String,

  country: String,
  city: String,
  school: String,

  language: String,
  genre: String,
  subGenre: String,
  moreInfo: String,
  links: [Object]
}), {
  timestamps: true
});

export const Participant = mongoose.model<IParticipant>(ParticipantSchemaName, ParticipantSchema);
