import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { voteComment } from "@/services/commentService";
import { VoteSchema } from "@/lib/validations";
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

interface RouteContext {
  params: Promise<{ id: string }>;
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

  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 422 });
  }

  try {
    const result = await voteComment(id, user._id.toString(), parsed.data.voteType);
    if (!result) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
<<<<<<< HEAD
    
    // Trigger blockchain reward for upvotes asynchronously (fire and forget)
    if (parsed.data.voteType === "up") {
      try {
        await connectDB();
        const comment = await Comment.findById(id).populate("author");
        if (comment && comment.author && typeof comment.author === "object" && "walletAddress" in comment.author) {
          const author = comment.author as any;
          rewardsOracle.onCommentUpvoted(
            author.walletAddress,
            id,
            user._id.toString(),
            author._id?.toString()
          ).catch(console.error);
        }
      } catch (err) {
        console.error("[RewardsOracle] Failed to fetch comment for reward:", err);
      }
    }
    
=======
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to vote on comment";
    if (message.includes("own comment")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
