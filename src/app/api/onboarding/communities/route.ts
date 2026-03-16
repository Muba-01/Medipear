import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { getAuthUser } from "@/lib/getAuthUser";
import { connectDB } from "@/lib/db";
import Community from "@/models/Community";
import User from "@/models/User";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

const CommunitiesSchema = z.object({
  communityIds: z.array(z.string()).max(20),
});

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CommunitiesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  await connectDB();

  const objectIds = parsed.data.communityIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const existing = await Community.find({ _id: { $in: objectIds } }).select("_id").lean();
  const existingIds = existing.map((c) => c._id);

  const alreadyJoinedSet = new Set((user.joinedCommunities ?? []).map((id) => id.toString()));
  const newlyJoined = existingIds.filter((id) => !alreadyJoinedSet.has(id.toString()));

  await User.findByIdAndUpdate(
    user._id,
    {
      $addToSet: { joinedCommunities: { $each: existingIds } },
      $set: { onboardingStep: Math.max(user.onboardingStep ?? 1, ONBOARDING_STEPS.connect) },
    }
  );

  if (newlyJoined.length > 0) {
    await Community.updateMany(
      { _id: { $in: newlyJoined } },
      { $inc: { membersCount: 1 } }
    );
  }

  return NextResponse.json({
    joinedCommunityIds: existingIds.map((id) => id.toString()),
    onboardingStep: ONBOARDING_STEPS.connect,
  });
}
