import { Response, Router } from "express";
import * as lodash from "lodash";
import {
  responseError, validateBody, ErrorKey, IRequest,
  Post, PostContentType, PostType, StatusCode
} from "../../../common";
import { detail, getList } from "../business";
import { getCurrentPhase, Competition, Participant, PhaseType } from "../models";
import { JoinCompetitionSchema } from "../schemas";

export function competitionRouter(route: Router) {

  route.get("/competitions", list);
  route.get("/competitions/:id", detail);
  route.post("/competitions/:id/join", validateBody(JoinCompetitionSchema), joinCompetition);

}

async function list(req: IRequest, res: Response) {
  try {
    const query: any = {
      status: StatusCode.Active
    };
    const title = req.query.title;
    if (title) {
      if (/ /g.test(title)) {
        query.$text = {
          $search: title
        };
      } else {
        query.title = { $regex: title, $options: "i" };
      }
    }

    return res.json(await getList(query, req.query));
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function joinCompetition(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    const competition = await Competition.findById(id);
    if (!competition) {
      return responseError(req, res, ErrorKey.RecordNotFound);
    }
    const currentPhase = getCurrentPhase(competition.phases);
    if (!currentPhase || currentPhase && currentPhase.type !== PhaseType.RegisterUpload) {
      return responseError(req, res, ErrorKey.CompetitionNotRegisterUpload);
    }

    const form = req.body;
    const feed = await Post.create({
      title: form.caption,
      attachments: form.attachments,
      type: PostType.CompetitionPost,
      contentType: PostContentType.Normal,
      referenceId: id
    });
    await Participant.create({
      ...lodash.omit(form, ["caption", "attachments"]),
      competitionPostId: feed._id
    });

    return res.json({
      message: "Join competition successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}
