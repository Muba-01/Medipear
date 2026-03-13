"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, MessageSquare, ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Comment } from "@/lib/types";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface CommentCardProps {
  comment: Comment;
  depth?: number;
  hasReplies?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function CommentCard({ comment, depth = 0, hasReplies = false, collapsed = false, onToggleCollapse }: CommentCardProps) {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuth();

  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [downvotes, setDownvotes] = useState(comment.downvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(comment.userVote ?? null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const score = upvotes - downvotes;
  const isCommentAuthor = userId === comment.authorId;

  const handleVote = async (direction: "up" | "down") => {
    if (!isAuthenticated) return;
    if (isCommentAuthor) return;

    // Optimistic update
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevVote = userVote;

    if (userVote === direction) {
      setUserVote(null);
      direction === "up" ? setUpvotes((v) => v - 1) : setDownvotes((v) => v - 1);
    } else {
      if (userVote === "up") setUpvotes((v) => v - 1);
      if (userVote === "down") setDownvotes((v) => v - 1);
      setUserVote(direction);
      direction === "up" ? setUpvotes((v) => v + 1) : setDownvotes((v) => v + 1);
    }

    try {
      const res = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: direction }),
      });
      if (!res.ok) throw new Error("vote failed");
      const data = await res.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    } catch {
      // Rollback optimistic update
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
      setUserVote(prevVote);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !isAuthenticated) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/posts/${comment.postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim(), parentCommentId: comment.id }),
      });
      if (!res.ok) throw new Error("reply failed");
      setReplyOpen(false);
      setReplyText("");
      router.refresh();
    } catch {
      // keep box open on failure
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText.trim() }),
      });
      if (!res.ok) throw new Error("edit failed");
      setEditOpen(false);
      router.refresh();
    } catch {
      // keep edit open on failure
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setDeleteConfirm(false);
      router.refresh();
    } catch {
      // keep confirm open on failure
    } finally {
      setDeleteLoading(false);
    }
  };

  const isDeleted = comment.content === "Comment deleted by original user.";

  return (
    <div
      className={cn("flex gap-3", depth > 0 && "pl-3 border-l-2")}
      style={{
        marginLeft: depth > 0 ? `${depth * 24}px` : undefined,
        borderColor: depth > 0 ? "rgba(139, 92, 246, 0.3)" : "transparent"
      }}>
      {/* Avatar */}
      {comment.author.avatar ? (
        <img
          src={comment.author.avatar}
          alt={comment.author.username}
          className="w-7 h-7 rounded-full flex-shrink-0 mt-1 object-cover"
          style={{ background: "var(--surface-2)" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", minWidth: "28px" }}>
          {comment.author.username.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Author + time */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <Link
            href={`/profile/${comment.author.walletAddress || comment.authorId}`}
            className="text-sm font-semibold hover:text-purple-400 transition-colors"
            style={{ color: "var(--foreground)" }}>
            u/{comment.author.username}
          </Link>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {comment.author.karma.toLocaleString()} karma
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            · {timeAgo(comment.createdAt)}
            {comment.editedAt && <span className="ml-1">(edited)</span>}
          </span>
        </div>

        {/* Content */}
        <p
          className={cn(
            "text-sm leading-relaxed mb-2",
            isDeleted && "italic opacity-60"
          )}
          style={{ color: isDeleted ? "var(--muted)" : "var(--foreground)" }}>
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleVote("up")}
              disabled={isCommentAuthor || isDeleted}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isCommentAuthor ? "You cannot vote on your own comment" : isDeleted ? "Cannot vote on deleted comment" : undefined}
              style={{ color: userVote === "up" ? "#fb923c" : "var(--muted)" }}>
              <ArrowUp size={13} />
            </button>
            <span className="text-xs font-bold px-1"
              style={{ color: userVote ? (userVote === "up" ? "#fb923c" : "#60a5fa") : "var(--muted)" }}>
              {formatNumber(score)}
            </span>
            <button
              onClick={() => handleVote("down")}
              disabled={isCommentAuthor || isDeleted}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isCommentAuthor ? "You cannot vote on your own comment" : isDeleted ? "Cannot vote on deleted comment" : undefined}
              style={{ color: userVote === "down" ? "#60a5fa" : "var(--muted)" }}>
              <ArrowDown size={13} />
            </button>
          </div>

          {hasReplies && (
            <button
              onClick={onToggleCollapse}
              className="flex items-center gap-1 text-xs hover:text-purple-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
              style={{ color: "var(--muted)" }}
              title={collapsed ? "Expand replies" : "Collapse replies"}
            >
              {collapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              {collapsed ? "Show" : "Hide"} replies
            </button>
          )}

          {isCommentAuthor && !isDeleted && (
            <>
              <button
                onClick={() => setEditOpen(!editOpen)}
                className="flex items-center gap-1 text-xs hover:text-purple-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                style={{ color: "var(--muted)" }}>
                <Edit size={11} />
                Edit
              </button>

              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                style={{ color: "#ef4444" }}>
                <Trash2 size={11} />
                Delete
              </button>
            </>
          )}

          {!isDeleted && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex items-center gap-1 text-xs hover:text-purple-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
              style={{ color: "var(--muted)" }}>
              <MessageSquare size={11} />
              Reply
            </button>
          )}
        </div>

        {/* Reply box */}
        {replyOpen && (
          <div className="mt-3 flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author.username}...`}
              rows={3}
              className="flex-1 px-3 py-2 rounded-lg text-sm leading-relaxed resize-none outline-none border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setReplyOpen(false); setReplyText(""); }}
                className="px-3 py-1.5 rounded-lg text-xs border hover:bg-white/5 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || replyLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--accent)" }}>
                {replyLoading ? "..." : "Reply"}
              </button>
            </div>
          </div>
        )}

        {/* Edit box */}
        {editOpen && (
          <div className="mt-3 flex gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edit your comment..."
              rows={3}
              className="flex-1 px-3 py-2 rounded-lg text-sm leading-relaxed resize-none outline-none border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setEditOpen(false); setEditText(comment.content); }}
                className="px-3 py-1.5 rounded-lg text-xs border hover:bg-white/5 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editText.trim() || editLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--accent)" }}>
                {editLoading ? "..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              className="rounded-lg border p-6 max-w-sm mx-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--foreground)" }}>
                Delete Comment?
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                This will replace the comment content with "Comment deleted by original user." This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(false)}
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
      </div>
    </div>
  );
}
