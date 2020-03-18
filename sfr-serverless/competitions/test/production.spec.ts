import { IPagingResult } from "../../common";
import { testCreate, testDelete, testDetail, testFilterPagination, testUpdate, wrapperTest } from "../../test/helpers";
import { app } from "../src";
import { ICompetitionItemResponse, ICompetitionResponse } from "../src/serializers";

const form = {
  title: "Test create competition (unit test)",
  imageUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/public/competition/-1543468667275.jpeg",
  timeline: "timeline",
  rule: "Rule",
  howItWork: "How it works",
  faq: "Faq",
  phases: [
    {
      type: "prepare_works",
      name: "Prepare works period",
      startDate: "2018-11-01",
      endDate: "2018-11-01"
    },
    {
      type: "register_upload",
      name: "Registration & Upload works",
      startDate: "2018-11-01",
      endDate: "2018-11-01"
    },
    {
      type: "vote",
      name: "Voting for Top 10 selection",
      startDate: "2018-11-01",
      endDate: "2018-11-01"
    },
    {
      type: "final_winner",
      name: "Top 10 announced and Poll for final winner",
      startDate: "2018-11-01",
      endDate: "2018-11-01"
    },
    {
      type: "ranking",
      name: "Final ranking announced",
      startDate: "2018-11-01",
      endDate: "2018-11-01"
    }
  ]
};

const formUpdate = {
  title: "Test update competition (unit test)",
  imageUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/public/competition/-1543468667275.download (1).jpeg",
  timeline: "timeline",
  rule: "Rule update",
  howItWork: "How it works",
  faq: "How it works"
};

wrapperTest(app, (chai) => {
  const expect = chai.expect;
  describe("Admin Competitions", () => {

    testFilterPagination(
      describe, it, chai.request(app),
      {
        name: "competitions",
        path: "/admin/competitions"
      }
    );

    testCreate(
      describe, it, chai.request(app),
      {
        form,
        name: "competitions",
        path: "/admin/competitions",
        validateModel: (done, result: ICompetitionResponse) => {
          expect(result.id).to.have.a("string");
          const id = result.id;
          testUpdate(describe, it, chai.request(app), {
            id,
            name: "competitions",
            path: "/admin/competitions",
            form: formUpdate,
            validateModel: (doneUpdate, competition: ICompetitionResponse) => {
              expect(competition.title).to.equal(formUpdate.title);
              expect(competition.rule).to.equal(formUpdate.rule);
              doneUpdate();
            }
          });

          testDetail(describe, it, chai.request(app), {
            id,
            name: "competitions",
            path: "/admin/competitions",
          });

          testDelete(describe, it, chai.request(app), {
            id,
            name: "competitions",
            path: "/admin/competitions",
          });

          done();
        }
      }
    );

  });

  describe("Competitions", () => {

    testFilterPagination(
      describe, it, chai.request(app),
      {
        name: "competitions",
        path: "/competitions",
        validateModel: (done, result: IPagingResult<ICompetitionItemResponse>) => {
          const data = result.data[0];
          if (data) {
            testDetail(describe, it, chai.request(app), {
              name: "competitions",
              id: data.id
            });
          }
          done();
        }
      }
    );

  });

});
