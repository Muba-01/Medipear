"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, MessageSquare, CornerDownRight } from "lucide-react";
import { Comment } from "@/lib/types";
import { cn, formatNumber, timeAgo } from "@/lib/utils";

interface CommentCardProps {
  comment: Comment;
  depth?: number;
}

export default function CommentCard({ comment, depth = 0 }: CommentCardProps) {
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [downvotes, setDownvotes] = useState(comment.downvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(comment.userVote ?? null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const score = upvotes - downvotes;

  const handleVote = (direction: "up" | "down") => {
    if (userVote === direction) {
      setUserVote(null);
      direction === "up" ? setUpvotes((v) => v - 1) : setDownvotes((v) => v - 1);
    } else {
      if (userVote === "up") setUpvotes((v) => v - 1);
      if (userVote === "down") setDownvotes((v) => v - 1);
      setUserVote(direction);
      direction === "up" ? setUpvotes((v) => v + 1) : setDownvotes((v) => v + 1);
    }
  };

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-6 pl-4 border-l")}
      style={{ borderColor: depth > 0 ? "var(--border)" : "transparent" }}>
      {/* Avatar */}
      <img
        src={comment.author.avatar}
        alt={comment.author.username}
        className="w-7 h-7 rounded-full flex-shrink-0 mt-1"
        style={{ background: "var(--surface-2)" }}
      />

      <div className="flex-1 min-w-0">
        {/* Author + time */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <Link
            href={`/profile/${comment.author.walletAddress}`}
            className="text-sm font-semibold hover:text-purple-400 transition-colors"
            style={{ color: "var(--foreground)" }}>
            u/{comment.author.username}
          </Link>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {comment.author.karma.toLocaleString()} karma
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            · {timeAgo(comment.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--foreground)" }}>
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleVote("up")}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              style={{ color: userVote === "up" ? "#fb923c" : "var(--muted)" }}>
              <ArrowUp size={13} />
            </button>
            <span className="text-xs font-bold px-1"
              style={{ color: userVote ? (userVote === "up" ? "#fb923c" : "#60a5fa") : "var(--muted)" }}>
              {formatNumber(score)}
            </span>
            <button
              onClick={() => handleVote("down")}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              style={{ color: userVote === "down" ? "#60a5fa" : "var(--muted)" }}>
              <ArrowDown size={13} />
            </button>
          </div>

          <button
            onClick={() => setReplyOpen(!replyOpen)}
            className="flex items-center gap-1 text-xs hover:text-purple-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
            style={{ color: "var(--muted)" }}>
            <MessageSquare size={11} />
            Reply
          </button>
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
                onClick={() => setReplyOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs border hover:bg-white/5 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                Cancel
              </button>
              <button
                onClick={() => { setReplyOpen(false); setReplyText(""); }}
                disabled={!replyText.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--accent)" }}>
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
