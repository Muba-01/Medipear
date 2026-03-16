import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import User from "@/models/User";
import { INTEREST_OPTIONS, ONBOARDING_STEPS } from "@/lib/onboarding";

const InterestSchema = z.object({
  interests: z.array(z.enum(INTEREST_OPTIONS)).max(12),
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

  const parsed = InterestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        interests: parsed.data.interests,
        onboardingStep: Math.max(user.onboardingStep ?? 1, ONBOARDING_STEPS.communities),
      },
    },
    { new: true }
  );

  return NextResponse.json({
    interests: updated?.interests ?? parsed.data.interests,
    onboardingStep: updated?.onboardingStep ?? ONBOARDING_STEPS.communities,
  });
}
