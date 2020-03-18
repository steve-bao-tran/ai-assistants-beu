import { Response, Router } from "express";
import {
  responseError, validateBody, IRequest, StatusCode
} from "../../../common";
import { detail, getList } from "../business";
import { Competition } from "../models";
import { CreateCompetitionSchema, UpdateCompetitionSchema } from "../schemas";
import { serializerCompetition } from "../serializers";

export function competitionAdminRouter(route: Router) {

  route.route("/admin/competitions")
    .get(list)
    .post(validateBody(CreateCompetitionSchema), create);

  route.route("/admin/competitions/:id")
    .get(detail)
    .put(validateBody(UpdateCompetitionSchema), update)
    .delete(remove);

}

async function create(req: IRequest, res: Response) {
  try {

    const form = req.body;
    const competition = await Competition.create(form);

    return res.json(serializerCompetition(competition));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function update(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    const form = req.body;
    const competition = await Competition.findByIdAndUpdate(id, form, {
      new: true
    });

    return res.json(serializerCompetition(competition));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function remove(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    await Competition.findByIdAndUpdate(id, {
      status: StatusCode.Deleted
    });

    return res.json({
      message: "Delete competition successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function list(req: IRequest, res: Response) {
  try {
    return res.json(await getList({
      status: {
        $ne: StatusCode.Deleted
      }
    }, req.query));
  } catch (error) {
    return responseError(req, res, error);
  }
}
