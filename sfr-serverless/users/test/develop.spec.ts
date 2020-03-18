import { EmailFakeAuth, IPagingResult, StatusCode, User, UserBlock, UserFollowing } from "../../common";
import { ISimpleUserResponse } from "../../common/serializers";
import {
  testDetail, testFilterPagination, validateResponseSuccessfully,
  wrapperTest, HttpClient, Method
} from "../../test/helpers";
import { app } from "../src";
import { UserFriend } from "../src/models";
import { IUserResponse } from "../src/serializers";

wrapperTest(app, (chai) => {

  const expect = chai.expect;

  before("Clear data for user", async () => {
    const user = await User.findOne({ email: EmailFakeAuth });
    if (user && user._id) {
      await UserFollowing.deleteMany({ createdBy: user._id });
      await UserFriend.deleteMany({ friendIds: user._id });
      await UserFollowing.deleteMany({ followingId: user._id });
    }
  });

  describe("Relation User", () => {

    describe("/GET Following", () => {
      it("Get following for user", (done) => {
        HttpClient(chai.request(app), {
          method: Method.GET,
          path: "/me/following?nextPageToken=",
          disableLive: true
        }).end((_error, res) => {
          validateResponseSuccessfully(res);
          expect(res.body).to.have.a("object");
          done();
        });
      });
    });

    describe("/GET Followers", () => {
      it("Get followers for user", (done) => {
        HttpClient(chai.request(app), {
          method: Method.GET,
          path: "/me/followers?nextPageToken=",
          disableLive: true
        }).end((_error, res) => {
          validateResponseSuccessfully(res);
          expect(res.body).to.have.a("object");
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

          User.findOne({ email: EmailFakeAuth }).then((user) => {
            if (user) {
              const userTwo = result.data
                .filter((e) => e.id.toString() !== user._id.toString())
                .map((e) => e.id)[0] || null;
              if (userTwo) {

                describe("/POST Following", () => {
                  it("SET following for user", (doneFollowing) => {
                    HttpClient(chai.request(app), {
                      method: Method.POST,
                      path: `/me/following/${userTwo}`,
                      disableLive: true
                    }).end(async (_error, res) => {
                      validateResponseSuccessfully(res);
                      expect(res.body).to.have.a("object");
                      expect(res.body.message).to.have.a("string");

                      const userTwoFollowingUser = await UserFollowing.findOne({
                        createdBy: userTwo,
                        followingId: user._id
                      });
                      if (!userTwoFollowingUser) {
                        describe("/POST Following", () => {
                          it("SET following for user", (doneA) => {

                            HttpClient(chai.request(app), {
                              method: Method.POST,
                              path: `/me/following/${userTwo}?reverse=true`,
                              disableLive: true
                            }).end(async (_errorA, a) => {
                              expect(a.body).to.have.a("object");
                              expect(a.body.message).to.have.a("string");

                              describe("/GET Friends", () => {
                                it("Get friends for user", (doneGetFriend) => {
                                  HttpClient(chai.request(app), {
                                    method: Method.GET,
                                    path: "/me/friends",
                                    disableLive: true
                                  }).end(async (_err, r) => {
                                    const body: ISimpleUserResponse[] = r.body;
                                    validateResponseSuccessfully(res);
                                    expect(body).to.have.a("array");
                                    expect(body).to.have.length(1);
                                    const friend = body[0];
                                    expect(friend.id.toString()).to.equal(userTwo.toString());
                                    await User.findByIdAndUpdate(userTwo, {
                                      status: StatusCode.Deleted
                                    });
                                    doneGetFriend();
                                  });
                                });
                              });

                              describe("/GET Friends", () => {
                                it("Get friends for user", (doneGetFriend) => {
                                  HttpClient(chai.request(app), {
                                    method: Method.GET,
                                    path: "/me/friends",
                                    disableLive: true
                                  }).end(async (_err, r) => {
                                    const body: ISimpleUserResponse[] = r.body;
                                    validateResponseSuccessfully(res);
                                    expect(body).to.have.a("array");
                                    expect(body).to.have.length(0);
                                    await User.findByIdAndUpdate(userTwo, {
                                      status: StatusCode.Active
                                    });

                                    doneGetFriend();
                                  });
                                });
                              });

                              doneA();

                            });

                          });
                        });

                      }

                      describe("/GET Following", () => {
                        it("Get following for user", (doneGetFollow) => {
                          HttpClient(chai.request(app), {
                            method: Method.GET,
                            path: "/me/following?nextPageToken=",
                            disableLive: true
                          }).end((_err, r) => {
                            const body: IPagingResult<ISimpleUserResponse> = r.body;
                            validateResponseSuccessfully(res);
                            expect(body.data).to.have.a("array");
                            expect(body.data).to.have.length(1);
                            const follower = body.data[0];
                            expect(follower.id.toString()).to.equal(userTwo.toString());
                            testBlockUser(chai, expect);
                            doneGetFollow();
                          });
                        });
                      });

                      doneFollowing();
                    });
                  });
                });

              }
            } else {
              done();
            }

          }).catch((err) => {
            console.error(err);
            done();
          });

        }

        return done();
      }
    });

    testFilterPagination(describe, it, chai.request(app), {
      name: "My notification list",
      path: "/me/notifications"
    });

  });

  after("Clear data for user", async () => {
    const user = await User.findOne({ email: EmailFakeAuth });
    await User.findOneAndUpdate({ email: EmailFakeAuth }, {
      status: StatusCode.Active
    });
    if (user && user._id) {
      await UserFollowing.deleteMany({ createdBy: user._id });
      await UserBlock.deleteOne({ createdBy: user._id });
    }
  });

});

function testBlockUser(chai, expect) {

  testFilterPagination(describe, it, chai.request(app), {
    name: "Search User",
    path: "/users",
    validateModel: (done, result: IPagingResult<ISimpleUserResponse>) => {
      expect(result).to.have.a("object");
      expect(result.data).to.have.a("array");
      if (result.data.length > 0) {
        User.findOne({ email: EmailFakeAuth }).then((user) => {
          if (user) {
            const userTwo: string = result.data
              .filter((e) => e.id.toString() !== user._id.toString())
              .map((e) => e.id)[0] || null;
            if (userTwo) {
              describe("/POST Block", () => {
                it("SET block for user", (doneFollowing) => {
                  HttpClient(chai.request(app), {
                    method: Method.POST,
                    path: `/me/block/${userTwo}`,
                    disableLive: true
                  }).end(async (_error, res) => {
                    validateResponseSuccessfully(res);
                    expect(res.body).to.have.a("object");
                    expect(res.body.message).to.have.a("string");

                    describe("/GET block", () => {
                      it("Get block for user", (doneGetFollow) => {
                        HttpClient(chai.request(app), {
                          method: Method.GET,
                          path: "/me/block",
                          disableLive: true
                        }).end(async (_err, r) => {
                          const body: ISimpleUserResponse[] = r.body;
                          validateResponseSuccessfully(res);
                          expect(body).to.have.a("array");
                          expect(body).to.have.length(1);
                          const data = body[0];
                          expect(data.id.toString()).to.equal(userTwo.toString());
                          testDetail(describe, it, chai.request(app), {
                            id: userTwo,
                            name: "Get Other Profile",
                            path: "/users",
                            validateModel: async (doneDetail, resultDetail: IUserResponse) => {
                              await HttpClient(chai.request(app), {
                                method: Method.POST,
                                path: `/me/block/${userTwo}`,
                                disableLive: true
                              });
                              expect(resultDetail.isBlock).to.have.a("boolean");
                              expect(resultDetail.isBlock).to.equal(true);
                              doneDetail();
                            }
                          });

                          doneGetFollow();
                        });
                      });
                    });

                    doneFollowing();
                  });
                });
              });
            }
          } else {
            done();
          }

        }).catch((err) => {
          console.error(err);
          done();
        });

      }

      return done();
    }
  });

}
