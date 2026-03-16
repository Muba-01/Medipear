import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { connectDB } from "@/lib/db";
import Community from "@/models/Community";
import { INTEREST_COMMUNITY_HINTS } from "@/lib/onboarding";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const interests = user.interests ?? [];
  const keywords = interests.flatMap((interest) => INTEREST_COMMUNITY_HINTS[interest] ?? []);

  const regexFilters = keywords.map((keyword) => ({
    $or: [
      { name: new RegExp(keyword, "i") },
      { slug: new RegExp(keyword, "i") },
      { description: new RegExp(keyword, "i") },
    ],
  }));

  const query = regexFilters.length > 0 ? { $or: regexFilters } : {};

  const communities = await Community.find(query)
    .sort({ membersCount: -1 })
    .limit(12)
    .lean();

  return NextResponse.json({
    communities: communities.map((c) => ({
      id: c._id.toString(),
      slug: c.slug,
      name: c.name,
      description: c.description,
      membersCount: c.membersCount,
      iconUrl: c.iconUrl,
    })),
  });
}
