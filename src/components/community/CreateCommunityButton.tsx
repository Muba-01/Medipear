"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateCommunityModal from "./CreateCommunityModal";

interface Props {
  compact?: boolean;
}

export default function CreateCommunityButton({ compact }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {compact ? (
        <button
          onClick={() => setOpen(true)}
          title="Create Community"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium theme-hover-surface transition-all border"
          style={{ borderColor: "var(--border)", color: "var(--accent-light)" }}>
          <Plus size={11} />
          New
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}
        >
          <Plus size={14} />
          Create Community
        </button>
      )}
      <CreateCommunityModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
