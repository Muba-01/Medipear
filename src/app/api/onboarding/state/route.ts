import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    onboardingCompleted: !!user.onboardingCompleted,
    onboardingStep: user.onboardingStep ?? 1,
    username: user.username,
    displayName: user.displayName ?? user.username,
    bio: user.bio ?? "",
    birthday: user.birthday ?? null,
    avatarUrl: user.avatarUrl ?? "",
    interests: user.interests ?? [],
    joinedCommunities: user.joinedCommunities?.map((id) => id.toString()) ?? [],
    walletLinked: !!user.walletAddress,
    googleLinked: !!user.googleId,
    emailLinked: !!user.email,
  });
}
