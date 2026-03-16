import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import User from "@/models/User";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

const ProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  bio: z.string().max(300).optional().default(""),
  birthday: z.string().optional().or(z.literal("")),
  profilePhoto: z.string().optional().or(z.literal("")),
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

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  await connectDB();

  const birthday = parsed.data.birthday ? new Date(parsed.data.birthday) : null;
  if (birthday && Number.isNaN(birthday.getTime())) {
    return NextResponse.json({ error: "Invalid birthday value" }, { status: 422 });
  }
  const profilePhoto = parsed.data.profilePhoto?.trim() ?? "";

  const updated = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        displayName: parsed.data.displayName,
        username: parsed.data.displayName,
        bio: parsed.data.bio ?? "",
        birthday,
        profilePhoto,
        avatarUrl: profilePhoto || user.avatarUrl || "",
        onboardingStep: Math.max(user.onboardingStep ?? 1, ONBOARDING_STEPS.interests),
      },
    },
    { new: true }
  );

  return NextResponse.json({
    onboardingStep: updated?.onboardingStep ?? ONBOARDING_STEPS.interests,
    displayName: updated?.displayName ?? parsed.data.displayName,
  });
}
