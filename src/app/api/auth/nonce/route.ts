import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import AuthNonce from "@/models/AuthNonce";

const NONCE_COOKIE = "mp_nonce_id";
const NONCE_TTL_SECONDS = 5 * 60;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const normalizedAddress = address.toLowerCase();
  const nonce = randomBytes(32).toString("hex");

  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }

  const nonceDoc = await AuthNonce.create({
    address: normalizedAddress,
    nonce,
    expiresAt: new Date(Date.now() + NONCE_TTL_SECONDS * 1000),
  });

  const res = NextResponse.json({
    nonce,
    message: `Sign this message to authenticate with Medipear.\n\nNonce: ${nonce}`,
  });

  res.cookies.set(NONCE_COOKIE, nonceDoc._id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: NONCE_TTL_SECONDS,
    path: "/",
  });

  return res;
}
