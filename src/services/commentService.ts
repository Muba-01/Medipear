import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Comment, { IComment } from "@/models/Comment";
import Post from "@/models/Post";

export interface CommentData {
  id: string;
  postId: string;
  authorId: string;
  author: {
    username: string;
    walletAddress: string | null;
    avatar: string | null;
    karma: number;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  score: number;
  parentComment: string | null;
  createdAt: string;
  editedAt: string | null;
}

type PopulatedComment = IComment & {
  author: {
    _id: mongoose.Types.ObjectId;
    username?: string;
    walletAddress?: string;
    avatarUrl?: string;
    karma?: number;
  };
};

function serializeComment(c: PopulatedComment): CommentData {
  return {
    id: c._id.toString(),
    postId: c.post.toString(),
    authorId: c.author._id.toString(),
    author: {
      username:      c.author.username      ?? "Anonymous",
      walletAddress: c.author.walletAddress ?? null,
      avatar:        c.author.avatarUrl     ?? null,
      karma:         c.author.karma         ?? 0,
    },
    content:       c.content,
    upvotes:       c.upvotes.length,
    downvotes:     c.downvotes.length,
    score:         c.score,
    parentComment: c.parentComment?.toString() ?? null,
    createdAt:     c.createdAt.toISOString(),
    editedAt:      c.editedAt?.toISOString() ?? null,
  };
}

export async function getCommentsByPost(postId: string): Promise<CommentData[]> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(postId)) return [];

  const comments = await Comment.find({ post: postId })
    .populate("author", "username walletAddress avatarUrl karma")
    .sort({ createdAt: 1 })
    .lean<PopulatedComment[]>();

  return comments.map(serializeComment);
}

export async function createComment(
  postId: string,
  content: string,
  authorId: string,
  parentCommentId?: string
): Promise<CommentData> {
  await connectDB();

  const commentData: {
    post: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    parentComment?: mongoose.Types.ObjectId;
  } = {
    post:    new mongoose.Types.ObjectId(postId),
    author:  new mongoose.Types.ObjectId(authorId),
    content: content.trim(),
  };
  if (parentCommentId) {
    commentData.parentComment = new mongoose.Types.ObjectId(parentCommentId);
  }

  const comment = await Comment.create(commentData);

  // Increment the post's commentCount
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

  const populated = await comment.populate<{ author: PopulatedComment["author"] }>(
    "author",
    "username walletAddress avatarUrl karma"
  );

  return serializeComment(populated as unknown as PopulatedComment);
}

export async function updateComment(commentId: string, content: string): Promise<CommentData> {
  await connectDB();

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content: content.trim(), editedAt: new Date() },
    { new: true }
  ).populate("author", "username walletAddress avatarUrl karma");

  if (!comment) throw new Error("Comment not found");

  return serializeComment(comment as PopulatedComment);
}

export async function deleteComment(commentId: string): Promise<CommentData> {
  await connectDB();

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content: "Comment deleted by original user." },
    { new: true }
  ).populate("author", "username walletAddress avatarUrl karma");

  if (!comment) throw new Error("Comment not found");

  return serializeComment(comment as PopulatedComment);
}

export async function voteComment(
  commentId: string,
  userId: string,
  direction: "up" | "down"
): Promise<{ upvotes: number; downvotes: number; score: number } | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(commentId)) return null;
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const uid = new mongoose.Types.ObjectId(userId);
  const comment = await Comment.findById(commentId);
  if (!comment) return null;

  // Prevent users from voting on their own comments
  if (comment.author.equals(uid)) {
    console.log("[DEBUG] voteComment - user attempted to vote on their own comment");
    throw new Error("You cannot vote on your own comment");
  }

  const hasUp   = comment.upvotes.some((id) => id.equals(uid));
  const hasDown = comment.downvotes.some((id) => id.equals(uid));

  if (direction === "up") {
    if (hasUp) {
      comment.upvotes = comment.upvotes.filter((id) => !id.equals(uid));
    } else {
      comment.upvotes.push(uid);
      comment.downvotes = comment.downvotes.filter((id) => !id.equals(uid));
    }
  } else {
    if (hasDown) {
      comment.downvotes = comment.downvotes.filter((id) => !id.equals(uid));
    } else {
      comment.downvotes.push(uid);
      comment.upvotes = comment.upvotes.filter((id) => !id.equals(uid));
    }
  }

  comment.score = comment.upvotes.length - comment.downvotes.length;
  await comment.save();

  return {
    upvotes:   comment.upvotes.length,
    downvotes: comment.downvotes.length,
    score:     comment.score,
  };
}
