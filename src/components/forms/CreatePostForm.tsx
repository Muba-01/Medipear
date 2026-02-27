"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Image, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn, shortenAddress } from "@/lib/utils";

export default function CreatePostForm() {
  const router = useRouter();
  const { walletAddress } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "image" | "link">("text");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push("/"), 1500);
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-5xl mb-4"></div>
        <h2 className="text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          Post submitted!
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Redirecting to home feed...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Author row */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
          {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "?"}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {walletAddress ? shortenAddress(walletAddress) : "Anonymous"}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Posting as wallet
          </p>
        </div>
      </div>

      {/* Post type tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {(["text", "image", "link"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              activeTab === tab ? "text-white" : "hover:bg-white/5"
            )}
            style={{
              background: activeTab === tab ? "var(--accent)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--muted)",
            }}>
            {tab === "image" && <Image size={13} />}
            {tab === "link" && <Link2 size={13} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Community */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <input
          type="text"
          placeholder="Community (e.g. defi-talk)"
          value={community}
          onChange={(e) => setCommunity(e.target.value)}
          className="w-full px-4 py-3 bg-transparent outline-none text-sm"
          style={{ color: "var(--foreground)" }}
        />
      </div>

      {/* Title */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <input
          type="text"
          placeholder="Title  be descriptive and specific"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 300))}
          maxLength={300}
          className="w-full px-4 py-3 bg-transparent outline-none text-base font-medium"
          style={{ color: "var(--foreground)" }}
        />
        <div className="px-4 pb-2 flex justify-end">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {title.length}/300
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="rounded-xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <textarea
          placeholder={
            activeTab === "text"
              ? "Share your thoughts, findings, or questions..."
              : activeTab === "link"
              ? "Paste a URL..."
              : "Image URL or description..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-transparent outline-none text-sm leading-relaxed resize-none"
          style={{ color: "var(--foreground)" }}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/5 transition-all"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || submitting}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
            isValid && !submitting
              ? "hover:opacity-90 active:scale-[0.98]"
              : "opacity-50 cursor-not-allowed"
          )}
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
          {submitting ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <Send size={14} />
              Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
