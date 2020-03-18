import * as chai from "chai";
import chaiHttp = require("chai-http");
import { Express } from "express";
import { initDBConnection } from "../../common/services";

const expect = chai.expect;

export function validateResponseSuccessfully(res) {
  if (res.status !== 200) {
    console.log(res.error);
  }
  expect(res).have.to.status(200);
}

export function wrapperTest(app: Express, callback: (chai: Chai.ChaiStatic) => void) {

  chai.use(chaiHttp);
  const server = app.listen(process.env.PORT_TEST || 3000);
  initDBConnection(process.env.MONGODB_URL);

  callback(chai);

  server.close();
}
