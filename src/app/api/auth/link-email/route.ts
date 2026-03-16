import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/getAuthUser";
import { hashPassword } from "@/lib/password";
import { linkEmailToUser } from "@/services/userService";

const LinkEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LinkEmailSchema.safeParse(body);
  if (!parsed.success) {
    const message = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const updated = await linkEmailToUser(user._id.toString(), parsed.data.email, passwordHash);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: updated._id.toString(),
      email: updated.email ?? null,
      emailLinked: !!updated.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to link email";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
