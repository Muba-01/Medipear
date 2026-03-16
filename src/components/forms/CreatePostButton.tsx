"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function CreatePostButton() {
  return (
    <Link
      href="/create"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
      style={{
        background: "var(--soft-accent-bg)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--accent-light)",
        color: "var(--text-on-accent)",
      }}>
      <Plus size={14} />
      Create Post
    </Link>
  );
}
