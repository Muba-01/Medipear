"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreatePostModal from "@/components/forms/CreatePostModal";

export default function CommunityPostButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border theme-hover-surface transition-all"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <Plus size={14} />
        Post
      </button>
      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultCommunity={slug}
      />
    </>
  );
}
