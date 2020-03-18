import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export interface ICompetition extends IModelBase {
  title: string;
  timeline: string;
  phases: ICompetitionPhrase[];
  imageUrl: string;

  rule: string;
  howItWork: string;
  faq: string;
}

export enum PhaseType {
  PrepareWorks = "prepare_works",
  RegisterUpload = "register_upload",
  Vote = "vote",
  FinalWinner = "final_winner",
  Ranking = "ranking"
}

export interface ICompetitionPhrase {
  name: string;
  startDate: Date;
  endDate: Date;
  type: PhaseType;
  imageBanner: string;
  textBanner: string;
}

export const CompetitionSchemaName = "competitions";

const CompetitionSchema = new mongoose.Schema(SchemaBase({
  title: {
    type: String,
    required: true,
    text: true
  },
  imageUrl: String,
  rule: {
    type: String,
    required: true
  },
  howItWork: {
    type: String,
    required: true
  },
  faq: {
    type: String,
    required: true
  },
  phases: [Object]
}), {
  timestamps: true
});

function formatDateToCompare(date = null) {
  date = date || new Date().toLocaleDateString();

  return new Date(date);
}

export function getCurrentPhase(phases: ICompetitionPhrase[]): ICompetitionPhrase {
  if (!phases) {
    return null;
  }

  return phases.filter((e) =>
    (formatDateToCompare(e.endDate) >= formatDateToCompare())
    && (formatDateToCompare(e.startDate) <= formatDateToCompare()))[0] || null;
}

export const Competition = mongoose.model<ICompetition>(CompetitionSchemaName, CompetitionSchema);
