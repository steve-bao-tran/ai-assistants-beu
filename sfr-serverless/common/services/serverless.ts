
import { Express } from "express";
import * as serverless from "serverless-http";
import { IRequest } from "../authentication";

export const serverlessHandler = (app: Express) => serverless(app, {
  request(request: IRequest, event) {
    request.context = {
      ...request.context,
      currentUser: event.requestContext.authorizer,
    };

    if (event.httpMethod !== "GET" && event.body) {
      request.body = JSON.parse(event.body);
    }
  }
});
