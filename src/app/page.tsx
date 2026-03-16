import { Suspense } from "react";
import PostList from "@/components/posts/PostList";
import Sidebar from "@/components/layout/Sidebar";
import CreatePostButton from "@/components/forms/CreatePostButton";
import { getPosts } from "@/services/postService";
import { getCommunities } from "@/services/communityService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getUserByWallet, getUserById } from "@/services/userService";
import type { Post } from "@/lib/types";
import Link from "next/link";

const VALID_SORTS = ["hot", "new", "top", "rising"] as const;
type Sort = (typeof VALID_SORTS)[number];

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { sort } = await searchParams;
  const sortBy: Sort = VALID_SORTS.includes(sort as Sort) ? (sort as Sort) : "hot";

  let posts: Post[] = [];
  let recommendedCommunities: Awaited<ReturnType<typeof getCommunities>> = [];
  let joinedCommunityIds: string[] = [];
  let interests: string[] = [];

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mp_token")?.value;

    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.walletAddress) {
        const user = await getUserByWallet(payload.walletAddress);
        if (user) {
          joinedCommunityIds = (user.joinedCommunities ?? []).map((id) => id.toString());
          interests = user.interests ?? [];
        }
      }
    }

    if (joinedCommunityIds.length === 0) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const user = await getUserById(session.user.id);
        if (user) {
          joinedCommunityIds = (user.joinedCommunities ?? []).map((id) => id.toString());
          interests = user.interests ?? [];
        }
      }
    }
  } catch {
    // Ignore profile personalization errors and fall back to global feed.
  }

  try {
    if (joinedCommunityIds.length > 0) {
      posts = await getPosts({ sort: sortBy, communityIds: joinedCommunityIds, limit: 50 });
      if (posts.length < 20 && interests.length > 0) {
        const interestPosts = await getPosts({ sort: sortBy, interests, limit: 30 });
        const seen = new Set(posts.map((p) => p.id));
        posts = [...posts, ...interestPosts.filter((post) => !seen.has(post.id))];
      }
    } else if (interests.length > 0) {
      posts = await getPosts({ sort: sortBy, interests, limit: 50 });
      recommendedCommunities = await getCommunities();
    } else {
      posts = await getPosts({ sort: sortBy });
      recommendedCommunities = await getCommunities();
    }
  } catch { /* DB not connected yet — show empty state */ }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div
            className="relative rounded-xl overflow-hidden mb-5 p-6"
            style={{
              background: "var(--hero-gradient)",
            }}>
            <div className="relative z-10">
              <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-on-banner)" }}>
                Welcome to Medipear
              </h1>
              <p className="text-sm mb-4" style={{ color: "var(--text-on-banner-muted)" }}>
                The decentralized community platform for Web3 builders and explorers.
              </p>
              <CreatePostButton />
            </div>
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: "var(--hero-glow-1)", transform: "translate(30%, -30%)" }}
            />
            <div
              className="absolute bottom-0 right-16 w-32 h-32 rounded-full blur-2xl opacity-15"
              style={{ background: "var(--hero-glow-2)", transform: "translateY(20%)" }}
            />
          </div>

          {joinedCommunityIds.length === 0 && recommendedCommunities.length > 0 && (
            <div className="mb-5 rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                Recommended communities for you
              </h2>
              <div className="flex flex-wrap gap-2">
                {recommendedCommunities.slice(0, 6).map((community) => (
                  <Link
                    key={community._id.toString()}
                    href={`/p/${community.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs border theme-hover-surface"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface-2)" }}>
                    🍐/{community.slug}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Suspense>
            <PostList posts={posts} showSortBar />
          </Suspense>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
