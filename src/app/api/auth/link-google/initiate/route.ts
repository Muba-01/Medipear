import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { signLinkJWT } from "@/lib/jwt";

const COOKIE_NAME = "mp_link";
const COOKIE_MAX_AGE = 60 * 5; // 5 minutes

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (user.googleId || user.googleLinked) {
    return NextResponse.json({ error: "Google account already linked" }, { status: 409 });
  }

  const token = await signLinkJWT(user._id.toString());

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
