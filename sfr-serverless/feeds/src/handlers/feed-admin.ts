import { Response, Router } from "express";
import {
  filterPagination, generateCRUD,
  parseDataPopulate,
  responseError, validateBody, ErrorKey, IRequest,
  Post,
  PostContentType,
  PostType,
  StatusCode,
  User
} from "../../../common";
import { middlewareCheckFeed, parseFeeds, parseFeedDetail } from "../business";
import { IFeedCreateForm, ReportCategory, ReportPost } from "../models";
import { FeedCreateSchema, FeedUpdateSchema, ReportCategoryCreateSchema } from "../schemas";
import { serializeReportCategory } from "../serializers";
import { serializeFeedAdmin, serializeFeedItemAdmin } from "../serializers/feed-admin";
import { serializeReportPost, serializeReportPostItem } from "../serializers/report-post";
import { deleteComment } from "./feed";

export function feedRouterAdmin(router: Router) {
  router.route("/feeds")
    .post(validateBody(FeedCreateSchema), createFeed)
    .get(getList);

  router.route("/feeds/:id")
    .get(getDetail)
    .delete(deleteFeed)
    .put(validateBody(FeedUpdateSchema), updateFeed);

  router.route("/feeds/:id/comments/:commentId")
    .delete(middlewareCheckFeed, deleteComment);

  generateCRUD(router, {
    path: "/report-categories",
    modelClass: ReportCategory,
    schemaInsert: ReportCategoryCreateSchema,
    serialize: serializeReportCategory
  });

  router.route("/report-posts")
    .get(getListReports);

  router.route("/report-posts/:id")
    .get(getDetailReport);
}

async function createFeed(req: IRequest, res: Response) {
  try {

    const form: IFeedCreateForm = req.body;
    form.createdBy = req.context.currentUser._id;
    form.type = PostType.Normal;
    form.contentType = PostContentType.Normal;

    const feed = await Post.create(form);

    return res.json(serializeFeedAdmin(await parseFeedDetail(feed)));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getDetail(req: IRequest, res: Response) {
  try {
    const feedId = req.params.id;
    const feed = await Post.findById(feedId).populate("createdBy");
    if (!feed) { return responseError(req, res, ErrorKey.RecordNotFound); }

    return res.json(serializeFeedAdmin(await parseFeedDetail(feed)));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function deleteFeed(req: IRequest, res: Response) {
  try {
    const feedId = req.params.id;
    await Post.findByIdAndUpdate(feedId, {
      status: StatusCode.Deleted
    });

    return res.json({
      message: "Delete feed successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function updateFeed(req: IRequest, res: Response) {
  try {
    const feedId = req.params.id;
    const form = req.body;
    const feed = await Post.findByIdAndUpdate(feedId, form, {
      new: true
    }).populate("createdBy");

    return res.json(serializeFeedAdmin(await parseFeedDetail(feed)));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getList(req: IRequest, res: Response) {
  try {
    const filter: any = {
      status: {
        $in: [StatusCode.Active, StatusCode.Suspended]
      },
    };
    const title = req.query.title;
    if (title) {
      if (/ /g.test(title)) {
        filter.$text = {
          $search: req.query.title
        };
      } else {
        filter.title = {
          $regex: title,
          $options: "i"
        };
      }
    }
    if (req.query.isFeatured) {
      filter.isFeatured = req.query.isFeatured;
    }

    const models = await filterPagination(Post, filter, {
      ...req.query,
      sort: { createdAt: -1 }
    });
    models.data = <any> (await parseFeeds(models.data, {
      actorId: req.context.currentUser._id
    }));

    const result = {
      data: models.data.map(serializeFeedItemAdmin),
      pagination: models.pagination
    };

    return res.json(result);
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getListReports(req: IRequest, res: Response) {
  try {

    const reports = await filterPagination(ReportPost, {}, {
      ...req.query,
      sort: {
        createdAt: -1
      }
    });
    const users = await User.find({ _id: { $in: reports.data.map((e) => e.createdBy) } });
    const feedIds = reports.data.map((e) => e.referenceId);
    const feeds = (await parseFeeds(await Post.find({
      _id: { $in: feedIds }
    }))).map(serializeFeedItemAdmin);

    return res.json({
      data: reports.data.map((e) => ({
        ...e.toJSON(),
        post: feeds.find((f) => f.id.toString() === e.referenceId.toString()),
        owner: users.find((f) => f._id.toString() === e.createdBy.toString())
      })).map(serializeReportPostItem),
      pagination: reports.pagination
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getDetailReport(req: IRequest, res: Response) {
  try {

    const reportId = req.params.id;
    const report = parseDataPopulate(await ReportPost.findById(reportId).populate("createdBy"), [{
      field: "createdBy",
      replaceField: "owner"
    }]);
    const post = serializeFeedAdmin(await parseFeedDetail(await Post.findById(report.referenceId)));

    return res.json(serializeReportPost({
      ...report,
      post
    }));

  } catch (error) {
    return responseError(req, res, error);
  }
}
