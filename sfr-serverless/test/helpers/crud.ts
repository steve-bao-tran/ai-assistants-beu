import { Express } from "express";
import {
  testCreate, testDelete, testDetail,
  testFilterPagination,
  testUpdate
} from "./rest";

export interface IConfigScenarioForCRUD<C, U> {
  name: string;
  path: string;
  formUpdate?: U;
  formCreate: C;
  modelClass: any;
  extendCallback?: any;
}

export function testScenarioForCRUD<C extends object, U extends object>
 (describe, it, chai: Chai.ChaiStatic, app: Express, config: IConfigScenarioForCRUD<C, U>) {
  describe(config.name, () => {
    config.formUpdate = <any> config.formUpdate || config.formCreate;

    testCreate(describe, it, chai.request(app), {
      name: config.name,
      path: config.path,
      form: config.formCreate
    });

    testFilterPagination(describe, it, chai.request(app), {
      name: config.name,
      path: config.path
    });
    let id = null;
    describe("Get Id For Single One", () => {
      it("It should be just get id for one", (done) => {
        config.modelClass.findOne(config.formCreate).then((model) => {
          id = model._id.toString();
          chai.expect(id).to.be.a("string");

          testUpdate(describe, it, chai.request(app), {
            id,
            name: config.name,
            path: config.path,
            form: config.formUpdate,
          });

          testDetail(describe, it, chai.request(app), {
            id,
            name: config.name,
            path: config.path,
          });

          testDelete(describe, it, chai.request(app), {
            id,
            name: config.name,
            path: config.path,
          });

          if (config.extendCallback) {
            config.extendCallback();
          }

          done();
        });
      });
    });

  });
}
