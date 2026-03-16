"use client";

import { useState } from "react";
import { Check, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  slug: string;
  initialJoined?: boolean;
  initialMembersCount: number;
}

export default function JoinCommunityButton({ slug, initialJoined = false, initialMembersCount }: Props) {
  const { isAuthenticated } = useAuth();
  const [joined, setJoined] = useState(initialJoined);
  const [membersCount, setMembersCount] = useState(initialMembersCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    // Optimistic update
    const wasJoined = joined;
    setJoined(!wasJoined);
    setMembersCount((c) => wasJoined ? c - 1 : c + 1);

    try {
      const res = await fetch(`/api/communities/${slug}/join`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setJoined(data.joined);
        setMembersCount(data.membersCount);
      } else {
        // Revert on error
        setJoined(wasJoined);
        setMembersCount((c) => wasJoined ? c + 1 : c - 1);
      }
    } catch {
      setJoined(wasJoined);
      setMembersCount((c) => wasJoined ? c + 1 : c - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
        <Users size={14} />
        <span>{membersCount.toLocaleString()} members</span>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading || !isAuthenticated}
        className={cn(
          "px-5 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95",
          joined
            ? "theme-hover-surface border"
            : "hover:opacity-90",
          loading && "opacity-60 cursor-not-allowed",
          !isAuthenticated && "opacity-60 cursor-not-allowed"
        )}
        style={
          joined
            ? { borderColor: "var(--border)", color: "var(--foreground)" }
            : { background: "var(--accent)", color: "var(--text-on-accent)" }
        }
        title={!isAuthenticated ? "Sign in to join" : undefined}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
        ) : joined ? (
          <span className="flex items-center gap-1.5">
            <Check size={13} />
            Joined
          </span>
        ) : (
          "Join"
        )}
      </button>
    </div>
  );
}
