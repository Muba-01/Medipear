import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "ethers";
import { signJWT } from "@/lib/jwt";
import { findOrCreateUserByWallet } from "@/services/userService";
import { connectDB } from "@/lib/db";
import AuthNonce from "@/models/AuthNonce";

const COOKIE_NAME = "mp_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const NONCE_COOKIE = "mp_nonce_id";

export async function POST(req: NextRequest) {
  let body: { address?: string; signature?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { address, signature } = body;

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  if (!signature || typeof signature !== "string") {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const nonceId = req.cookies.get(NONCE_COOKIE)?.value;
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

  let recoveredAddress: string;
  try {
    recoveredAddress = verifyMessage(message, signature);
  } catch {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: "Signature does not match address" }, { status: 401 });
  }

  let isNewUser = false;
  if (process.env.MONGODB_URI) {
    try {
      const result = await findOrCreateUserByWallet(address);
      dbUser = result.user;
      isNewUser = result.isNewUser;
    } catch {
      // Non-fatal: proceed without DB
    }
  }
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

  const res = NextResponse.json({
    walletAddress: normalizedWalletAddress,
    username: dbUser?.username ?? null,
<<<<<<< HEAD
    userId: dbUser?._id?.toString() ?? null,
=======
    displayName: dbUser?.displayName ?? dbUser?.username ?? null,
    userId: dbUser?._id?.toString() ?? null,
    onboardingCompleted: !!dbUser?.onboardingCompleted,
    onboardingStep: dbUser?.onboardingStep ?? 1,
    email: dbUser?.email ?? null,
    walletLinked: true,
    googleLinked: !!dbUser?.googleId,
    emailLinked: !!dbUser?.email,
    provider: "wallet",
    isNewUser,
    needsGoogleLink: !dbUser?.googleId,
  });

  console.info("[wallet-auth] verify success", {
    providerWalletAddress: normalizedWalletAddress,
    sessionWalletAddress: normalizedWalletAddress,
    matches: true,
  });

  res.cookies.set(NONCE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return res;
}
