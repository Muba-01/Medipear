import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { toggleJoinCommunity } from "@/services/communityService";
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const result = await toggleJoinCommunity(slug, user._id.toString());
<<<<<<< HEAD
    
    // Trigger blockchain reward if joining (result.joined === true) asynchronously (fire and forget)
    if (user.walletAddress && result?.joined) {
      rewardsOracle.onCommunityJoined(user.walletAddress, slug, user._id.toString()).catch(console.error);
    }
    
=======
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to join community";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
