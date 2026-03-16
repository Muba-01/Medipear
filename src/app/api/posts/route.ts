import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { getPosts, createPost } from "@/services/postService";
import { CreatePostSchema } from "@/lib/validations";
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const communitySlug = searchParams.get("community") ?? undefined;
  const sort = (searchParams.get("sort") ?? "hot") as "hot" | "new" | "top" | "rising";
  const search = searchParams.get("q") ?? undefined;
  const authorId = searchParams.get("authorId") ?? undefined;

  try {
    const user = await getAuthUser(req);
    const posts = await getPosts({ communitySlug, sort, search, authorId }, user?._id.toString());
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const post = await createPost(parsed.data, user._id.toString());
<<<<<<< HEAD
    
    // Trigger blockchain reward asynchronously (fire and forget)
    if (user.walletAddress) {
      rewardsOracle.onPostCreated(user.walletAddress, post.id, user._id.toString()).catch(console.error);
    }
    
=======
    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
