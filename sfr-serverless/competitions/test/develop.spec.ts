import { FileTypes, IPagingResult, Post } from "../../common";
import { testCreate, testDetail, testFilterPagination, testUpdate, wrapperTest } from "../../test/helpers";
import { app } from "../src";
import { Competition, LinkType, Participant, PhaseType } from "../src/models";
import { ICompetitionItemResponse, ICompetitionResponse } from "../src/serializers";

const date = new Date();
const nextDate = new Date();
nextDate.setDate(nextDate.getDate() + 1);

const form = {
  title: "Test create competition (unit test)",
  imageUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/public/competition/-1543468667275.jpeg",
  rule: "Rule",
  howItWork: "How it works",
  faq: "Faq",
  phases: [
    {
      type: PhaseType.PrepareWorks,
      name: "Prepare works period",
      startDate: "2018-11-01",
      endDate: "2018-11-01",
      imageBanner: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/public/competition/-1543468667275.jpeg",
      textBanner: "ok"
    },
    {
      type: PhaseType.RegisterUpload,
      name: "Registration & Upload works",
      startDate: date.toLocaleDateString(),
      endDate: nextDate.toLocaleDateString()

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
  rule: "Rule update",
  howItWork: "How it works",
  faq: "How it works"
};

const formJoinCompetition = {
  bandName: "band",
  bio: "test",
  birthday: new Date().toUTCString(),
  parentEmail: "test@gmail.com",
  phoneOfParent: {
    phoneNumber: "192321838123",
    phoneCode: "+83"
  },
  relationship: "parent",
  country: "VN",
  city: "test",
  school: "test",
  language: "VN",
  genre: "test",
  subGenre: "test",
  moreInfo: "test",
  links: [{ type: LinkType.Facebook, link: "https://tranvannhut.com" }],
  caption: "test for join competition by nhutdev",
  attachments: [
    {
      fileName: "file name for testing video (unit test)",
      fileType: FileTypes.Video,
      fileSize: 123123123,
      fileUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/feed_5c0643871bb39a1e4fc902c6_1544081737342.mp4",
      thumbnailUrl: "test"
    }
  ]
};

wrapperTest(app, (chai) => {
  const expect = chai.expect;
  let id;
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
          id = result.id;
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
            path: "/admin/competitions"
          });

          testCreate(describe, it, chai.request(app), {
            name: "competitions",
            path: `/competitions/${id}/join`,
            form: formJoinCompetition
          });

          after(async () => {
            await Competition.findByIdAndDelete(id);
            const post = await Post.findOne({
              title: formJoinCompetition.caption
            });
            if (post) {
              await Post.findByIdAndDelete(post._id);
              await Participant.deleteOne({
                competitionPostId: post._id
              });
            }
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
        path: "/competitions?title=test"
      }
    );

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
