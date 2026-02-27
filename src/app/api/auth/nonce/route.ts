import { NextRequest, NextResponse } from "next/server";
import { generateNonce } from "@/lib/nonce";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const nonce = generateNonce(address);

  return NextResponse.json({
    nonce,
    message: `Sign this message to authenticate with MedPear.\n\nNonce: ${nonce}`,
  });
}
