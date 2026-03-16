"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Zap,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Trash2,
} from "lucide-react";
import { Post } from "@/lib/types";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import EditPostModal from "./EditPostModal";

interface PostCardProps {
  post: Post;
  compact?: boolean;
  onPostDeleted?: () => void;
}

export default function PostCard({ post, compact = false, onPostDeleted }: PostCardProps) {
  const { isAuthenticated, userId } = useAuth();
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(post.userVote ?? null);
  const [saved, setSaved] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const score = upvotes - downvotes;
  const isPostAuthor = userId === post.authorId;
  const displayedEarned = Math.max(
    0,
    Number(post.author.tokensEarned ?? 0),
    Number(post.tokenReward ?? 0)
  );

  const handleVote = async (direction: "up" | "down") => {
    if (!isAuthenticated) {
      setVoteError(true);
      setTimeout(() => setVoteError(false), 1500);
      return;
    }
    if (isPostAuthor) {
      setVoteError(true);
      setTimeout(() => setVoteError(false), 1500);
      return;
    }
    // Optimistic update
    const prevVote = userVote;
    const prevUp = upvotes;
    const prevDown = downvotes;
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

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: direction }),
      });
      if (!res.ok) {
        // Rollback
        setUserVote(prevVote);
        setUpvotes(prevUp);
        setDownvotes(prevDown);
      }
    } catch {
      setUserVote(prevVote);
      setUpvotes(prevUp);
      setDownvotes(prevDown);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const isPostOwner = userId === post.authorId;

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete post");
        return;
      }
      setShowDeleteConfirm(false);
      setShowMenu(false);
      if (onPostDeleted) {
        onPostDeleted();
      } else {
        // Redirect to home if no callback provided
        router.push("/");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async (updatedData: { title: string; content: string; tags: string[] }) => {
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || "Failed to edit post");
        return;
      }
      setShowEditModal(false);
      setShowMenu(false);
      // Refresh the page to show updated post
      window.location.reload();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to edit post");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <article
      className="rounded-xl border hover:border-purple-500/40 transition-all group"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex">
        {/* Vote column */}
        <div
          className="flex flex-col items-center gap-1 px-2 pt-3 pb-3 rounded-l-xl transition-colors"
          title={!isAuthenticated ? "Sign in to vote" : isPostAuthor ? "You cannot vote on your own post" : undefined}
          style={{ background: voteError ? "rgba(239,68,68,0.15)" : "var(--surface-2)" }}
        >
          <button
            onClick={() => handleVote("up")}
            disabled={isPostAuthor}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed",
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
            disabled={isPostAuthor}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: userVote === "down" ? "#60a5fa" : "var(--muted)" }}>
            <ArrowDown size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-3">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Link
              href={`/p/${post.community.slug}`}
              className="text-xs font-semibold hover:text-purple-400 transition-colors"
              style={{ color: "var(--foreground)" }}>
              🍐/{post.community.slug}
            </Link>
            <span style={{ color: "var(--border)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Posted by{" "}
              <Link
                href={`/profile/${post.author.walletAddress || post.authorId}`}
                className="hover:text-purple-400 transition-colors">
                u/{post.author.username}
              </Link>
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }} suppressHydrationWarning>
              {timeAgo(post.createdAt)}
              {new Date(post.updatedAt) > new Date(post.createdAt) && (
                <span className="ml-1" style={{ color: "var(--muted)" }}>(edited)</span>
              )}
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {formatNumber(displayedEarned)} MPR earned
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

          {/* Image / video thumbnail (image posts) */}
          {post.postType === "image" && post.imageUrl && !compact && (
            <Link href={`/post/${post.id}`} className="block mb-3 rounded-xl overflow-hidden"
              style={{ background: "var(--surface-2)" }}>
              {/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(post.imageUrl) ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={post.imageUrl}
                  controls
                  className="w-full max-h-96"
                  style={{ background: "#000" }}
                  onClick={(e) => e.preventDefault()}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full max-h-96 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </Link>
          )}

          {/* Link chip (link posts) */}
          {post.postType === "link" && post.linkUrl && (
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity max-w-full truncate"
              style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }}>
              <ExternalLink size={10} className="flex-shrink-0" />
              <span className="truncate">
                {(() => { try { return new URL(post.linkUrl).hostname; } catch { return post.linkUrl; } })()}
              </span>
            </a>
          )}

          {/* Content preview */}
          {!compact && post.content && (
            <p
              className="text-sm leading-relaxed mb-3 line-clamp-3"
              style={{ color: "var(--muted)" }}>
              {post.content}
            </p>
          )}

          {/* Image post: small indicator when compact */}
          {compact && post.postType === "image" && (
            <span className="inline-flex items-center gap-1 text-xs mb-2" style={{ color: "var(--muted)" }}>
              <ImageIcon size={11} /> Image
            </span>
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
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors ml-1"
              style={{ color: copied ? "#22c55e" : "var(--muted)" }}>
              {copied ? <Check size={13} /> : <Share2 size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors"
              style={{ color: saved ? "#a78bfa" : "var(--muted)" }}>
              <Bookmark size={13} fill={saved ? "#a78bfa" : "none"} />
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </button>

            <div className="ml-auto relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: "var(--muted)" }}>
                <MoreHorizontal size={14} />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  {isPostOwner && (
                    <>
                      <button
                        onClick={() => {
                          setShowEditModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors"
                        style={{ color: "var(--foreground)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Post
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-500/10 transition-colors"
                        style={{ color: "#ef4444" }}>
                        <Trash2 size={14} />
                        Delete Post
                      </button>
                    </>
                  )}
                  {!isPostOwner && (
                    <div className="px-4 py-2 text-xs" style={{ color: "var(--muted)" }}>
                      No actions available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delete confirmation dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div
                className="rounded-lg border p-6 max-w-sm"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}>
                  Delete Post?
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                  This action cannot be undone. Are you sure you want to delete this post?
                </p>
                {deleteError && (
                  <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
                    {deleteError}
                  </p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                    style={{ color: "var(--foreground)" }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ background: "#ef4444" }}>
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit modal */}
          {showEditModal && (
            <EditPostModal
              post={post}
              onClose={() => setShowEditModal(false)}
              onSave={handleEdit}
              loading={editLoading}
              error={editError}
            />
          )}
        </div>
      </div>
    </article>
  );
}

