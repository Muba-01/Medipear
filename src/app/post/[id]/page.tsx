import { notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import PostCard from "@/components/posts/PostCard";
import CommentForm from "@/components/posts/CommentForm";
import ThreadedComments from "@/components/posts/ThreadedComments";
import { getPostById } from "@/services/postService";
import { getCommentsByPost } from "@/services/commentService";
import { MessageSquare, ExternalLink } from "lucide-react";
import type { Comment } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  let post = null;
  let comments: Comment[] = [];
  try {
    post = await getPostById(id);
    if (post) comments = await getCommentsByPost(id);
  } catch { /* DB not ready */ }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div
              className="rounded-xl border flex flex-col items-center justify-center py-24 text-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-4xl mb-4">🌑</p>
              <h1 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Post not found
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                This post may have been removed or does not exist.
              </p>
              <Link
                href="/"
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}>
                Back to Home
              </Link>
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Full post */}
          <PostCard post={post} />

          {/* Full content block (shown below card) */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Trust Score: {(post.trustScore * 100).toFixed(0)}
            </p>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
              {post.title}
            </h2>

            {/* Image / video post */}
            {post.postType === "image" && post.imageUrl && (
              <div className="mb-3 rounded-xl overflow-hidden" style={{ background: "var(--surface-2)" }}>
                {/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(post.imageUrl) ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={post.imageUrl}
                    controls
                    className="w-full max-h-[600px]"
                    style={{ background: "#000" }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full object-contain max-h-[600px]"
                  />
                )}
              </div>
            )}

            {/* Link post */}
            {post.postType === "link" && post.linkUrl && (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl border hover:opacity-80 transition-opacity"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,99,235,0.2)" }}>
                  <ExternalLink size={16} style={{ color: "#60a5fa" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: "#60a5fa" }}>
                    {(() => { try { return new URL(post.linkUrl).hostname; } catch { return post.linkUrl; } })()}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{post.linkUrl}</p>
                </div>
                <ExternalLink size={13} className="ml-auto flex-shrink-0" style={{ color: "var(--muted)" }} />
              </a>
            )}

            {/* Text / caption */}
            {post.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
                {post.content}
              </p>
            )}
          </div>

          {/* Comments section */}
          <div
            className="rounded-xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            {/* Header */}
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: "var(--border)" }}>
              <MessageSquare size={15} style={{ color: "var(--muted)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {comments.length} Comment{comments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Comment form */}
            <div className="border-b" style={{ borderColor: "var(--border)" }}>
              <CommentForm postId={id} />
            </div>

            {/* Comment list */}
            <ThreadedComments comments={comments} />
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
