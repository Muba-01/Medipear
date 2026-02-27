"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Zap,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Post } from "@/lib/types";
import { cn, formatNumber, timeAgo } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(post.userVote ?? null);
  const [saved, setSaved] = useState(false);

  const score = upvotes - downvotes;

  const handleVote = (direction: "up" | "down") => {
    if (userVote === direction) {
      setUserVote(null);
      if (direction === "up") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (userVote === "up") setUpvotes((v) => v - 1);
      if (userVote === "down") setDownvotes((v) => v - 1);
      setUserVote(direction);
      if (direction === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
  };

  return (
    <article
      className="rounded-xl border hover:border-purple-500/40 transition-all group"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 px-2 pt-3 pb-3 rounded-l-xl"
          style={{ background: "var(--surface-2)" }}>
          <button
            onClick={() => handleVote("up")}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all hover:bg-white/10",
              userVote === "up" ? "text-orange-400" : ""
            )}
            style={{ color: userVote === "up" ? "#fb923c" : "var(--muted)" }}>
            <ArrowUp size={16} />
          </button>
          <span
            className="text-xs font-bold"
            style={{
              color:
                userVote === "up"
                  ? "#fb923c"
                  : userVote === "down"
                  ? "#60a5fa"
                  : "var(--foreground)",
            }}>
            {formatNumber(score)}
          </span>
          <button
            onClick={() => handleVote("down")}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all hover:bg-white/10"
            style={{ color: userVote === "down" ? "#60a5fa" : "var(--muted)" }}>
            <ArrowDown size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-3">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Link
              href={`/r/${post.community.slug}`}
              className="text-xs font-semibold hover:text-purple-400 transition-colors"
              style={{ color: "var(--foreground)" }}>
              r/{post.community.slug}
            </Link>
            <span style={{ color: "var(--border)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Posted by{" "}
              <Link
                href={`/profile/${post.author.walletAddress}`}
                className="hover:text-purple-400 transition-colors">
                u/{post.author.username}
              </Link>
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`}>
            <h2
              className={cn(
                "font-semibold leading-snug mb-2 group-hover:text-purple-300 transition-colors",
                compact ? "text-base" : "text-base"
              )}
              style={{ color: "var(--foreground)" }}>
              {post.title}
            </h2>
          </Link>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content preview */}
          {!compact && (
            <p
              className="text-sm leading-relaxed mb-3 line-clamp-3"
              style={{ color: "var(--muted)" }}>
              {post.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 flex-wrap">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors"
              style={{ color: "var(--muted)" }}>
              <MessageSquare size={13} />
              <span>{formatNumber(post.commentCount)} Comments</span>
            </Link>

            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "var(--accent-muted)",
                color: "#a78bfa",
              }}>
              <Zap size={13} />
              <span>{post.tokenReward} MPR</span>
            </div>

            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors ml-1"
              style={{ color: "var(--muted)" }}>
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors"
              style={{ color: saved ? "#a78bfa" : "var(--muted)" }}>
              <Bookmark size={13} fill={saved ? "#a78bfa" : "none"} />
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "var(--muted)" }}>
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
