"use client";

import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default function OnboardingWelcomePage() {
  const router = useRouter();

  const start = async () => {
    await fetch("/api/onboarding/step", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStep: 2 }),
    });
    router.push("/onboarding/profile");
  };

  return (
    <OnboardingShell
      step={1}
      title="Welcome to MediPear"
      description="A modern medical knowledge network for students and professionals.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Share Knowledge", text: "Post clinical insights, exam prep tips, and learning resources." },
          { title: "Join Communities", text: "Find specialty-focused groups and discussions that match your goals." },
          { title: "Earn Rewards", text: "Connect your wallet to unlock on-chain token incentives." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border p-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.title}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={start}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
          Get Started
        </button>
      </div>
    </OnboardingShell>
  );
}
