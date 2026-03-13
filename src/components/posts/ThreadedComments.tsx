"use client";

import { useState } from "react";
import CommentCard from "./CommentCard";
import { Comment } from "@/lib/types";

interface ThreadedCommentsProps {
  comments: Comment[];
}

interface CommentNode {
  comment: Comment;
  replies: CommentNode[];
  collapsed: boolean;
}

function buildCommentTree(comments: Comment[]): CommentNode[] {
  const commentMap = new Map<string, CommentNode>();

  // Create entries for all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { comment, replies: [], collapsed: false });
  });

  // Build parent-child relationships
  const rootComments: CommentNode[] = [];
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;
    if (comment.parentComment) {
      const parentNode = commentMap.get(comment.parentComment);
      if (parentNode) {
        parentNode.replies.push(node);
      }
    } else {
      rootComments.push(node);
    }
  });

  // Sort root comments by score descending (higher score first)
  rootComments.sort((a, b) => b.comment.score - a.comment.score);

  // Sort replies by creation time ascending (older first)
  function sortReplies(node: CommentNode) {
    node.replies.sort((a, b) => new Date(a.comment.createdAt).getTime() - new Date(b.comment.createdAt).getTime());
    node.replies.forEach(sortReplies);
  }

  rootComments.forEach(sortReplies);

  return rootComments;
}

function CommentThread({ node, depth = 0 }: { node: CommentNode; depth: number }) {
  const [collapsed, setCollapsed] = useState(node.collapsed);

  const hasReplies = node.replies.length > 0;

  return (
    <>
      <div className="relative">
        {/* Comment */}
        <div className="px-5 py-4">
          <CommentCard
            comment={node.comment}
            depth={depth}
            hasReplies={hasReplies}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Replies */}
        {!collapsed && node.replies.length > 0 && (
          <div>
            {node.replies.map((reply) => (
              <CommentThread key={reply.comment.id} node={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ThreadedComments({ comments }: ThreadedCommentsProps) {
  const commentTree = buildCommentTree(comments);

  if (comments.length === 0) {
    return (
      <div className="px-5 py-10 flex flex-col items-center text-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 opacity-40" style={{ background: "var(--surface-2)" }}>
          💬
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          No comments yet
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Be the first to share your thoughts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
      {commentTree.map((node) => (
        <CommentThread key={node.comment.id} node={node} depth={0} />
      ))}
    </div>
  );
}