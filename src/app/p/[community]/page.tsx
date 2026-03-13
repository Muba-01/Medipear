import PostList from "@/components/posts/PostList";
import Sidebar from "@/components/layout/Sidebar";
import { FileText } from "lucide-react";
import { getCommunityBySlug } from "@/services/communityService";
import { getPosts } from "@/services/postService";
import CommunityPostButton from "@/components/community/CommunityPostButton";
import JoinCommunityButton from "@/components/community/JoinCommunityButton";
import type { Post } from "@/lib/types";

import { Suspense } from "react";

const VALID_SORTS = ["hot", "new", "top", "rising"] as const;
type Sort = (typeof VALID_SORTS)[number];

interface PageProps {
  params: Promise<{ community: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function CommunityPage({ params, searchParams }: PageProps) {
  const { community: slug } = await params;
  const { sort } = await searchParams;
  const sortBy: Sort = VALID_SORTS.includes(sort as Sort) ? (sort as Sort) : "hot";

  let community = null;
  let posts: Post[] = [];
  try {
    [community, posts] = await Promise.all([
      getCommunityBySlug(slug),
      getPosts({ communitySlug: slug, sort: sortBy }),
    ]);
  } catch { /* DB not ready */ }

  const memberCount = community?.membersCount ?? 0;
  const description = community?.description || `A community for ${slug} discussions.`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div
        className="rounded-xl border overflow-hidden mb-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div
          className="h-28 flex items-end pb-0 px-6"
          style={{
            background: "linear-gradient(135deg, #3b1f6e 0%, #1e3a8a 60%, #0f172a 100%)",
          }}>
          <div className="flex items-center gap-4 translate-y-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white border-4"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                borderColor: "var(--surface)",
              }}>
              {slug.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-10 pb-4 px-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold mb-0.5" style={{ color: "var(--foreground)" }}>
                🍐/{slug}
              </h1>
              <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>
                {description}
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--muted)" }}>
                  <FileText size={14} />
                  <span>{posts.length} posts</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CommunityPostButton slug={slug} />
              <JoinCommunityButton slug={slug} initialMembersCount={memberCount} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <Suspense>
            <PostList posts={posts} showSortBar />
          </Suspense>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
