import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "ethers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { verifyJWT } from "@/lib/jwt";
import { linkWalletToUser, getUserByWallet, getUserById } from "@/services/userService";
import { connectDB } from "@/lib/db";
import AuthNonce from "@/models/AuthNonce";

/**
 * POST /api/auth/link-wallet
 * Links a verified wallet address to the currently authenticated user (Google or wallet session).
 * Body: { address: string, signature: string }
 */
export async function POST(req: NextRequest) {
  let body: { address?: string; signature?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { address, signature } = body;

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }
  if (!signature || typeof signature !== "string") {
    return NextResponse.json({ error: "signature is required" }, { status: 400 });
  }

  const nonceId = req.cookies.get("mp_nonce_id")?.value;
  if (!nonceId) {
    return NextResponse.json({ error: "Nonce expired or not found. Please try again." }, { status: 401 });
  }

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }

  const nonceDoc = await AuthNonce.findOne({
    _id: nonceId,
    address: address.toLowerCase(),
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!nonceDoc) {
    return NextResponse.json({ error: "Nonce expired or not found. Please try again." }, { status: 401 });
  }

  const nonce = nonceDoc.nonce;

  const message = `Sign this message to authenticate with Medipear.\n\nNonce: ${nonce}`;

  // Verify signature
  let recovered: string;
  try {
    recovered = verifyMessage(message, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
  }

  const consumed = await AuthNonce.findOneAndUpdate(
    {
      _id: nonceDoc._id,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { new: true }
  );
  if (!consumed) {
    return NextResponse.json({ error: "Nonce already used. Please try again." }, { status: 409 });
  }

  // Check wallet not already taken by another user
  // Resolve current user from either a wallet JWT or a NextAuth Google session
  let userId: string | null = null;

  const token = req.cookies.get("mp_token")?.value;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload?.walletAddress) {
      return NextResponse.json({ error: "Already authenticated with a wallet" }, { status: 400 });
    }
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    userId = session.user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const currentUser = await getUserById(userId);
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const normalizedAddress = address.toLowerCase();
  if (currentUser.walletAddress?.toLowerCase() === normalizedAddress) {
    return NextResponse.json({
      walletAddress: currentUser.walletAddress,
      username: currentUser.username,
      userId: currentUser._id.toString(),
    });
  }

  const existing = await getUserByWallet(normalizedAddress);
  if (existing && existing._id.toString() !== currentUser._id.toString()) {
    return NextResponse.json({ error: "Wallet already linked to another account" }, { status: 409 });
  }

  let updated = null;
  try {
    updated = await linkWalletToUser(userId, normalizedAddress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to link wallet";
    return NextResponse.json({ error: message }, { status: 409 });
  }
  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const res = NextResponse.json({
    walletAddress: updated.walletAddress,
    username: updated.username,
    userId: updated._id.toString(),
  });

  res.cookies.set("mp_nonce_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return res;
}
