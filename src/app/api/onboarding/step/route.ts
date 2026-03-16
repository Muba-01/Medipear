import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import User from "@/models/User";

const StepSchema = z.object({
  onboardingStep: z.number().int().min(1).max(7),
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

  const parsed = StepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid step" }, { status: 422 });
  }

  await connectDB();
  const nextStep = Math.max(user.onboardingStep ?? 1, parsed.data.onboardingStep);

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $set: { onboardingStep: nextStep } },
    { new: true }
  );

  return NextResponse.json({ onboardingStep: updated?.onboardingStep ?? nextStep });
}
