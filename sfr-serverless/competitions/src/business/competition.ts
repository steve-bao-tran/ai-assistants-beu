import { Response } from "express";
import { filterPagination, responseError, IRequest } from "../../../common";
import { Competition } from "../models";
import { serializerCompetition, serializerCompetitionItem } from "../serializers";

export async function getList(query, pagingQuery) {
  const result = await filterPagination(Competition, query, {
    ...pagingQuery,
    sort: {
      createdAt: -1
    }
  });
  result.data = <any> result.data.map(serializerCompetitionItem);

  return result;
}

export async function detail(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    const model = await Competition.findById(id);

    return res.json(serializerCompetition(model));

  } catch (error) {
    return responseError(req, res, error);
  }
}
