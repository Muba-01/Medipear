"use client";

import { useState } from "react";
import CreatePostModal from "@/components/forms/CreatePostModal";

export default function SidebarCreateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="theme-hover-accent transition-colors text-left"
        style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
        Create a post →
      </button>
      <CreatePostModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
