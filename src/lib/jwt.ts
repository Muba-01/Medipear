import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-production"
);

export interface JWTData extends JWTPayload {
  walletAddress: string;
}

export async function signJWT(walletAddress: string): Promise<string> {
  return new SignJWT({ walletAddress })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTData | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTData;
  } catch {
    return null;
  }
}
