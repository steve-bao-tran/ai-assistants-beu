import { Response, Router } from "express";
import { SchemaLike } from "joi";
import { Document, Model } from "mongoose";
import { IRequest } from "../authentication";
import { responseError } from "../helpers";
import { validateBody } from "../middlewares";
import { StatusCode } from "../models";
import { filterPagination, parsePaginationParams } from "../models/pagination";

export interface IOptionGenerateCRUD<T extends Document> {
  path?: string;
  schemaUpdate?: SchemaLike;
  schemaInsert: SchemaLike;
  serialize: any;
  serializeItem?: any;
  modelClass: Model<T>;
}

export function generateCRUD<M extends Document>(router: Router, options?: IOptionGenerateCRUD<M>) {
  function getPath(uri?: string): string {
    let basePath = "/";
    if (options.path) {
      basePath = options.path;
    }
    if (uri) {
      uri = uri.replace("/", "");
      if (options.path) {
        return `${basePath}/${uri}`;
      }

      return basePath + uri;
    }

    return basePath;
  }
  options.serializeItem = options.serializeItem || options.serialize;

  router.route(getPath())
    .get(listPagination)
    .post(validateBody(options.schemaInsert), insert);

  router.route(getPath("/:id"))
    .get(detail)
    .put(validateBody(options.schemaUpdate || options.schemaInsert), update)
    .delete(remove);

  async function listPagination(req: IRequest, res: Response) {
    try {

      const model = await filterPagination(
        options.modelClass, {},
        parsePaginationParams(req.query)
      );
      model.data = model.data.map(options.serializeItem);

      return res.json(model);
    } catch (error) {
      return responseError(req, res, error);
    }
  }

  async function insert(req: IRequest, res: Response) {
    try {

      const form = req.body;
      const model = options.serialize(await options.modelClass.create(form));

      return res.json(model);
    } catch (error) {
      return responseError(req, res, error);
    }
  }

  async function update(req: IRequest, res: Response) {
    try {

      const form = req.body;
      const id = req.params.id;
      const modelUpdated = options.serialize(await options.modelClass.findByIdAndUpdate(id, form, {
        new: true
      }));

      return res.json(modelUpdated);
    } catch (error) {
      return responseError(req, res, error);
    }
  }

  async function detail(req: IRequest, res: Response) {
    try {

      const id = req.params.id;
      const modelUpdated = options.serialize(await options.modelClass.findById(id));

      return res.json(modelUpdated);
    } catch (error) {
      return responseError(req, res, error);
    }
  }

  async function remove(req: IRequest, res: Response) {
    try {

      const id = req.params.id;
      await options.modelClass.findByIdAndUpdate(id, {
        status: StatusCode.Deleted
      });

      return res.json({
        message: "Delete entire successfully"
      });
    } catch (error) {
      return responseError(req, res, error);
    }
  }

  return router;
}
