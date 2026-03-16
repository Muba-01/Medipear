import mongoose, { Document, Model, Schema } from "mongoose";

export type PostType = "text" | "image" | "link";
export type AIStatus = "approved" | "rejected" | "pending";

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  postType: PostType;
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  score: number;
  tags: string[];
  imageUrl?: string;
  linkUrl?: string;
  commentCount: number;
  trustScore: number;
  aiModerationStatus: AIStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, default: "" },
    postType: { type: String, enum: ["text", "image", "link"], default: "text" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    score: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    imageUrl: { type: String, trim: true },
    linkUrl: { type: String, trim: true },
    commentCount: { type: Number, default: 0, min: 0 },
    trustScore: { type: Number, default: 0.5, min: 0, max: 1 },
    aiModerationStatus: { type: String, enum: ["approved", "rejected", "pending"], default: "pending" },
  },
  { timestamps: true }
);

PostSchema.index({ community: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ score: -1, createdAt: -1 });

const Post: Model<IPost> =
  mongoose.models.Post ?? mongoose.model<IPost>("Post", PostSchema);

export default Post;
