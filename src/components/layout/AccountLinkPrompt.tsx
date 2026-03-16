"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type PromptType = "google" | "wallet" | null;

function getPromptStorageKey(userId: string | null, promptType: PromptType): string | null {
  if (!userId || !promptType) return null;
  return `medipear-link-skip:${userId}:${promptType}`;
}

export default function AccountLinkPrompt() {
  const {
    isAuthenticated,
    provider,
    userId,
    needsGoogleLink,
    needsWalletLink,
    googleLinked,
    walletLinked,
    linkGoogle,
    linkWallet,
  } = useAuth();

  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promptType: PromptType = useMemo(() => {
    if (!isAuthenticated) return null;
    if (provider === "wallet" && needsGoogleLink && !googleLinked) return "google";
    if (provider === "google" && needsWalletLink && !walletLinked) return "wallet";
    return null;
  }, [googleLinked, isAuthenticated, needsGoogleLink, needsWalletLink, provider, walletLinked]);

  useEffect(() => {
    setDismissed(false);
    setError(null);
  }, [userId, promptType]);

  useEffect(() => {
    const key = getPromptStorageKey(userId, promptType);
    if (!key) return;
    const skipped = localStorage.getItem(key) === "1";
    setDismissed(skipped);
  }, [userId, promptType]);

  const skipPrompt = () => {
    const key = getPromptStorageKey(userId, promptType);
    if (key) localStorage.setItem(key, "1");
    setDismissed(true);
  };

  const connect = async () => {
    if (!promptType) return;
    setError(null);
    setLoading(true);
    try {
      if (promptType === "google") {
        await linkGoogle();
      } else {
        await linkWallet();
      }
      const key = getPromptStorageKey(userId, promptType);
      if (key) localStorage.removeItem(key);
      setDismissed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to link account.");
    } finally {
      setLoading(false);
    }
  };

  if (!promptType || dismissed) return null;

  const isGooglePrompt = promptType === "google";

  return (
    <div className="fixed top-16 right-4 z-50 w-[min(92vw,360px)] rounded-xl border p-4 shadow-2xl"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Account Linking
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
            {isGooglePrompt
              ? "Connect your Google account to enable additional features and account recovery."
              : "Connect your wallet to enable blockchain rewards and token features."}
          </p>
        </div>
        <button
          onClick={skipPrompt}
          className="w-6 h-6 rounded-md flex items-center justify-center theme-hover-surface"
          style={{ color: "var(--muted)" }}
          aria-label="Skip account linking prompt">
          <X size={14} />
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs px-2.5 py-2 rounded-lg" style={{ color: "var(--red)", background: "var(--surface-2)" }}>
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={connect}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
          style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
          {isGooglePrompt ? "Connect Google" : "Connect Wallet"}
        </button>
        <button
          onClick={skipPrompt}
          className="px-3 py-2 rounded-lg text-xs font-medium border theme-hover-surface"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          Skip
        </button>
      </div>
    </div>
  );
}
