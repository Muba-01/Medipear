"use client";

import Link from "next/link";
import { Plus, Compass } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-4">
      {/* Communities placeholder */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Communities
          </span>
          <Link
            href="/explore"
            className="text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: "#a78bfa" }}>
            Explore
          </Link>
        </div>

        <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
          <Compass size={28} style={{ color: "var(--muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            No communities yet
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            Communities will appear here once the platform launches.
          </p>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-muted)", color: "#a78bfa" }}>
            <Plus size={12} />
            Create Community
          </Link>
        </div>
      </div>

      {/* Platform info */}
      <div
        className="rounded-xl border px-4 py-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          About MedPear
        </h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
          A Web3-native community platform where contributions are rewarded with on-chain tokens.
          Connect your wallet to participate.
        </p>
        <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <Link href="/explore" className="hover:text-purple-400 transition-colors">
            Explore communities →
          </Link>
          <Link href="/create" className="hover:text-purple-400 transition-colors">
            Create a post →
          </Link>
        </div>
      </div>
    </aside>
  );
}
