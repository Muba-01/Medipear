"use client";

import { useState } from "react";
import { CheckCircle2, Link2, Loader2, Mail, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shortenAddress } from "@/lib/utils";

function GoogleBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.3 9 3.4l6.7-6.7C35.6 2.5 30.1 0 24 0 14.7 0 6.8 5.4 3 13.3l7.8 6C12.7 13.3 17.9 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z" />
      <path fill="#FBBC05" d="M10.8 28.7A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.4 2.2-6.1 0-11.3-3.8-13.2-9.2l-7.8 6C6.8 42.6 14.7 48 24 48z" />
    </svg>
  );
}

export default function AccountConnections() {
  const { walletLinked, googleLinked, emailLinked, walletAddress, email, linkWallet, linkGoogle, linkEmail } = useAuth();
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setError(null);
    setLoadingWallet(true);
    try {
      await linkWallet();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet.");
    } finally {
      setLoadingWallet(false);
    }
  };

  const connectGoogle = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await linkGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect Google.");
      setLoadingGoogle(false);
    }
  };

  const connectEmail = async () => {
    setError(null);
    if (!emailInput.trim()) {
      setError("Email is required.");
      return;
    }
    if (passwordInput.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoadingEmail(true);
    try {
      await linkEmail(emailInput.trim(), passwordInput);
      setEmailInput("");
      setPasswordInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add email login.");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <section className="rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
        Account Connections
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wallet size={14} style={{ color: "var(--accent-light)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Wallet</p>
            </div>
            {walletLinked ? <CheckCircle2 size={15} style={{ color: "var(--green)" }} /> : null}
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Status: {walletLinked ? "Connected" : "Not Connected"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {walletLinked && walletAddress ? shortenAddress(walletAddress) : "Connect MetaMask to enable on-chain rewards."}
          </p>
          {!walletLinked ? (
            <button
              onClick={connectWallet}
              disabled={loadingWallet || loadingGoogle || loadingEmail}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
              {loadingWallet ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
              Connect Wallet
            </button>
          ) : null}
        </div>

        <div className="rounded-lg border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GoogleBadge />
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Google</p>
            </div>
            {googleLinked ? <CheckCircle2 size={15} style={{ color: "var(--green)" }} /> : null}
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Status: {googleLinked ? "Connected" : "Not Connected"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {googleLinked ? email ?? "Google account linked" : "Connect Google for recovery and account portability."}
          </p>
          {!googleLinked ? (
            <button
              onClick={connectGoogle}
              disabled={loadingWallet || loadingGoogle || loadingEmail}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
              {loadingGoogle ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
              Connect Google
            </button>
          ) : null}
        </div>

        <div className="rounded-lg border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: "var(--accent-light)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Email</p>
            </div>
            {emailLinked ? <CheckCircle2 size={15} style={{ color: "var(--green)" }} /> : null}
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Status: {emailLinked ? "Connected" : "Not Connected"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {emailLinked ? email ?? "Email login linked" : "Add email login for alternate sign-in and recovery."}
          </p>
          {!emailLinked ? (
            <div className="mt-3 flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border text-xs outline-none"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <input
                type="password"
                placeholder="Password (min 8 chars)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border text-xs outline-none"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={connectEmail}
                disabled={loadingWallet || loadingGoogle || loadingEmail}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
                {loadingEmail ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                Add Email Login
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-xs mt-3 px-2.5 py-2 rounded-lg" style={{ color: "var(--red)", background: "var(--surface-2)" }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
