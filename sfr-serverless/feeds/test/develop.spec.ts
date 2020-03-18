
import {
  Comment, EmailFakeAuth, ErrorKey,
  FileTypes, IPagingResult, Post,
  PostContentType, PostType, Reaction, ReactionType, StatusCode, User
} from "../../common";
import {
  testCreate, testDelete, testDetail,
  testFilterPagination, testScenarioForCRUD, testUpdate, validateResponseSuccessfully, wrapperTest, HttpClient, Method
} from "../../test/helpers";
import { app } from "../src";
import { ReportCategory, ReportPost } from "../src/models";
import { IFeedItemResponse, IFeedResponse } from "../src/serializers";
import { IFeedAdminResponse, IFeedItemAdminResponse } from "../src/serializers/feed-admin";
import { IReportPostResponse } from "../src/serializers/report-post";

const form = {
  title: "nhut_dev_test_report_categories (unit test)"
};
const formCreateFeed = {
  title: "nhut dev test create post (unit test)",
  attachments: [
    {
      fileName: "file name for testing video (unit test)",
      fileType: FileTypes.Video,
      fileSize: 123123123,
      fileUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/feed_5c0643871bb39a1e4fc902c6_1544081737342.mp4",
      thumbnailUrl: "test"
    }
  ],
  externalLinkData: {
    title: "test",
    description: "test",
    link: "test",
    thumbnailUrl: "test",
  }
};
const formUpdateFeed = {
  title: "nhut dev test update post (unit test)",
  attachments: [
    {
      fileName: "file name for testing audio (unit test)",
      fileType: FileTypes.Audio,
      fileSize: 123123123,
      fileUrl: "https://s3-ap-southeast-1.amazonaws.com/sfyr-dev/feed_5c0643871bb39a1e4fc902c6_1544081737342.mp4",
      thumbnailUrl: "test"
    }
  ],
};
const formCommentFeed = {
  content: "Comment to test comment by nhut dev (unit test)"
};
const formUpdateCommentFeed = {
  content: "Comment to test update comment by nhut dev (unit test)"
};
const formReportFeed = {
  comment: "Comment to test report feed by nhut dev (unit test)"
};
const formRepostFeed = {
  title: "test repost feed by nhut dev (unit test)",
  tagFriendIds: ["5bf665f95b24087d97dfdb4a"]
};

wrapperTest(app, (chai) => {
  const expect = chai.expect;
  // test for admin
  testScenarioForCRUD(describe, it, chai, app, {
    name: "ReportCategories",
    path: "/admin/report-categories",
    modelClass: ReportCategory,
    formCreate: form,
    extendCallback: () => {
      after(async () => {
        await ReportCategory.deleteMany(form);
      });
    }
  });

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

    testCreate(describe, it, chai.request(app), {
      name: "Feed",
      path: "/admin/feeds",
      form: formCreateFeed,
      validateModel: (doneCreate, resultCreate: IFeedResponse) => {
        expect(resultCreate).to.be.a("object");
        const id = resultCreate.id;

        testDetail(describe, it, chai.request(app), {
          id,
          name: "Feed",
          path: "/admin/feeds",
          validateModel: (done, result: IFeedAdminResponse) => {
            expect(result).to.have.a("object");
            expect(result.status).to.have.a("string");

            done();
          }
        });

        testDelete(describe, it, chai.request(app), {
          id,
          name: "Feed",
          path: "/admin/feeds",
          validateModel: async (doneForDelete) => {
            const post = await Post.findById(id);
            expect(post.status).to.equal(StatusCode.Deleted);
            doneForDelete();
          }
        });

        after(async () => {
          await Post.findByIdAndDelete(id);
        });

        doneCreate();
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

    testFilterPagination(describe, it, chai.request(app), {
      name: "Feed Features",
      path: "/feeds/features",
      validateModel: (done, result) => {
        expect(result).to.be.a("object");
        expect(result.data.posts).to.be.a("array");
        if (result.data.posts.length > 0) {
          const post: IFeedItemResponse = result.data.posts[0];
          expect(post.owner.isFollowing).to.have.a("boolean");
        }
        expect(result.pagination).to.be.a("object");
        done();
      }
    });

    testFilterPagination(describe, it, chai.request(app), {
      name: "Feed",
      path: "/feeds/my-feed",
      validateModel: (done, result) => {
        expect(result).to.have.a("object");
        expect(result.data.posts).to.have.a("array");
        done();
      }
    });

    testCreate(describe, it, chai.request(app), {
      name: "Feed",
      path: "/feeds",
      form: formCreateFeed,
      validateModel: async (doneCreate, resultCreate: IFeedResponse) => {
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

        testUpdate(describe, it, chai.request(app), {
          id,
          name: "Feed Update",
          path: "/feeds",
          form: formUpdateFeed,
          validateModel: (done, result: IFeedResponse) => {
            expect(result).to.have.a("object");
            expect(result.owner.isFollowing).to.have.a("boolean");
            expect(result.attachments).to.have.a("array");
            expect(result.attachments).to.have.length(1);
            expect(result.attachments[0].fileType).to.have.equal(FileTypes.Audio);
            expect(result.title).to.have.equal(formUpdateFeed.title);
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

        describe("/Get User Like Feed", () => {
          it("User Like feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.GET,
              path: `/feeds/${id}/likes/users`
            }).end((_err, res) => {
              validateResponseSuccessfully(res);
              const result = res.body;
              expect(result).to.be.a("array");
              done();
            });

          });
        });

        describe("/Get Users Tag Feed", () => {
          it("Users Tag feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.GET,
              path: `/feeds/${id}/tags/users`
            }).end((_err, res) => {
              validateResponseSuccessfully(res);
              const result = res.body;
              expect(result).to.be.a("array");
              done();
            });

          });
        });

        describe("/PUT User Untag Feed", () => {
          it("User Untag Feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.PUT,
              path: `/feeds/${id}/untag`
            }).end((_err, res) => {
              const result = res.body;
              expect(result).to.be.a("object");
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
                // expect(result.message).to.be.a("string");
                done();
              });

          });
        });

        testDetail(describe, it, chai.request(app), {
          id,
          name: "Feed Detail To Check",
          path: "/feeds",
          validateModel: (done, result: IFeedResponse) => {
            const comments = result.comments[0];
            expect(comments).to.have.a("object");
            HttpClient(chai.request(app), {
              method: Method.PUT,
              path: `/feeds/${id}/comments/${comments.id}`
            }).send(formUpdateCommentFeed).end((_err, res) => {
              validateResponseSuccessfully(res);
              const resultUpdateComment = res.body;
              expect(resultUpdateComment).to.be.a("object");
              expect(resultUpdateComment.message).to.be.a("string");
              HttpClient(chai.request(app), {
                method: Method.DEL,
                path: `/feeds/${id}/comments/${comments.id}`
              }).end((_errDel, resDel) => {
                validateResponseSuccessfully(resDel);
                const resultDeleteComment = resDel.body;
                expect(resultDeleteComment).to.be.a("object");
                expect(resultDeleteComment.message).to.be.a("string");
                done();
              });
            });

          }
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
              expect(result.countComment).to.equal(0);
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

        describe("/POST Feed Repost", () => {
          it("Report feed", (done) => {

            HttpClient(chai.request(app), {
              method: Method.POST,
              path: `/reposts/${id}`
            }).send(formRepostFeed)
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

        after(async () => {
          const user = await User.findOne({ email: EmailFakeAuth });
          if (user && user._id) {
            await Post.deleteMany({ createdBy: user._id });
          }
          await Post.findByIdAndDelete(id);
          await Post.findOneAndDelete({
            referenceId: id,
            type: PostType.Normal,
            contentType: PostContentType.RepostNormal
          });
          await ReportPost.findOneAndDelete({
            referenceId: id
          });
          await ReportPost.findOneAndDelete({
            referenceId: id
          });
          await Reaction.findOneAndDelete({
            referenceId: id,
            type: ReactionType.Like
          });
          await Comment.findOneAndDelete({
            referenceId: id
          });
        });

        doneCreate();
      }
    });

  });

});
