import * as chai from "chai";
import * as request from "superagent";

export enum Method {
  POST = "post",
  GET = "get",
  PUT = "put",
  DEL = "del",

}

export interface IOptionHttpClient {
  method: Method;
  path: string;
  disableLive?: boolean;
}

export function HttpClient(agent: ChaiHttp.Agent, options: IOptionHttpClient): request.Request {
  if (!options.disableLive && process.env.TEST_MODE === "live") {
    agent = chai.request(process.env.host);
  }

  return agent[options.method](options.path)
    .set("Authorization", process.env.TOKEN || "")
    .set("Content-Type", "application/json");
}
