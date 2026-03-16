"use client";

import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { useAuth } from "@/contexts/AuthContext";

export default function OnboardingConnectPage() {
  const router = useRouter();
  const { walletLinked, googleLinked, linkWallet, linkGoogle } = useAuth();

  const next = async () => {
    await fetch("/api/onboarding/step", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStep: 6 }),
    });
    router.push("/onboarding/first-post");
  };

  return (
    <OnboardingShell
      step={5}
      title="Connect Accounts"
      description="Link additional accounts to unlock rewards and make recovery easier.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border p-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>MetaMask Wallet</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Enables blockchain rewards and token features.</p>
          <button
            onClick={() => void linkWallet()}
            disabled={walletLinked}
            className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
            style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
            {walletLinked ? "Connected" : "Connect Wallet"}
          </button>
        </div>

        <div className="rounded-xl border p-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Google Account</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Faster login and account recovery across devices.</p>
          <button
            onClick={() => void linkGoogle()}
            disabled={googleLinked}
            className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
            style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
            {googleLinked ? "Connected" : "Connect Google"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => router.push("/onboarding/communities")}
          className="px-3 py-2 rounded-lg text-xs border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={next}
            className="px-3 py-2 rounded-lg text-xs border"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Skip
          </button>
          <button
            onClick={next}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
            Next
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
