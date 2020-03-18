import { StatusCode } from "../../../common";
import { getCurrentPhase, ICompetition, ICompetitionPhrase } from "../models";

export interface ICompetitionResponse {
  id: string;
  title: string;
  timeline: string;
  rule: string;
  howItWork: string;
  faq: string;
  imageUrl: string;
  phases: ICompetitionPhrase[];
  status: StatusCode;
  currentPhase: ICompetitionPhrase;
}

export function serializerCompetition(model: ICompetition): ICompetitionResponse {
  return {
    id: model._id,
    title: model.title,
    timeline: model.timeline,
    rule: model.rule,
    howItWork: model.howItWork,
    faq: model.faq,
    currentPhase: getCurrentPhase(model.phases),
    imageUrl: model.imageUrl,
    phases: model.phases,
    status: model.status
  };
}

export interface ICompetitionItemResponse {
  id: string;
  title: string;
  imageUrl: string;
  currentPhase: ICompetitionPhrase;
  status: StatusCode;
}

export function serializerCompetitionItem(model: ICompetition): ICompetitionItemResponse {
  return {
    id: model._id,
    title: model.title,
    imageUrl: model.imageUrl,
    currentPhase: getCurrentPhase(model.phases),
    status: model.status
  };
}
