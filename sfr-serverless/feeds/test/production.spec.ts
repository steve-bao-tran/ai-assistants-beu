
import { ErrorKey, FileTypes, IPagingResult } from "../../common";
import {
  testCreate, testDetail,
  testFilterPagination, validateResponseSuccessfully, wrapperTest, HttpClient, Method
} from "../../test/helpers";
import { app } from "../src";
import { IFeedItemResponse, IFeedResponse } from "../src/serializers";
import { IFeedItemAdminResponse } from "../src/serializers/feed-admin";
import { IReportPostResponse } from "../src/serializers/report-post";

const formCreateFeed = {
  title: "nhut dev test create post (unit test)",
  attachments: [
    {
      fileName: "file name for testing video (unit test)",
      fileType: FileTypes.Video,
      fileSize: 123123123,
      fileUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/feed_5c0643871bb39a1e4fc902c6_1544081737342.mp4",
      thumbnailUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/feed_5bfb6bc4bfe338d920f40428_1544688852235.jpeg",
      metadata: {
        height: 300,
        width: 300
      }
    }
  ],
};
const formCommentFeed = {
  content: "Comment to test comment by nhut dev (unit test)"
};
const formReportFeed = {
  comment: "Comment to test report feed by nhut dev (unit test)"
};

wrapperTest(app, (chai) => {
  const expect = chai.expect;
  // test for admin

  describe("Report Posts", () => {
    testFilterPagination(describe, it, chai.request(app), {
      name: "ReportPosts",
      path: "/admin/report-posts",
      validateModel: (done, result: IPagingResult<IReportPostResponse>) => {

        if (result && result.data && result.data.length > 0) {
          const data = result.data[0];
          expect(data.post.status).to.have.a("string");
          testDetail(describe, it, chai.request(app), {
            name: "ReportPosts",
            path: "/admin/report-posts",
            id: data.id
          });

          return done();
        }

        return done();
      }
    });

  });

  describe("Feed Admin", () => {
    testFilterPagination(describe, it, chai.request(app), {
      name: "Feed",
      path: "/admin/feeds",
      validateModel: (done, result: IPagingResult<IFeedItemAdminResponse>) => {
        if (result.data && result.data.length > 0) {
          expect(result.data[0].status).to.have.a("string");
        }
        done();
      }
    });
  });

  // test for user
  describe("Feed", () => {

    describe("/GET Feed", () => {
      it("Get filter pagination feed", (done) => {

        HttpClient(chai.request(app), {
          method: Method.GET,
          path: "/feeds"
        }).end((_err, res) => {
          validateResponseSuccessfully(res);
          const result = res.body;
          expect(result).to.be.a("object");
          expect(result.data.pinnedPosts).to.be.a("array");
          expect(result.data.posts).to.be.a("array");
          if (result.data.posts.length > 0) {
            const post: IFeedItemResponse = result.data.posts[0];
            expect(post.owner.isFollowing).to.have.a("boolean");
          }
          expect(result.pagination).to.be.a("object");
          done();
        });

      });
    });

    testFilterPagination(describe, it, chai.request(app), {
      name: "Feed",
      path: "/feeds",
      query: "?title=test",
      validateModel: (done, result) => {
        expect(result).to.be.a("object");
        expect(result.data.pinnedPosts).to.be.a("array");
        expect(result.data.posts).to.be.a("array");
        if (result.data.posts.length > 0) {
          const post: IFeedItemResponse = result.data.posts[0];
          expect(post.owner.isFollowing).to.have.a("boolean");
        }
        expect(result.pagination).to.be.a("object");
        done();
      }
    });

    testCreate(describe, it, chai.request(app), {
      name: "Feed",
      path: "/feeds",
      form: formCreateFeed,
      validateModel: (doneCreate, resultCreate: IFeedResponse) => {
        expect(resultCreate).to.be.a("object");
        const id = resultCreate.id;
        testDetail(describe, it, chai.request(app), {
          id,
          name: "Feed",
          path: "/feeds",
          validateModel: (done, result: IFeedResponse) => {
            expect(result).to.have.a("object");
            expect(result.owner.isFollowing).to.have.a("boolean");
            done();
          }
        });

        describe("/POST Feed Like", () => {
          it("Like feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.POST,
              path: `/feeds/${id}/likes`
            }).end((_err, res) => {
              validateResponseSuccessfully(res);
              const result = res.body;
              expect(result).to.be.a("object");
              expect(result.message).to.be.a("string");
              done();
            });

          });
        });

        describe("/POST Feed Comment", () => {
          it("Comment feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.POST,
              path: `/feeds/${id}/comments`
            }).send(formCommentFeed)
              .end((_err, res) => {
                validateResponseSuccessfully(res);
                const result = res.body;
                expect(result).to.be.a("object");
                expect(result.message).to.be.a("string");
                done();
              });

          });
        });

        describe("/PUT Feed Count Video And Audio", () => {
          it("Count Video And Audio for feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.PUT,
              path: `/feeds/${id}/count-video-and-audio`
            })
              .end((_err, res) => {
                validateResponseSuccessfully(res);
                const result = res.body;
                expect(result).to.be.a("object");
                expect(result.message).to.be.a("string");
                done();
              });

          });
        });

        describe("/GET Feed", () => {
          it("Get feed to confirm for some actions", (done) => {

            HttpClient(chai.request(app), {
              method: Method.GET,
              path: `/feeds/${id}`
            }).end((_err, res) => {
              validateResponseSuccessfully(res);
              const result: IFeedResponse = res.body;
              expect(result).to.be.a("object");
              expect(result.countLike).to.equal(1);
              expect(result.countComment).to.equal(1);
              expect(result.attachments).to.have.length(1);
              expect(result.attachments[0].views).to.equal(1);
              done();
            });

          });
        });

        describe("/POST Feed Report", () => {
          it("Report feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.POST,
              path: `/feeds/${id}/report`
            })
              .send(formReportFeed)
              .end((_err, res) => {
                validateResponseSuccessfully(res);
                const result = res.body;
                expect(result).to.be.a("object");
                expect(result.message).to.be.a("string");
                done();
              });

          });
        });

        describe("/DELETE Feed", () => {
          it("Delete feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.DEL,
              path: `/feeds/${id}`
            }).end((_err, res) => {
              validateResponseSuccessfully(res);
              const result = res.body;
              expect(result).to.be.a("object");
              expect(result.message).to.be.a("string");
              done();
            });

          });
        });

        describe("/GET Feed", () => {
          it("Get feed to confirm for delete feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.GET,
              path: `/feeds/${id}`
            }).end((_err, res) => {
              expect(res).to.have.status(404);
              expect(res.body.code).to.equal(ErrorKey.RecordNotFound);
              done();
            });

          });
        });

        doneCreate();
      }
    });

  });

});
