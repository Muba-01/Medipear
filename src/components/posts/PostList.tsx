"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Flame, Clock, TrendingUp, Zap } from "lucide-react";
import { Post } from "@/lib/types";
import PostCard from "./PostCard";
import { cn } from "@/lib/utils";

interface PostListProps {
  posts: Post[];
  showSortBar?: boolean;
}

const SORT_OPTIONS = [
  { key: "hot",    label: "Hot",    icon: Flame     },
  { key: "new",    label: "New",    icon: Clock     },
  { key: "top",    label: "Top",    icon: TrendingUp },
  { key: "rising", label: "Rising", icon: Zap       },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export default function PostList({ posts: initialPosts, showSortBar = true }: PostListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const sortBy = (searchParams.get("sort") as SortKey) ?? "hot";

  const handleSort = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className={cn("flex flex-col gap-3", pending && "opacity-60 pointer-events-none transition-opacity")}>
      {showSortBar && (
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                sortBy === key ? "" : "theme-hover-surface"
              )}
              style={{
                background: sortBy === key ? "var(--accent)" : "transparent",
                color: sortBy === key ? "var(--text-on-accent)" : "var(--muted)",
              }}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      )}

      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post}
          onPostDeleted={() => handlePostDeleted(post.id)}
        />
      ))}

      {posts.length === 0 && (
        <div className="text-center py-16 rounded-xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-2xl mb-2">🌑</p>
          <p className="font-medium" style={{ color: "var(--foreground)" }}>No posts yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Be the first to post something here.
          </p>
        </div>
      )}
    </div>
  );
}
