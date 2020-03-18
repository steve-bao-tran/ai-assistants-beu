import * as chai from "chai";
import { IPagingResult } from "../../common";
import { validateResponseSuccessfully } from "./common";
import { HttpClient, Method } from "./http";

const expect = chai.expect;

interface IOptionChai {
  name: string;
  path?: string;
  validateModel?: (done: any, result: any) => void;
}

function wrapDone(done, options: IOptionChai, result) {
  if (options.validateModel) {
    options.validateModel(done, result);
  } else {
    done();
  }
}

export interface IOptionChaiFilter {
  name: string;
  path?: string;
  validateModel?: (done: any, result: any) => void;
  query?: string;
}

export function testFilterPagination(
  describe, it, chaiRequest: ChaiHttp.Agent,
  options: IOptionChaiFilter
) {

  options.path = options.path || "/" + options.name;

  describe(`/GET ${options.name}`, () => {
    it(`Get filter pagination ${options.name}`, (done) => {

      const pagination = (query, callback) => {
        HttpClient(chaiRequest, {
          method: Method.GET,
          path: options.path + (query || "")
        }).end((_err, res) => {
          validateResponseSuccessfully(res);
          const result: IPagingResult<any> = res.body;
          if (options.validateModel) {
            return wrapDone(done, options, result);
          }
          expect(result).to.be.a("object");
          expect(result.data).to.be.a("array");
          expect(result.pagination).to.be.a("object");
          if (callback) {
            callback(result);
          } else {
            wrapDone(done, options, result);
          }
        });
      };

      pagination(options.query, (result: IPagingResult<any>) => {
        // if (result.pagination.nextPageToken) {
        //   pagination("?nextPageToken=" + result.pagination.nextPageToken, null);
        // } else {

        // }
        wrapDone(done, options, result);
      });

    });
  });

}

export interface IOptionChaiCreate<FormCreate> extends IOptionChai {
  form: FormCreate;
}

export function testCreate<FormCreate extends object>(
  describe, it, chaiRequest: ChaiHttp.Agent,
  options: IOptionChaiCreate<FormCreate>
): any {

  options.path = options.path || "/" + options.name;

  describe(`/POST ${options.name}`, () => {
    it(`Create ${options.name}`, (done) => {
      HttpClient(chaiRequest, {
        method: Method.POST,
        path: options.path
      }).send(options.form)
        .end((_err, res) => {
          validateResponseSuccessfully(res);
          const result = res.body;
          expect(result).to.be.a("object");
          wrapDone(done, options, result);
        });
    });
  });

}

export interface IOptionChaiUpdate<FormUpdate> extends IOptionChai {
  form: FormUpdate;
  id: string | number;
}

export function testUpdate<FormUpdate extends object>(
  describe, it, chaiRequest: ChaiHttp.Agent,
  options: IOptionChaiUpdate<FormUpdate>
) {

  options.path = options.path || "/" + options.name;

  describe(`/PUT ${options.name}`, () => {
    it(`Update one ${options.name}`, (done) => {
      HttpClient(chaiRequest, {
        method: Method.PUT,
        path: `${options.path}/${options.id}`
      }).send(options.form)
        .end((_err, res) => {
          validateResponseSuccessfully(res);
          const result = res.body;
          expect(result).to.be.a("object");
          wrapDone(done, options, result);
        });
    });
  });

}

export interface IOptionChaiDetail extends IOptionChai {
  id: string | number;
}

export function testDetail(
  describe, it, chaiRequest: ChaiHttp.Agent,
  options: IOptionChaiDetail
) {
  options.path = options.path || "/" + options.name;

  describe(`/GET ${options.name}`, async () => {
    it(`Get detail ${options.name}`, (done) => {
      HttpClient(chaiRequest, {
        method: Method.GET,
        path: `${options.path}/${options.id}`
      }).end((_err, res) => {
        validateResponseSuccessfully(res);
        const result = res.body;
        expect(result).to.be.a("object");
        wrapDone(done, options, result);
      });
    });
  });

}

export function testDelete(
  describe, it, chaiRequest: ChaiHttp.Agent,
  options: IOptionChaiDetail
) {

  options.path = options.path || "/" + options.name;

  describe(`/DELETE ${options.name}`, () => {
    it(`Delete one ${options.name}`, (done) => {
      HttpClient(chaiRequest, {
        method: Method.DEL,
        path: `${options.path}/${options.id}`
      }).end((_err, res) => {
        validateResponseSuccessfully(res);
        const result = res.body;
        expect(result).to.be.a("object");
        expect(result.message).to.be.a("string");
        wrapDone(done, options, result);
      });
    });
  });

}
