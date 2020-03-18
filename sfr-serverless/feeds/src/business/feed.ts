import { NextFunction, Response } from "express";
import *  as lodash from "lodash";
import * as mongoose from "mongoose";
import {
  arrayMove, createAndPushNotificationWithFormat, filterPagination,
  filterUserBlock, getContentNotification, parseDataPopulate,
  parseFollowers, responseError, serializeSimpleUser,
  skipValueObject, Comment, CommentSchemaName,
  ErrorKey, IComment, IOptions, IPost, IRequest,
  IUser, NotificationKeyType, Post,
  PostContentType, Reaction, ReactionSchemaName,
  ReactionType, ReferenceType, StatusCode, User,
  UserBlock, UserFollowing, UserSchemaName
} from "../../../common";
import { serializeFeedItem } from "../serializers";

export async function parseFeedDetail(post: IPost, options?: IOptions): Promise<IPost> {
  try {
    post = post.toJSON ? post.toJSON() : post;
    if (options) {
      const [dataParsedLike] = await parseIsLike(options.actorId, [post]);
      const [dataParsedRepost] = await parseRepost([dataParsedLike], options);
      post = dataParsedRepost;
    }

    if (!mongoose.Types.ObjectId.isValid(post.createdBy)) {
      post.owner = <any> post.createdBy;
      post.createdBy = post.owner._id;
    } else {
      post.owner = await User.findById(post.createdBy);
    }
    if (options) {
      const [userParsed] = await parseFollowers(options.actorId, [post.owner]);
      post.owner = userParsed;
    }

    // const countLike = await Reaction.countDocuments({
    //   referenceId: post._id,
    //   type: ReactionType.Like
    // });
    const countLike = await Reaction.aggregate([
      {
        $match: {
          referenceId: post._id,
          type: ReactionType.Like
        }
      },
      {
        $lookup: {
          from: UserSchemaName,
          localField: "createdBy",
          foreignField: "_id",
          as: "owner"
        }
      },
      {
        $match: {
          "owner.status": StatusCode.Active
        },
      },
      {
        $group: {
          _id: "$_referenceId",
          count: { $sum: 1 }
        }
      }
    ]);
    const countRepost = await Post.countDocuments({
      referenceId: post._id,
      contentType: PostContentType.RepostNormal,
      status: StatusCode.Active
    });

    post.countRepost = countRepost;
    post.countLike = countLike.length > 0 ? countLike[0].count : 0;
    post.comments = await parseCommentFeed(post);
    post.tagFriends = sortTagFriends(await User.find({
      _id: { $in: post.tagFriendIds },
      status: StatusCode.Active
    }).sort({ createdAt: -1 }), options ? options.actorId : null);

    return post;

  } catch (error) {
    return Promise.reject(error);
  }
}

export async function parseFeeds(posts: IPost[], options?: IOptions): Promise<IPost[]> {
  try {
    if (!posts || posts.length === 0) {
      return [];
    }
    const countComments = await Comment.aggregate([
      {
        $match: {
          referenceId: {
            $in: posts.map((e) => e._id)
          },
          parentId: null
        }
      },
      {
        $group: {
          _id: "$referenceId",
          count: { $sum: 1 }
        }
      }
    ]);
    const countLikes = await Reaction.aggregate([
      {
        $match: {
          referenceId: {
            $in: posts.map((e) => e._id)
          },
          type: ReactionType.Like
        }
      },
      {
        $group: {
          _id: "$referenceId",
          count: { $sum: 1 }
        }
      }
    ]);
    const countReposts = await Post.aggregate([
      {
        $match: {
          referenceId: {
            $in: posts.map((e) => e._id)
          },
          postContentType: {
            $ne: PostContentType.RepostNormal
          },
          status: StatusCode.Active
        }
      },
      {
        $group: {
          _id: "$referenceId",
          count: { $sum: 1 }
        }
      }
    ]);

    let userIds = posts.map((e) => e.createdBy);
    userIds = posts.reduce((pre, cre) => {
      return pre.concat(cre.tagFriendIds);
    }, userIds);

    let users: IUser[];
    if (options) {
      posts = await parseIsLike(options.actorId, posts);
      posts = await parseRepost(posts, options);
      users = await parseFollowers(options.actorId, await User.find({
        _id: {
          $in: userIds
        },
        status: StatusCode.Active
      }).sort({ createdAt: -1 }));
    } else {
      users = await User.find({
        _id: {
          $in: userIds
        },
        status: StatusCode.Active
      }).sort({ createdAt: -1 });
    }
    posts = await parseLatestComment(posts);
    posts = await parseLatestLike(posts, options);

    return await Promise.all(posts.map(async (e) => ({
      ...e.toJSON ? e.toJSON() : e,
      owner: users.filter((f) => f._id.toString() === e.createdBy.toString())[0] || null,
      countComment: countComments.filter((f) => f._id.toString() === e._id.toString())
        .map((m) => m.count)[0] || 0,
      countLike: countLikes.filter((f) => f._id.toString() === e._id.toString())
        .map((m) => m.count)[0] || 0,
      countRepost: countReposts.filter((f) => f._id.toString() === e._id.toString())
        .map((m) => m.count)[0] || 0,
      tagFriends: sortTagFriends(await User.find({
        _id: { $in: e.tagFriendIds },
        status: StatusCode.Active
      }).sort({ createdAt: -1 }), options ? options.actorId : null)
    })));

  } catch (error) {
    return Promise.reject(error);
  }
}

export async function parseIsLike(currentId: string, feeds: IPost[]): Promise<IPost[]> {
  const ids = feeds.map((e) => e._id);
  const likes = await Reaction.find({
    referenceId: {
      $in: ids
    },
    type: ReactionType.Like,
    createdBy: currentId
  });

  return <any> feeds.map((e) => ({
    ...e.toJSON ? e.toJSON() : e,
    isLike: likes.find((l) => l.referenceId.toString() === e._id.toString()) ? true : false
  }));
}

export async function parseRepost(posts: IPost[], options: IOptions): Promise<IPost[]> {
  const repostIds = posts.filter((e) => e.contentType !== PostContentType.Normal)
    .map((e) => e.referenceId);
  if (!repostIds || repostIds.length === 0) {
    return posts;
  }
  const userBlock = await UserBlock.findOne({ createdBy: options.actorId });
  let userIdBlock = userBlock ? userBlock.userIds : [];
  const userBlocked = await UserBlock.find({ userIds: { $all: [options.actorId] } });
  userIdBlock = userIdBlock.concat(userBlocked.map((e) => e.createdBy));
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

  const reposts = await parseFeeds(await Post.aggregate([
    {
      $match: {
        _id: {
          $in: repostIds
        },
        createdBy: {
          $nin: userIdBlock
        },
        status: StatusCode.Active
      }
    },
    lookupUser,
    matchUser
  ]), { actorId: options.actorId });

  return <any> posts.map((e) => {
    return skipValueObject({
      ...e.toJSON ? e.toJSON() : e,
      original: e.contentType !== PostContentType.Normal ?
        reposts.find((f) => f._id.toString() === e.referenceId.toString()) || null
        : null
    });
  });
}

export async function parseCommentFeed(post: IPost): Promise<IComment[]> {
  let comments = await Comment.find({
    referenceId: post._id,
    parentId: null
  }).populate("createdBy").sort({
    createdAt: -1
  });

  if (comments.length === 0) {
    return [];
  }
  comments = comments.map((e) => parseDataPopulate(e.toJSON ? e.toJSON() : e, [{
    field: "createdBy",
    replaceField: "owner"
  }]));

  const parentIds = comments.map((e) => e._id).filter((e) => e);
  let childComments = await Comment.find({
    parentId: { $in: parentIds }
  }).populate("createdBy").sort({
    createdAt: -1
  });
  childComments = childComments.map((e) => parseDataPopulate(e.toJSON ? e.toJSON() : e, [{
    field: "createdBy",
    replaceField: "owner"
  }]));

  return <any> comments.map((e) => ({
    ...e,
    childComments: childComments.filter((p) => p.parentId.toString() === e._id.toString())
  }));
}

export async function middlewareCheckFeed(req: IRequest, res: Response, next: NextFunction) {
  try {
    const feedId = req.params.id;

    return Post.findOne({
      _id: feedId,
      status: StatusCode.Active
    }).then(async (feed) => {
      if (!feed) {
        return responseError(req, res, ErrorKey.RecordNotFound, {
          statusCode: 404
        });
      }
      const currentUserId = req.context.currentUser._id;
      if (
        currentUserId &&
        (await filterUserBlock(currentUserId, [feed.createdBy])).length === 0
      ) {
        return responseError(req, res, ErrorKey.ActionUserBlock, {
          statusCode: 404
        });
      }

      return next();
    });

  } catch (error) {
    return responseError(req, res, error);
  }
}

export function sortTagFriends(model: IUser[], currentId: string): IUser[] {
  if (!model || model && model.length === 0) {
    return [];
  }

  if (!currentId) {
    return model;
  }

  return arrayMove(model, lodash.cloneDeep(model)
    .map((e) => e._id || e.id)
    .map((e) => e.toString()).indexOf(currentId.toString()), 0);
}

export async function getFeedByUserId(currentUserId, query, options?: IOptions) {
  try {
    const modelFilter: any = {
      isPinned: false,
      status: StatusCode.Active,
      createdBy: currentUserId
    };
    options = <any> (options || {});

    const models = await filterPagination(Post, modelFilter, {
      ...query,
      sort: { createdAt: -1 }
    });

    models.data = <any> (await parseFeeds(models.data, {
      actorId: options.actorId || currentUserId
    }));

    return {
      data: { posts: models.data.map(serializeFeedItem) },
      pagination: models.pagination
    };
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function pushNotificationFeed(feed: IPost, options: IOptions) {
  try {
    const followerIds = (await UserFollowing.find({ followingId: options.actorId })).map((e) => e.createdBy);
    if (followerIds.length > 0) {
      await createAndPushNotificationWithFormat(null, {
        ...getContentNotification(feed.contentType !== PostContentType.Normal
          ? NotificationKeyType.NewRepost : NotificationKeyType.NewPost),
        senderId: options.actorId,
        receiverIds: followerIds,
        type: ReferenceType.Feed,
        referenceId: feed._id
      }, {
        actorId: options.actorId
      });
    }

    if (feed.tagFriendIds.length > 0) {
      await createAndPushNotificationWithFormat(null, {
        ...getContentNotification(NotificationKeyType.TaggedYou),
        senderId: options.actorId,
        receiverIds: feed.tagFriendIds,
        type: ReferenceType.Feed,
        referenceId: feed._id
      }, {
        actorId: options.actorId
      });
    }

    return null;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function parseLatestComment(feeds: IPost[]) {
  const commentForFeeds = await Post.aggregate([{
    $match: {
      _id: {
        $in: feeds.map((e) => e._id || e.id)
      }
    }
  }, {
    $lookup: {
      from: CommentSchemaName,
      as: "comments",
      let: { postId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$referenceId", "$$postId"] }
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 2 }
      ]
    }
  }]);

  let result = feeds.map((e) => ({
    ...e.toJSON ? e.toJSON() : e,
    comments: commentForFeeds.find((c) => c._id.toString() === (e._id || e.id).toString()).comments
  }));
  const userIds = result.reduce((p, c) => {
    return p.concat(c.comments.length > 0 ?
      c.comments.map((e) => e.createdBy) :
      []);
  }, []);
  const users = await User.find({ _id: userIds });
  result = result.map((e) => ({
    ...e,
    comments: e.comments.map((c) => ({
      ...c.toJSON ? c.toJSON() : c,
      owner: users.find((u) => u._id.toString() === c.createdBy.toString())
    }))
  }));

  return result;
}

export async function parseLatestLike(feeds: IPost[], options: IOptions) {
  const feedIds = feeds.map((e) => e._id || e.id);
  const limitLatestLike = 10;
  const matchJoin: any = {
    $expr: { $eq: ["$referenceId", "$$postId"] }
  };
  if (options && options.actorId) {
    matchJoin.createdBy = { $ne: mongoose.Types.ObjectId(options.actorId) };
  }
  const usersLikedForFeeds = await Post.aggregate([{
    $match: {
      _id: {
        $in: feedIds
      }
    }
  }, {
    $lookup: {
      from: ReactionSchemaName,
      as: "likes",
      let: { postId: "$_id" },
      pipeline: [
        { $match: matchJoin },
        { $sort: { createdAt: -1 } },
        { $limit: limitLatestLike }
      ]
    }
  }]);

  let result = feeds.map((e) => ({
    ...e.toJSON ? e.toJSON() : e,
    usersLiked: usersLikedForFeeds.find((c) => c._id.toString() === (e._id || e.id).toString()).likes
  }));
  if (options && options.actorId) {
    const iLikedPosts = await Reaction.find({
      referenceId: { $in: feedIds },
      type: ReactionType.Like,
      createdBy: options.actorId
    });
    result = result.map((e) => {
      const iLiked = iLikedPosts.find((i) => i.referenceId.toString() === (e.id || e._id).toString());
      iLiked ? e.usersLiked.unshift(iLiked) && (e.usersLiked = e.usersLiked.slice(0, limitLatestLike)) : null;

      return e;
    });
  }
  const userIds = result.reduce((p, c) => {
    return p.concat(c.usersLiked.length > 0 ?
      c.usersLiked.map((e) => e.createdBy) :
      []);
  }, []);
  const users = await User.find({ _id: userIds, status: StatusCode.Active });

  return result.map((e) => ({
    ...e,
    usersLiked: e.usersLiked
      .map((c) => users.find((u) => u._id.toString() === c.createdBy.toString()))
      .filter((c) => c)
      .map(serializeSimpleUser)
  }));
}

export async function middlewareCheckCommentOwner(req: IRequest, res: Response, next: NextFunction) {
  try {
    const commentId = req.params.commentId;
    const currentUserId = req.context.currentUser._id;
    const comment = await Comment.findById(commentId);
    if (!comment || currentUserId.toString() !== comment.createdBy.toString()) {
      return responseError(req, res, ErrorKey.CanNotDoActionForComment);
    }

    return next();

  } catch (error) {
    return responseError(req, res, error);
  }
}
