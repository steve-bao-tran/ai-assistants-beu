import { Response, Router } from "express";
import {
  createAndPushNotificationWithFormat, filterAll, filterPagination,
  filterUserBlock, getContentNotification, parseBlock, parseFollowers,
  responseError, validateBody, Comment, CommentCreate,
  CommentUpdate, ErrorKey, FileTypes, ICommentCreateForm,
  IRequest, IUser, NotificationKeyType,
  Post, PostContentType, PostType, Reaction, ReactionType, ReferenceType, StatusCode, User, UserBlock, UserSchemaName
} from "../../../common";
import { serializeAttachment, serializeSimpleUser } from "../../../common/serializers";
import {
  getFeedByUserId, middlewareCheckCommentOwner, middlewareCheckFeed,
  parseFeeds, parseFeedDetail, parseLatestLike, pushNotificationFeed, sortTagFriends
} from "../business";
import { IFeedCreateForm, IFeedUpdateForm } from "../models";
import { IReportPostForm, ReportPost } from "../models/report-post";
import { FeedCreateSchema, FeedUpdateSchemaForUserSide, RepostSchema } from "../schemas";
import { ReportPostCreateSchema } from "../schemas/report-post";
import { serializeComment, serializeFeed, serializeFeedItem } from "../serializers";

export function feedRouter(router: Router) {
  router.route("/feeds")
    .post(validateBody(FeedCreateSchema), createFeed)
    .get(getList);

  router.get("/feeds/my-feed", myFeed);
  router.get("/feeds/features", features);
  router.get("/feeds/:id/my-feed", otherFeed);
  router.get("/public/feeds/:id/my-feed", otherFeed);

  router.post("/feeds/:id/comments",
    middlewareCheckFeed,
    validateBody(CommentCreate),
    commentFeed
  );
  router.route("/feeds/:id/comments/:commentId")
    .delete(middlewareCheckFeed, middlewareCheckCommentOwner, deleteComment)
    .put(middlewareCheckFeed, middlewareCheckCommentOwner, validateBody(CommentUpdate), updateComment);

  router.post("/feeds/:id/likes", middlewareCheckFeed, likeFeed);
  router.get("/feeds/:id/likes/users", middlewareCheckFeed, getUsersLikeFeed);
  router.get("/feeds/:id/tags/users", middlewareCheckFeed, getUsersTagFeed);
  router.put("/feeds/:id/untag", middlewareCheckFeed, untagFeed);
  router.put("/feeds/:id/untag/:userId/users", middlewareCheckFeed, untagForFeedOwner);
  router.put("/feeds/:id/count-video-and-audio", countVideoAndAudio);
  router.post("/feeds/:id/report",
    validateBody(ReportPostCreateSchema), middlewareCheckFeed, reportPost);

  router.post("/reposts/:id",
    validateBody(RepostSchema), repost);

  router.route("/public/feeds/:id")
    .get(getDetail);
  router.route("/feeds/:id")
    .get(getDetail)
    .delete(deleteFeed)
    .put(validateBody(FeedUpdateSchemaForUserSide), updateFeed);
}

async function createFeed(req: IRequest, res: Response) {
  try {

    const form: IFeedCreateForm = req.body;
    const currentUserId = req.context.currentUser._id;
    form.createdBy = currentUserId;
    form.type = PostType.Normal;
    form.contentType = PostContentType.Normal;
    if (form.tagFriendIds && form.tagFriendIds.length > 0) {
      form.tagFriendIds = await filterUserBlock(currentUserId, form.tagFriendIds);
    }
    if (form.attachments) {
      form.attachments = <any> form.attachments.map(serializeAttachment);
    }
    const feed = await Post.create(form);
    await pushNotificationFeed(feed, { actorId: currentUserId });

    return res.json(serializeFeed(await parseFeedDetail(feed, {
      actorId: currentUserId
    })));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function updateFeed(req: IRequest, res: Response) {
  try {

    const form: IFeedUpdateForm = req.body;
    const feedId = req.params.id;
    const currentUserId = req.context.currentUser._id;
    form.updatedAt = new Date();

    if (form.tagFriendIds && form.tagFriendIds.length > 0) {
      form.tagFriendIds = await filterUserBlock(currentUserId, form.tagFriendIds);
    }
    if (form.attachments) {
      form.attachments = <any> form.attachments.map(serializeAttachment);
    }
    const feedDataAfterUpdate = await Post.findById(feedId);
    const feed = await Post.findByIdAndUpdate(feedId, form, {
      new: true
    });
    if (form.tagFriendIds && form.tagFriendIds.length > 0) {
      const newTagFriendIds = form.tagFriendIds.filter(e =>
        !(feedDataAfterUpdate.tagFriendIds || []).find(f => f.toString() === e.toString())
      );
      if (newTagFriendIds.length > 0) {
        await createAndPushNotificationWithFormat(null, {
          ...getContentNotification(NotificationKeyType.TaggedYou),
          senderId: currentUserId,
          receiverIds: newTagFriendIds,
          type: ReferenceType.Feed,
          referenceId: feed._id
        }, { actorId: currentUserId });
      }
    }

    // await createAndPushNotificationWithFormat(null, {
    //   ...getContentNotification(NotificationKeyType.EditPost),
    //   senderId: currentUserId,
    //   receiverIds: feed.tagFriendIds,
    //   type: ReferenceType.Feed,
    //   referenceId: feed._id
    // }, { actorId: currentUserId });
    const [parsedLastLike] = await parseLatestLike([feed], {
      actorId: currentUserId
    });

    return res.json(serializeFeed(await parseFeedDetail(parsedLastLike, {
      actorId: currentUserId
    })));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function commentFeed(req: IRequest, res: Response) {
  try {
    const feedId = req.params.id;
    const form: ICommentCreateForm = req.body;
    const currentUserId = req.context.currentUser._id;
    form.createdBy = currentUserId;
    form.referenceId = feedId;

    const comment = await Comment.create(form);

    const feed = await Post.findById(feedId);
    await createAndPushNotificationWithFormat(null, {
      ...getContentNotification(feed.contentType !== PostContentType.Normal
        ? NotificationKeyType.CommentRepost
        : NotificationKeyType.CommentPost),
      senderId: currentUserId,
      receiverIds: [feed.createdBy],
      type: ReferenceType.Feed,
      referenceId: feed._id
    }, { actorId: currentUserId });

    return res.json(serializeComment(comment));

  } catch (error) {
    return responseError(req, res, error);
  }
}

export async function deleteComment(req: IRequest, res: Response) {
  try {
    const commentId = req.params.commentId;
    await Comment.findByIdAndDelete(commentId);

    return res.json({
      message: "Delete comment successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function updateComment(req: IRequest, res: Response) {
  try {
    const commentId = req.params.commentId;
    const form = req.body;
    await Comment.findByIdAndUpdate(commentId, form);

    return res.json({
      message: "Update comment successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getDetail(req: IRequest, res: Response) {
  try {
    const feedId = req.params.id;
    const feed = await Post.findOne({
      _id: feedId,
      status: StatusCode.Active
    }).populate("createdBy");
    const currentUserId = req.context.currentUser ? req.context.currentUser._id : null;

    if (!feed) {
      return responseError(req, res, ErrorKey.RecordNotFound, {
        statusCode: 404
      });
    }
    const owner: IUser = <any> feed.createdBy;
    if (currentUserId && (await filterUserBlock(currentUserId, [owner._id])).length === 0) {
      return responseError(req, res, ErrorKey.RecordNotFound, {
        statusCode: 404
      });
    }
    const [parsedLastLike] = await parseLatestLike([feed], {
      actorId: currentUserId
    });

    const result = await parseFeedDetail(parsedLastLike, {
      actorId: req.context.currentUser ? req.context.currentUser._id : null
    });

    return res.json(serializeFeed(result));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function deleteFeed(req: IRequest, res: Response) {
  try {
    const feedId = req.params.id;
    const feed = await Post.findById(feedId);
    if (feed.createdBy.toString() !== req.context.currentUser._id.toString()) {
      return responseError(req, res, ErrorKey.DeleteFeed);
    }

    await Post.findByIdAndUpdate(feedId, {
      status: StatusCode.Deleted
    }).populate("createdBy");

    return res.json({
      message: "Delete feed successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getList(req: IRequest, res: Response) {
  try {
    const nextTokenPage = req.query.nextTokenPage;
    const currentUserId = req.context.currentUser._id;
    let pinnedPosts: any = [];
    if (!nextTokenPage) {
      pinnedPosts = await filterAll(Post, {
        status: StatusCode.Active,
        isPinned: true
      }, { sort: { createdAt: -1 } });

      pinnedPosts.data = await parseFeeds(pinnedPosts.data, {
        actorId: currentUserId
      });
    }
    const modelFilter: any = {
      isPinned: false,
      status: StatusCode.Active,
    };
    const title = req.query.title;
    if (title) {
      if (/ /g.test(title)) {
        modelFilter.$text = {
          $search: req.query.title
        };
      } else {
        modelFilter.title = {
          $regex: title,
          $options: "i"
        };
      }
    }
    const userBlock: any = (await UserBlock.findOne({ createdBy: currentUserId })) || {};
    const userBlocked = await UserBlock.find({ userIds: { $all: [currentUserId] } });
    const models = await filterPagination(Post, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      buildQuery: (query, limit, skip) => {
        const lookupUser = {
          $lookup: {
            from: UserSchemaName,
            localField: "createdBy",
            foreignField: "_id",
            as: "owner"
          }
        };
        const matchUser = {
          $match: {
            "owner.status": StatusCode.Active
          },
        };
        if (userBlocked && userBlocked.length > 0) {
          userBlock.userIds = userBlock.userIds || [];
          userBlock.userIds = userBlock.userIds.concat(userBlocked.map((e) => e.createdBy));
        }
        if (userBlock && userBlock.userIds && userBlock.userIds.length > 0) {
          modelFilter.createdBy = {
            $nin: userBlock.userIds
          };
        }

        let queryBase = query.aggregate([
          { $match: modelFilter },
          lookupUser,
          matchUser,
          { $sort: { createdAt: -1 } }
        ]);
        if (title) {
          queryBase = query.aggregate([
            { $match: modelFilter },
            lookupUser,
            matchUser,
            { $sort: { createdAt: -1 } }
          ]);
        }

        return queryBase.skip(skip).limit(limit);
      }
    });

    models.data = <any> (await parseFeeds(models.data, {
      actorId: currentUserId
    }));

    return res.json({
      data: {
        pinnedPosts: pinnedPosts.data.map(serializeFeedItem),
        posts: models.data.map(serializeFeedItem)
      },
      pagination: models.pagination
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function myFeed(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;

    return res.json(await getFeedByUserId(currentUserId, req.query));
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function otherFeed(req: IRequest, res: Response) {
  try {
    const userId = req.params.id;
    const currentUser = req.context.currentUser;
    const actorId = currentUser ? currentUser._id : null;
    if ((actorId && (await filterUserBlock(actorId, [userId])).length === 0)
      || !(await User.findOne({ _id: userId, status: StatusCode.Active }))
    ) {
      return res.json({
        data: {
          posts: []
        },
        pagination: {
          total: 0,
          size: 0,
          totalPages: 0,
          page: 1,
          nextPageToken: null
        }
      });
    }

    return res.json(await getFeedByUserId(userId, req.query, {
      actorId
    }));
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function likeFeed(req: IRequest, res: Response) {
  try {

    const feedId = req.params.id;
    let message;
    const currentUserId = req.context.currentUser._id;
    const form = {
      type: ReactionType.Like,
      referenceId: feedId,
      createdBy: currentUserId
    };

    await Reaction.findOne(form).then(async (reaction) => {
      message = !reaction ? "Like" : "Unlike";
      if (!reaction) {
        const feed = await Post.findById(feedId);
        await createAndPushNotificationWithFormat(null, {
          ...getContentNotification(feed.contentType !== PostContentType.Normal
            ? NotificationKeyType.LikeRepost
            : NotificationKeyType.LikePost),
          senderId: currentUserId,
          receiverIds: [feed.createdBy],
          type: ReferenceType.Feed,
          referenceId: feed._id
        }, { actorId: currentUserId });
      }

      return reaction
        ? Reaction.deleteOne(form)
        : Reaction.create(form);
    });

    return res.json({
      message: message + " feed successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getUsersLikeFeed(req: IRequest, res: Response) {
  try {
    const postId = req.params.id;
    const currentUserId = req.context.currentUser._id;
    const userIds = (await Reaction.find({
      referenceId: postId,
      type: ReactionType.Like
    })).map((e) => e.createdBy);
    let result = [];
    if (userIds.length > 0) {
      result = await User.find({
        _id: userIds,
        status: StatusCode.Active
      });
      result = await parseFollowers(currentUserId, result);
      result = await parseBlock(currentUserId, result);
      result = sortTagFriends(result, currentUserId);
    }

    return res.json(result.map(serializeSimpleUser));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getUsersTagFeed(req: IRequest, res: Response) {
  try {
    const postId = req.params.id;
    const userIds = (await Post.findById(postId)).tagFriendIds;
    const currentUserId = req.context.currentUser._id;
    let result = [];
    if (userIds.length > 0) {
      result = await User.find({
        _id: userIds,
        status: StatusCode.Active
      }).sort({ createdAt: -1 });
      result = await parseFollowers(currentUserId, result);
      result = sortTagFriends(result, currentUserId);
    }

    return res.json(result.map(serializeSimpleUser));
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function untagFeed(req: IRequest, res: Response) {
  try {

    const currentUserId = req.context.currentUser._id;
    const postId = req.params.id;
    const tagFriendIds = (await Post.findById(postId)).tagFriendIds;
    if (tagFriendIds.length > 0
      && tagFriendIds.map((e) => e.toString()).includes(currentUserId.toString())) {
      await Post.findByIdAndUpdate(postId, {
        tagFriendIds: tagFriendIds.filter((e) => e.toString() !== currentUserId.toString())
      });

      return res.json({
        message: "Untag in this feed successfully"
      });
    }

    return responseError(req, res, ErrorKey.CanNotUntagFeed);

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function untagForFeedOwner(req: IRequest, res: Response) {
  try {

    const currentUserId = req.context.currentUser._id;
    const userId = req.params.userId;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const tagFriendIds = (await Post.findById(postId)).tagFriendIds;
    if (post.createdBy.toString() !== currentUserId.toString()) {
      return responseError(req, res, ErrorKey.CanNotUntagFeed);
    }
    if (tagFriendIds.length > 0
      && tagFriendIds.map((e) => e.toString()).includes(userId.toString())) {
      await Post.findByIdAndUpdate(postId, {
        tagFriendIds: tagFriendIds.filter((e) => e.toString() !== userId.toString())
      });

      return res.json({
        message: "Untag in this feed successfully"
      });
    }

    return responseError(req, res, ErrorKey.CanNotUntagFeed);

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function repost(req: IRequest, res: Response) {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    const form = req.body;
    const currentUserId = req.context.currentUser._id;
    if (!post) {
      return responseError(req, res, ErrorKey.RecordNotFound);
    }
    let contentType = PostContentType.RepostNormal;
    switch (post.type) {
    case PostType.CompetitionPost:
      contentType = PostContentType.RepostCompetitionPost;
      break;
    case PostType.Event:
      contentType = PostContentType.RepostEvent;
      break;
    }

    const formRepost: IFeedCreateForm = {
      ...form,
      contentType,
      type: post.type,
      referenceId: id,
      createdBy: req.context.currentUser._id
    };
    const repostModel = await Post.create(formRepost);
    await pushNotificationFeed(repostModel, { actorId: currentUserId });

    return res.json({
      message: "Repost successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function reportPost(req: IRequest, res: Response) {
  try {

    const form: IReportPostForm = req.body;
    form.createdBy = req.context.currentUser._id;
    form.referenceId = req.params.id;
    await ReportPost.create(form);

    return res.json({
      message: "Report feed successfully"
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function countVideoAndAudio(req: IRequest, res: Response) {
  try {

    const feedId = req.params.id;
    const feed = await Post.findById(feedId);
    if (!feed) {
      return responseError(req, res, ErrorKey.RecordNotFound);
    }

    if (
      feed.attachments
      && (
        feed.attachments.map((e) => e.fileType).includes(FileTypes.Video)
        || feed.attachments.map((e) => e.fileType).includes(FileTypes.Audio)
      )
    ) {
      feed.attachments = feed.attachments.map((e) => {
        if (e.fileType === FileTypes.Video || e.fileType === FileTypes.Audio) {
          e.views = (e.views || 0) + 1;
        }

        return e;
      });
      await Post.findByIdAndUpdate(feedId, {
        attachments: feed.attachments
      });

      return res.json({
        message: "Count video and audio successfully"
      });
    }

    return responseError(req, res, ErrorKey.CountAttachment);
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function features(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const modelFilter: any = {
      isFeatured: true,
      status: StatusCode.Active
    };
    const userBlock: any = (await UserBlock.findOne({ createdBy: currentUserId })) || {};
    const userBlocked = await UserBlock.find({ userIds: { $all: [currentUserId] } });
    const models = await filterPagination(Post, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      buildQuery: (query, limit, skip) => {
        const lookupUser = {
          $lookup: {
            from: UserSchemaName,
            localField: "createdBy",
            foreignField: "_id",
            as: "owner"
          }
        };
        const matchUser = {
          $match: {
            "owner.status": StatusCode.Active
          },
        };
        if (userBlocked && userBlocked.length > 0) {
          userBlock.userIds = userBlock.userIds || [];
          userBlock.userIds = userBlock.userIds.concat(userBlocked.map((e) => e.createdBy));
        }
        if (userBlock && userBlock.userIds && userBlock.userIds.length > 0) {
          modelFilter.createdBy = {
            $nin: userBlock.userIds
          };
        }

        const queryBase = query.aggregate([
          { $match: modelFilter },
          lookupUser,
          matchUser,
          { $sort: { createdAt: -1 } }
        ]);

        return queryBase.skip(skip).limit(limit);
      }
    });

    models.data = <any> (await parseFeeds(models.data, {
      actorId: currentUserId
    }));

    return res.json({
      data: { posts: models.data.map(serializeFeedItem) },
      pagination: models.pagination
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}
