import express from "express";
import Post from "../models/post.js";
import User from "../models/user_schema.js";
import Channel from "../models/channelSchema.js";
import Comment from "../models/comment.js";
import ChannelPost from "../models/channelPost.js";
import ChannelComment from "../models/channelComment.js";

export const post = express.Router();

const postProjection =
  "id type content url author likes dislikes isArchived ispublic warnings comments createdAt updatedAt";

const parsePage = (value, fallback = 1) =>
  Math.max(1, Number.parseInt(value, 10) || fallback);

const parseLimit = (value, fallback = 12, max = 100) =>
  Math.min(max, Math.max(1, Number.parseInt(value, 10) || fallback));

const buildPostFilter = (search) => {
  if (!search || !search.trim()) return {};
  const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safe, "i");

  return {
    $or: [
      { content: regex },
      { author: regex },
      { id: regex },
      { type: regex },
    ],
  };
};

const buildChannelPostFilter = (search) => {
  if (!search || !search.trim()) return {};
  const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safe, "i");

  return {
    $or: [
      { content: regex },
      { channel: regex },
      { _id: regex },
      { type: regex },
    ],
  };
};

const mapPost = (postDoc) => {
  const postObj = postDoc.toObject ? postDoc.toObject() : postDoc;
  return {
    ...postObj,
    commentsCount: postObj.comments?.length || 0,
  };
};

const mapChannelPost = (postDoc) => {
  const postObj = postDoc.toObject ? postDoc.toObject() : postDoc;
  return {
    ...postObj,
    author: postObj.channel,
    ispublic: true,
    commentsCount: postObj.comments?.length || 0,
  };
};

const sendPaginatedPosts = async ({ filter, page, limit, res, next, errorMessage }) => {
  try {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(filter).select(postProjection).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      posts: posts.map(mapPost),
      count: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = errorMessage;
    return next(e);
  }
};

post.get("/list", async (req, res, next) => {
  const page = parsePage(req.query.page, 1);
  const limit = parseLimit(req.query.limit, 9, 100);
  const filter = buildPostFilter(req.query.search);

  return sendPaginatedPosts({
    filter,
    page,
    limit,
    res,
    next,
    errorMessage: "Error fetching posts",
  });
});

post.get("/user/:username", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("username");

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error validating user";
    return next(e);
  }

  const page = parsePage(req.query.page, 1);
  const limit = parseLimit(req.query.limit, 5, 20);

  return sendPaginatedPosts({
    filter: { author: req.params.username },
    page,
    limit,
    res,
    next,
    errorMessage: "Error fetching user posts",
  });
});

post.get("/channel/list", async (req, res, next) => {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 9, 100);
    const filter = buildChannelPostFilter(req.query.search);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      ChannelPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ChannelPost.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      posts: posts.map(mapChannelPost),
      count: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching channel posts";
    return next(e);
  }
});

post.get("/channel/:channelName", async (req, res, next) => {
  try {
    const channel = await Channel.findOne({ channelName: req.params.channelName }).select("channelName");

    if (!channel) {
      const err = new Error("Channel not found");
      err.statusCode = 404;
      return next(err);
    }

    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 5, 20);
    const skip = (page - 1) * limit;
    const searchFilter = buildChannelPostFilter(req.query.search);
    const baseChannelFilter = { channel: req.params.channelName };
    const finalFilter = req.query.search && req.query.search.trim()
      ? { $and: [baseChannelFilter, searchFilter] }
      : baseChannelFilter;

    const [posts, total] = await Promise.all([
      ChannelPost.find(finalFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ChannelPost.countDocuments(finalFilter),
    ]);

    return res.status(200).json({
      success: true,
      posts: posts.map(mapChannelPost),
      count: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching channel posts";
    return next(e);
  }
});

post.get("/channel-post/:id/comments", async (req, res, next) => {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 5, 20);
    const skip = (page - 1) * limit;
    const targetPost = await ChannelPost.findById(req.params.id).select("comments");

    if (!targetPost) {
      const err = new Error("Channel post not found");
      err.statusCode = 404;
      return next(err);
    }

    const commentIds = targetPost.comments || [];
    const pagedCommentIds = commentIds.slice(skip, skip + limit);
    const comments = await ChannelComment.find({ _id: { $in: pagedCommentIds } })
      .select("name avatarUrl text likes replies createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments: comments.map((comment) => ({
        ...comment.toObject(),
        username: comment.name,
        reply_array: comment.replies || [],
      })),
      pagination: {
        page,
        limit,
        total: commentIds.length,
        totalPages: Math.ceil(commentIds.length / limit),
        hasMore: skip + pagedCommentIds.length < commentIds.length,
      },
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching channel post comments";
    return next(e);
  }
});

post.get("/:id/comments", async (req, res, next) => {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 5, 20);
    const skip = (page - 1) * limit;
    const targetPost = await Post.findById(req.params.id).select("comments");

    if (!targetPost) {
      const err = new Error("Post not found");
      err.statusCode = 404;
      return next(err);
    }

    const commentIds = targetPost.comments || [];
    const pagedCommentIds = commentIds.slice(skip, skip + limit);
    const comments = await Comment.find({ _id: { $in: pagedCommentIds } })
      .select("username avatarUrl text likes reply_array createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total: commentIds.length,
        totalPages: Math.ceil(commentIds.length / limit),
        hasMore: skip + pagedCommentIds.length < commentIds.length,
      },
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching post comments";
    return next(e);
  }
});

post.patch("/:id/archive", async (req, res, next) => {
  try {
    const targetPost = await Post.findById(req.params.id);

    if (!targetPost) {
      const err = new Error("Post not found");
      err.statusCode = 404;
      return next(err);
    }

    targetPost.isArchived = true;
    await targetPost.save();

    return res.status(200).json({
      success: true,
      msg: "Post archived successfully",
      post: mapPost(targetPost),
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error archiving post";
    return next(e);
  }
});

post.patch("/:id/restore", async (req, res, next) => {
  try {
    const targetPost = await Post.findById(req.params.id);

    if (!targetPost) {
      const err = new Error("Post not found");
      err.statusCode = 404;
      return next(err);
    }

    targetPost.isArchived = false;
    await targetPost.save();

    return res.status(200).json({
      success: true,
      msg: "Post restored successfully",
      post: mapPost(targetPost),
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error restoring post";
    return next(e);
  }
});

post.delete("/:id", async (req, res, next) => {
  try {
    const targetPost = await Post.findById(req.params.id);

    if (!targetPost) {
      const err = new Error("Post not found");
      err.statusCode = 404;
      return next(err);
    }

    const postStringId = targetPost.id;
    const commentIds = targetPost.comments || [];

    await Promise.all([
      Post.deleteOne({ _id: targetPost._id }),
      User.updateMany(
        {},
        {
          $pull: {
            postIds: postStringId,
            archivedPostsIds: postStringId,
            savedPostsIds: postStringId,
            likedPostsIds: postStringId,
          },
        }
      ),
      Channel.updateMany(
        {},
        {
          $pull: {
            postIds: postStringId,
            archivedPostsIds: postStringId,
            savedPostsIds: postStringId,
            likedPostsIds: postStringId,
          },
        }
      ),
      commentIds.length
        ? Comment.deleteMany({ _id: { $in: commentIds } })
        : Promise.resolve(),
    ]);

    return res.status(200).json({
      success: true,
      msg: "Post deleted successfully",
      deletedId: req.params.id,
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error deleting post";
    return next(e);
  }
});

post.patch("/channel-post/:id/archive", async (req, res, next) => {
  try {
    const targetPost = await ChannelPost.findById(req.params.id);

    if (!targetPost) {
      const err = new Error("Channel post not found");
      err.statusCode = 404;
      return next(err);
    }

    targetPost.isArchived = true;
    await targetPost.save();

    return res.status(200).json({
      success: true,
      msg: "Channel post archived successfully",
      post: mapChannelPost(targetPost),
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error archiving channel post";
    return next(e);
  }
});

post.patch("/channel-post/:id/restore", async (req, res, next) => {
  try {
    const targetPost = await ChannelPost.findById(req.params.id);

    if (!targetPost) {
      const err = new Error("Channel post not found");
      err.statusCode = 404;
      return next(err);
    }

    targetPost.isArchived = false;
    await targetPost.save();

    return res.status(200).json({
      success: true,
      msg: "Channel post restored successfully",
      post: mapChannelPost(targetPost),
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error restoring channel post";
    return next(e);
  }
});

post.delete("/channel-post/:id", async (req, res, next) => {
  try {
    const targetPost = await ChannelPost.findById(req.params.id);

    if (!targetPost) {
      const err = new Error("Channel post not found");
      err.statusCode = 404;
      return next(err);
    }

    await Promise.all([
      ChannelPost.deleteOne({ _id: targetPost._id }),
      Channel.updateMany(
        {},
        {
          $pull: {
            postIds: targetPost._id,
            archivedPostsIds: targetPost._id,
            savedPostsIds: targetPost._id,
            likedPostsIds: targetPost._id,
          },
        }
      ),
      ChannelComment.deleteMany({ postId: targetPost._id }),
    ]);

    return res.status(200).json({
      success: true,
      msg: "Channel post deleted successfully",
      deletedId: req.params.id,
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error deleting channel post";
    return next(e);
  }
});
