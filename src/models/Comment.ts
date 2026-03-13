import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  score: number;
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post:    { type: Schema.Types.ObjectId, ref: "Post",    required: true },
    author:  { type: Schema.Types.ObjectId, ref: "User",    required: true },
    content: { type: String, required: true, trim: true, maxlength: 10_000 },
    upvotes:   [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    score: { type: Number, default: 0 },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
