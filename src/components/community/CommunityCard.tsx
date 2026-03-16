"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, FileText, ChevronRight } from "lucide-react";
import { Community } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const [joined, setJoined] = useState(community.isJoined ?? false);

  return (
    <div className="rounded-xl border overflow-hidden transition-all group"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Banner */}
      <div className="h-12 flex items-center px-4 gap-3"
        style={{ background: community.banner }}>
        <span className="text-2xl">{community.icon}</span>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-on-banner)" }}>🍐/{community.slug}</h3>
          <p className="text-xs" style={{ color: "var(--text-on-banner-muted)" }}>{community.name}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm leading-relaxed mb-3 line-clamp-2"
          style={{ color: "var(--muted)" }}>
          {community.description}
        </p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
            <Users size={12} />
            {formatNumber(community.memberCount)} members
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
            <FileText size={12} />
            {formatNumber(community.postCount)} posts
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJoined(!joined)}
            className="flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={
              joined
                ? { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }
                : { background: "var(--accent)", color: "var(--text-on-accent)" }
            }>
            {joined ? "Joined" : "Join"}
          </button>
          <Link
            href={`/p/${community.slug}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg border theme-hover-surface transition-colors"
            style={{ borderColor: "var(--border)" }}>
            <ChevronRight size={14} style={{ color: "var(--muted)" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
