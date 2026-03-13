import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Community from "@/models/Community";
import { CreatePostInput } from "@/lib/validations";
import { Post as PostFE, User as UserFE, Community as CommunityFE } from "@/lib/types";

type PopulatedAuthor = {
  _id: mongoose.Types.ObjectId;
  username: string;
  walletAddress?: string;
  avatarUrl: string;
  karma: number;
  tokenBalance: number;
  bio: string;
  createdAt: Date;
};

type PopulatedCommunity = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  membersCount: number;
  iconUrl: string;
  bannerUrl: string;
  createdAt: Date;
};

type LeanPost = {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  postType: "text" | "image" | "link";
  author: PopulatedAuthor;
  community: PopulatedCommunity;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  score: number;
  tags: string[];
  imageUrl?: string;
  linkUrl?: string;
  commentCount: number;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
};

function serializeAuthor(a: PopulatedAuthor): UserFE {
  return {
    id: a._id.toString(),
    username: a.username,
    walletAddress: a.walletAddress ?? "",
    avatar: a.avatarUrl,
    karma: a.karma,
    tokensEarned: a.tokenBalance,
    joinDate: a.createdAt?.toISOString() ?? "",
    bio: a.bio,
    communities: [],
  };
}

function serializeCommunity(c: PopulatedCommunity): CommunityFE {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    memberCount: c.membersCount,
    postCount: 0,
    icon: c.iconUrl || "🌐",
    banner: c.bannerUrl,
    tags: [],
    createdAt: c.createdAt?.toISOString() ?? "",
    createdBy: "",
  };
}

function serializePost(p: LeanPost, currentUserId?: string): PostFE {
  const upvoteIds = p.upvotes.map((id) => id.toString());
  const downvoteIds = p.downvotes.map((id) => id.toString());

  let userVote: "up" | "down" | null = null;
  if (currentUserId) {
    if (upvoteIds.includes(currentUserId)) userVote = "up";
    else if (downvoteIds.includes(currentUserId)) userVote = "down";
  }

  return {
    id: p._id.toString(),
    title: p.title,
    content: p.content,
    postType: p.postType ?? "text",
    authorId: p.author._id.toString(),
    author: serializeAuthor(p.author),
    communityId: p.community._id.toString(),
    community: serializeCommunity(p.community),
    upvotes: upvoteIds.length,
    downvotes: downvoteIds.length,
    commentCount: p.commentCount,
    tokenReward: 0,
    trustScore: p.trustScore,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    tags: p.tags,
    imageUrl: p.imageUrl,
    linkUrl: p.linkUrl,
    userVote,
  };
}

const POPULATE_AUTHOR = "username walletAddress avatarUrl karma tokenBalance bio createdAt";
const POPULATE_COMMUNITY = "name slug description membersCount iconUrl bannerUrl createdAt";

export type GetPostsFilter = {
  communitySlug?: string;
  authorWallet?: string;
  authorId?: string;
  sort?: "hot" | "new" | "top" | "rising";
  limit?: number;
  page?: number;
  search?: string;
};

export async function getPosts(
  filter: GetPostsFilter = {},
  currentUserId?: string
): Promise<PostFE[]> {
  if (!process.env.MONGODB_URI) return [];
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filter.communitySlug) {
    const comm = await Community.findOne({
      slug: filter.communitySlug.toLowerCase(),
    }).lean();
    if (!comm) return [];
    query.community = comm._id;
  }

  if (filter.authorId && mongoose.Types.ObjectId.isValid(filter.authorId)) {
    query.author = new mongoose.Types.ObjectId(filter.authorId);
  } else if (filter.authorWallet) {
    // Resolve wallet → ObjectId so the query hits the DB index
    const authorUser = await import("@/models/User").then(m =>
      m.default.findOne({ walletAddress: filter.authorWallet!.toLowerCase() }).select("_id").lean()
    );
    if (!authorUser) return [];
    query.author = authorUser._id;
  }

  if (filter.search && filter.search.trim()) {
    const regex = new RegExp(filter.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ title: regex }, { content: regex }];
  }

  const sortMap: Record<string, Record<string, number>> = {
    new: { createdAt: -1 },
    top: { score: -1, createdAt: -1 },
    hot: { score: -1, createdAt: -1 },
    rising: { createdAt: -1, score: -1 },
  };
  const sortQuery = sortMap[filter.sort ?? "hot"];

  const raw = await Post.find(query)
    .populate<{ author: PopulatedAuthor }>("author", POPULATE_AUTHOR)
    .populate<{ community: PopulatedCommunity }>("community", POPULATE_COMMUNITY)
    .sort(sortQuery as Record<string, 1 | -1>)
    .limit(filter.limit ?? 50)
    .lean();

  let posts = (raw as unknown as LeanPost[]).map((p) =>
    serializePost(p, currentUserId)
  );

  return posts;
}

export async function getPostById(
  id: string,
  currentUserId?: string
): Promise<PostFE | null> {
  if (!process.env.MONGODB_URI) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();

  const raw = await Post.findById(id)
    .populate<{ author: PopulatedAuthor }>("author", POPULATE_AUTHOR)
    .populate<{ community: PopulatedCommunity }>("community", POPULATE_COMMUNITY)
    .lean();

  if (!raw) return null;
  console.log("[DEBUG] getPostById - raw post trustScore from DB:", raw.trustScore);
  const serialized = serializePost(raw as unknown as LeanPost, currentUserId);
  console.log("[DEBUG] getPostById - serialized post trustScore:", serialized.trustScore);
  return serialized;
}

async function getTrustScore(text: string): Promise<number> {
  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error(`ML service error: ${response.status} ${response.statusText}`);
      return 0.5; // Default fallback score
    }

    const data = await response.json();
    console.log("[DEBUG] ML service response:", data);
    
    // The ML service returns trust_index
    const score = data.trust_index ?? data.trust_score ?? data.trustScore ?? 0.5;
    console.log("[DEBUG] Extracted score:", score);
    
    const normalizedScore = Math.min(Math.max(typeof score === "number" ? score : 0.5, 0), 1);
    console.log("[DEBUG] Normalized score:", normalizedScore);
    return normalizedScore;
  } catch (error) {
    console.error("Failed to fetch trust score from ML service:", error);
    return 0.5; // Default fallback score on error
  }
}

export async function createPost(
  input: CreatePostInput,
  authorId: string
): Promise<PostFE> {
  await connectDB();

  const community = await Community.findOne({
    slug: input.communitySlug.toLowerCase(),
  }).lean();
  if (!community) throw new Error("Community not found");

  // Get trust score from ML service
  const textToScore = input.content || input.title;
  console.log("[DEBUG] Text to score:", textToScore);
  const trustScore = await getTrustScore(textToScore);
  console.log("[DEBUG] Trust score from AI service:", trustScore);

  const created = await Post.create({
    title: input.title,
    content: input.content,
    postType: input.postType ?? "text",
    author: authorId,
    community: community._id,
    tags: input.tags ?? [],
    imageUrl: input.imageUrl || undefined,
    linkUrl: input.linkUrl || undefined,
    trustScore,
  });
  console.log("[DEBUG] Post created with trustScore:", created.trustScore);

  const populated = await Post.findById(created._id)
    .populate<{ author: PopulatedAuthor }>("author", POPULATE_AUTHOR)
    .populate<{ community: PopulatedCommunity }>("community", POPULATE_COMMUNITY)
    .lean();

  console.log("[DEBUG] Post fetched from DB with trustScore:", populated?.trustScore);
  return serializePost(populated as unknown as LeanPost, authorId);
}

export async function votePost(
  postId: string,
  userId: string,
  voteType: "up" | "down"
): Promise<PostFE | null> {
  if (!mongoose.Types.ObjectId.isValid(postId)) return null;
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  await connectDB();

  const userObjId = new mongoose.Types.ObjectId(userId);
  const post = await Post.findById(postId);
  if (!post) return null;

  // Prevent users from voting on their own posts
  if (post.author.equals(userObjId)) {
    console.log("[DEBUG] votePost - user attempted to vote on their own post");
    throw new Error("You cannot vote on your own post");
  }

  const hasUpvoted = post.upvotes.some((id) => id.equals(userObjId));
  const hasDownvoted = post.downvotes.some((id) => id.equals(userObjId));

  if (voteType === "up") {
    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter((id) => !id.equals(userObjId));
    } else {
      post.upvotes.push(userObjId);
      post.downvotes = post.downvotes.filter((id) => !id.equals(userObjId));
    }
  } else {
    if (hasDownvoted) {
      post.downvotes = post.downvotes.filter((id) => !id.equals(userObjId));
    } else {
      post.downvotes.push(userObjId);
      post.upvotes = post.upvotes.filter((id) => !id.equals(userObjId));
    }
  }

  post.score = post.upvotes.length - post.downvotes.length;
  await post.save();

  const populated = await Post.findById(post._id)
    .populate<{ author: PopulatedAuthor }>("author", POPULATE_AUTHOR)
    .populate<{ community: PopulatedCommunity }>("community", POPULATE_COMMUNITY)
    .lean();

  return serializePost(populated as unknown as LeanPost, userId);
}

export async function updatePost(
  postId: string,
  userId: string,
  updates: { title: string; content: string; tags: string[] }
): Promise<PostFE | null> {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    console.log("[DEBUG] updatePost - invalid post ID:", postId);
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("[DEBUG] updatePost - invalid user ID:", userId);
    throw new Error("Invalid user ID");
  }

  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Fetch the original post to check if content changed
  const originalPost = await Post.findOne({
    _id: postId,
    author: userObjectId,
  }).lean();

  if (!originalPost) {
    // Either the post doesn't exist or the user is not the owner
    throw new Error("Unauthorized: You can only edit your own posts");
  }

  // Determine if content or title changed
  const contentChanged = originalPost.content !== updates.content || originalPost.title !== updates.title;
  
  // Recalculate trustScore if content changed
  let trustScoreUpdate = {};
  if (contentChanged) {
    const textToScore = updates.content || updates.title;
    console.log("[DEBUG] updatePost - content changed, recalculating trustScore for text:", textToScore);
    const newTrustScore = await getTrustScore(textToScore);
    console.log("[DEBUG] updatePost - new trustScore calculated:", newTrustScore);
    trustScoreUpdate = { trustScore: newTrustScore };
  }

  // Update only the post owned by this user
  const result = await Post.findOneAndUpdate(
    {
      _id: postId,
      author: userObjectId,
    },
    {
      ...updates,
      ...trustScoreUpdate,
      updatedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate<{ author: PopulatedAuthor }>("author", POPULATE_AUTHOR)
    .populate<{ community: PopulatedCommunity }>("community", POPULATE_COMMUNITY)
    .lean();

  if (!result) {
    // Either the post doesn't exist or the user is not the owner
    throw new Error("Unauthorized: You can only edit your own posts");
  }

  console.log("[DEBUG] updatePost - update successful for post:", postId);
  return serializePost(result as unknown as LeanPost, userId);
}

export async function deletePost(
  postId: string,
  userId: string
): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    console.log("[DEBUG] deletePost - invalid post ID:", postId);
    return false;
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("[DEBUG] deletePost - invalid user ID:", userId);
    throw new Error("Invalid user ID");
  }

  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Delete only the post owned by this user
  const result = await Post.deleteOne({
    _id: postId,
    author: userObjectId,
  });

  console.log("[DEBUG] deletePost - deletion result:", { deletedCount: result.deletedCount });

  // Check if the post was deleted
  if (result.deletedCount === 0) {
    // Either the post doesn't exist or the user is not the owner
    throw new Error("Unauthorized: You can only delete your own posts");
  }

  if (result.deletedCount === 1) {
    console.log("[DEBUG] deletePost - post deleted successfully");
    return true;
  }

  // Should not reach here, but handle unexpected cases
  throw new Error("Unexpected error during post deletion");
}
