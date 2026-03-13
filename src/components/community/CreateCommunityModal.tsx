"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCommunityModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setName("");
      setDescription("");
      setError(null);
      setDone(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  const canSubmit = isAuthenticated && name.trim().length >= 3 && slug.length >= 3 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setError("A community with that name already exists.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const issues = data.issues as Record<string, string[]> | undefined;
        const first = issues ? Object.values(issues).flat()[0] : null;
        setError(first ?? data.error ?? "Failed to create community.");
        setSubmitting(false);
        return;
      }

      setDone(true);
      router.refresh();
      router.push(`/p/${slug}`);
      setTimeout(onClose, 800);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Create a Community
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-5xl">🎉</div>
              <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                Community created!
              </h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Redirecting to 🍐/{slug}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isAuthenticated && (
                <div
                  className="px-4 py-3 rounded-xl text-sm border"
                  style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}
                >
                  Sign in first to create a community.
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
                  COMMUNITY NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. DeFi Talk or blockchain-news"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none text-sm focus:border-purple-500 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                />
                {name.trim().length >= 3 && slug.length >= 3 && (
                  <p className="mt-1 text-xs" style={{ color: "#34d399" }}>
                    URL: <span style={{ color: "#a78bfa" }}>🍐/{slug}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
                  DESCRIPTION <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  placeholder="What is this community about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none text-sm resize-none focus:border-purple-500 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm border"
                  style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/5 transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                    canSubmit ? "hover:opacity-90 active:scale-[0.98]" : "opacity-40 cursor-not-allowed"
                  )}
                  style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                >
                  {submitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <Users size={14} />
                      Create Community
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
