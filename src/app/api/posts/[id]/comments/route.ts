import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { getCommentsByPost, createComment } from "@/services/commentService";
import { CreateCommentSchema } from "@/lib/validations";
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const comments = await getCommentsByPost(id);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("GET /api/posts/[id]/comments", err);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const comment = await createComment(
      id,
      parsed.data.content,
      user._id.toString(),
      parsed.data.parentCommentId
    );
<<<<<<< HEAD
    
    // Trigger blockchain reward asynchronously (fire and forget)
    if (user.walletAddress) {
      rewardsOracle.onCommentCreated(user.walletAddress, comment.id, user._id.toString()).catch(console.error);
    }
    
=======
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
