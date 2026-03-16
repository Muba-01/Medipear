import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAuthNonce extends Document {
  _id: mongoose.Types.ObjectId;
  address: string;
  nonce: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AuthNonceSchema = new Schema<IAuthNonce>(
  {
    address: { type: String, required: true, lowercase: true, trim: true, index: true },
    nonce: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// Auto-prune expired nonce records.
AuthNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).AuthNonce;
}

const AuthNonce: Model<IAuthNonce> =
  mongoose.models.AuthNonce ?? mongoose.model<IAuthNonce>("AuthNonce", AuthNonceSchema);

export default AuthNonce;
