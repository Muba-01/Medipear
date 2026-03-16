import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import mongoose from "mongoose";

function generateUsername(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7);
  const clean = prefix.replace(/[^a-z0-9]/g, "").slice(0, 12) || "user";
  return `${clean}_${rand}`;
}

export async function findOrCreateUserByWallet(
  walletAddress: string
): Promise<{ user: IUser; isNewUser: boolean }> {
  await connectDB();
  const addr = walletAddress.toLowerCase();

  let user = await User.findOne({ walletAddress: addr });
  let isNewUser = false;

  if (!user) {
    const username = generateUsername(`user${addr.slice(2, 6)}`);
    user = await User.create({
      walletAddress: addr,
      username,
      authProvider: "wallet",
    });
    isNewUser = true;
  }

  return { user, isNewUser };
}

export async function findOrCreateUserByGoogleAccount(
  googleId: string,
  email: string,
  name?: string,
  image?: string
): Promise<IUser> {
  await connectDB();
  const lowerEmail = email.toLowerCase();

  const byGoogleId = await User.findOne({ googleId });
  if (byGoogleId) return byGoogleId;

  const existingByEmail = await User.findOne({ email: lowerEmail });
  if (existingByEmail) {
    if (existingByEmail.googleId && existingByEmail.googleId !== googleId) {
      throw new Error("Google account is already linked to another user");
    }
    existingByEmail.googleId = googleId;
    existingByEmail.googleLinked = true;
    if (!existingByEmail.avatarUrl && image) existingByEmail.avatarUrl = image;
    await existingByEmail.save();
    return existingByEmail;
  }

  const base = (name ?? lowerEmail.split("@")[0]).replace(/[^a-z0-9]/gi, "");
  const username = generateUsername(base || "user");
  return User.create({
    email: lowerEmail,
    googleId,
    googleLinked: true,
    username,
    avatarUrl: image ?? "",
    authProvider: "google",
  });
}

export async function linkGoogleToUser(
  userId: string,
  googleId: string,
  email: string,
  avatarUrl?: string
): Promise<IUser | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const lowerEmail = email.toLowerCase();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const googleConflict = await User.findOne({
    googleId,
    _id: { $ne: userObjectId },
  });
  if (googleConflict) {
    throw new Error("Google account already linked to another user");
  }

  const emailConflict = await User.findOne({
    email: lowerEmail,
    _id: { $ne: userObjectId },
  });
  if (emailConflict) {
    throw new Error("Email already linked to another account");
  }

  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        googleId,
        email: lowerEmail,
        googleLinked: true,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    },
    { new: true }
  );
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  return User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
}

export async function createUserWithEmail(
  email: string,
  username: string,
  passwordHash: string
): Promise<IUser> {
  await connectDB();
  return User.create({
    email: email.toLowerCase(),
    username,
    passwordHash,
    authProvider: "email",
  });
}

export async function getUserById(id: string): Promise<IUser | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return User.findById(id);
}

export async function getUserByWallet(walletAddress: string): Promise<IUser | null> {
  await connectDB();
  return User.findOne({ walletAddress: walletAddress.toLowerCase() });
}

export async function linkWalletToUser(
  userId: string,
  walletAddress: string
): Promise<IUser | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const normalizedWalletAddress = walletAddress.toLowerCase();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const walletConflict = await User.findOne({
    walletAddress: normalizedWalletAddress,
    _id: { $ne: userObjectId },
  });
  if (walletConflict) {
    throw new Error("Wallet already linked to another account");
  }

  return User.findByIdAndUpdate(
    userId,
    { walletAddress: normalizedWalletAddress },
    { new: true }
  );
}

export async function linkEmailToUser(
  userId: string,
  email: string,
  passwordHash: string
): Promise<IUser | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const lowerEmail = email.toLowerCase();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const emailConflict = await User.findOne({
    email: lowerEmail,
    _id: { $ne: userObjectId },
  });
  if (emailConflict) {
    throw new Error("Email already linked to another account");
  }

  const user = await User.findById(userObjectId).select("+passwordHash");
  if (!user) return null;

  user.email = lowerEmail;
  user.passwordHash = passwordHash;
  await user.save();
  return user;
}

export async function updateUser(
  userId: string,
  updates: { username?: string; bio?: string; avatarUrl?: string }
): Promise<IUser | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  if (updates.username) {
    const existing = await User.findOne({
      username: updates.username,
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
    });
    if (existing) throw new Error("Username already taken");
  }

  return User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
}
