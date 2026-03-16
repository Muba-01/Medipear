import { NextResponse } from "next/server";

const COOKIE_NAME = "mp_token";
const NONCE_COOKIE = "mp_nonce_id";
const LINK_COOKIE = "mp_link";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  res.cookies.set(NONCE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
<<<<<<< HEAD
=======
  res.cookies.set(LINK_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  return res;
}
