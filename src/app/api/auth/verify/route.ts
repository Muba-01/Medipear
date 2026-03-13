import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "ethers";
import { signJWT } from "@/lib/jwt";
import { findOrCreateUserByWallet } from "@/services/userService";

const COOKIE_NAME = "mp_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const NONCE_COOKIE = "mp_nonce";

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

  const nonceCookie = req.cookies.get(NONCE_COOKIE)?.value;
  if (!nonceCookie) {
    return NextResponse.json({ error: "Nonce expired or not found. Please try again." }, { status: 401 });
  }

  let nonce = "";
  try {
    const decoded = JSON.parse(Buffer.from(nonceCookie, "base64url").toString("utf8")) as {
      address?: string;
      nonce?: string;
      exp?: number;
    };

    if (
      decoded.address?.toLowerCase() !== address.toLowerCase() ||
      !decoded.nonce ||
      typeof decoded.exp !== "number" ||
      Date.now() > decoded.exp
    ) {
      throw new Error("Invalid nonce challenge");
    }

    nonce = decoded.nonce;
  } catch {
    return NextResponse.json({ error: "Nonce expired or not found. Please try again." }, { status: 401 });
  }

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

  const token = await signJWT(address.toLowerCase());

  // Upsert user record in MongoDB (no-op if DB not configured)
  let dbUser = null;
  if (process.env.MONGODB_URI) {
    try {
      dbUser = await findOrCreateUserByWallet(address);
    } catch {
      // Non-fatal: proceed without DB
    }
  }

  const res = NextResponse.json({
    walletAddress: address.toLowerCase(),
    username: dbUser?.username ?? null,
    userId: dbUser?._id?.toString() ?? null,
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
