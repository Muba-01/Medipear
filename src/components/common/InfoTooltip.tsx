"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export default function InfoTooltip({ text, className = "" }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        className="w-4 h-4 flex items-center justify-center cursor-help opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="More information"
      >
        <Info size={14} style={{ color: "var(--muted)" }} />
      </button>

      {showTooltip && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 z-50 text-white text-xs rounded-lg leading-relaxed pointer-events-none"
          style={{
            marginLeft: "10px",
            minWidth: "260px",
            maxWidth: "360px",
            padding: "10px",
            display: "block",
            wordBreak: "normal",
            overflowWrap: "normal",
            whiteSpace: "pre-line",
            background: "rgba(35, 35, 35, 0.95)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}
