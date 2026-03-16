"use client";

import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const enter = async () => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/onboarding/complete", { method: "POST" });
    if (res.ok) {
      await refreshProfile();
      router.replace("/home");
      return;
    }

    setLoading(false);
  };

  return (
    <OnboardingShell
      step={7}
      title="Your MediPear Feed Is Ready"
      description="Your interests and joined communities will shape what you see next.">
      <div className="rounded-xl border p-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--foreground)" }}>
          You are all set. Discover discussions, contribute insights, and grow your medical network.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={enter}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
          {loading ? "Entering..." : "Enter MediPear"}
        </button>
      </div>
    </OnboardingShell>
  );
}
