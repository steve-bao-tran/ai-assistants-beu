// init app
import { serverlessHandler } from "../common/services/serverless";
import { app } from "./src";

export const handler = serverlessHandler(app);
