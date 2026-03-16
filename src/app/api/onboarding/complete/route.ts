import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await User.findByIdAndUpdate(user._id, {
    $set: {
      onboardingCompleted: true,
      onboardingStep: ONBOARDING_STEPS.complete,
    },
  });

  return NextResponse.json({ onboardingCompleted: true, onboardingStep: ONBOARDING_STEPS.complete });
}
