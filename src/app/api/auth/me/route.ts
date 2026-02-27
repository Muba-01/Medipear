import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

const COOKIE_NAME = "mp_token";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ walletAddress: null }, { status: 401 });
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    return NextResponse.json({ walletAddress: null }, { status: 401 });
  }

  return NextResponse.json({ walletAddress: payload.walletAddress });
}
