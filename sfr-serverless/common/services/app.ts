import * as bodyParser from "body-parser";
import * as cors from "cors";
import { Express } from "express";
import {
  ErrorHandlerMiddleware, FakeAuthMiddleware,
  LoggerMiddleware, MongoMiddleware
} from "../middlewares";

export function initialApp(app: Express) {

  app.use(bodyParser.json());

  app.use(cors({
    allowedHeaders: ["Content-Encoding", "Accept-Encoding"]
  }));

  app.use(MongoMiddleware);

  app.use(LoggerMiddleware);

  if (process.env.IS_OFFLINE) {
    app.use(FakeAuthMiddleware);
  }

  app.use(ErrorHandlerMiddleware);

}
