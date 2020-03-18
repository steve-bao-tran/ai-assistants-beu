import { IPagingResult } from "../../common";
import { ISimpleUserResponse } from "../../common/serializers";
import {
  testDetail, testFilterPagination, validateResponseSuccessfully,
  wrapperTest, HttpClient, Method
} from "../../test/helpers";
import { app } from "../src";

wrapperTest(app, (chai) => {

  const expect = chai.expect;

  describe("Relation User", () => {

    describe("/GET List Following", () => {
      it("Get following for user", (done) => {
        HttpClient(chai.request(app), {
          method: Method.GET,
          path: "/me/following"
        }).end((_error, res) => {
          validateResponseSuccessfully(res);
          expect(res.body).to.have.a("array");
          done();
        });
      });
    });

    describe("/GET List Followers", () => {
      it("Get followers for user", (done) => {
        HttpClient(chai.request(app), {
          method: Method.GET,
          path: "/me/followers"
        }).end((_error, res) => {
          validateResponseSuccessfully(res);
          expect(res.body).to.have.a("array");
          done();
        });
      });
    });

    testFilterPagination(describe, it, chai.request(app), {
      name: "Search User",
      path: "/users?name=nhut dev"
    });

    testFilterPagination(describe, it, chai.request(app), {
      name: "Search User",
      path: "/users",
      validateModel: (done, result: IPagingResult<ISimpleUserResponse>) => {
        expect(result).to.have.a("object");
        expect(result.data).to.have.a("array");
        if (result.data.length > 0) {
          const data = result.data[0];
          const id = data.id;
          testDetail(describe, it, chai.request(app), {
            id,
            name: "Get Other Profile",
            path: "/users"
          });

        }
        done();
      }
    });

  });

});
