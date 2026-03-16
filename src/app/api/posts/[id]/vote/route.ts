import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { votePost } from "@/services/postService";
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
    return NextResponse.json(
      { error: "Invalid vote type. Must be 'up' or 'down'." },
      { status: 422 }
    );
  }

  try {
    const updated = await votePost(id, user._id.toString(), parsed.data.voteType);
    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
<<<<<<< HEAD
    
    // Trigger blockchain reward for upvotes asynchronously (fire and forget)
    if (parsed.data.voteType === "up") {
      try {
        await connectDB();
        const post = await Post.findById(id).populate("author");
        if (post && post.author && typeof post.author === "object" && "walletAddress" in post.author) {
          const author = post.author as any;
          rewardsOracle.onPostUpvoted(
            author.walletAddress,
            id,
            user._id.toString(),
            author._id?.toString()
          ).catch(console.error);
        }
      } catch (err) {
        console.error("[RewardsOracle] Failed to fetch post for reward:", err);
      }
    }
    
=======
    return NextResponse.json({ post: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to vote on post";
    if (message.includes("own post")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
