"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { useOnboardingState } from "@/components/onboarding/useOnboardingState";
import { INTEREST_OPTIONS } from "@/lib/onboarding";

export default function OnboardingInterestsPage() {
  const router = useRouter();
  const { state, loading } = useOnboardingState();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state) return;
    setSelected(state.interests ?? []);
  }, [state]);

  const toggle = (interest: string) => {
    setSelected((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);
  };

  const next = async () => {
    setSaving(true);
    await fetch("/api/onboarding/interests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests: selected }),
    });
    router.push("/onboarding/communities");
  };

  const skip = async () => {
    await fetch("/api/onboarding/step", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStep: 4 }),
    });
    router.push("/onboarding/communities");
  };

  if (loading) return null;

  return (
    <OnboardingShell
      step={3}
      title="Choose Your Interests"
      description="Select topics you care about to personalize your MediPear feed.">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {INTEREST_OPTIONS.map((interest) => {
          const active = selected.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => toggle(interest)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                background: active ? "var(--accent-muted)" : "var(--surface-2)",
                color: active ? "var(--accent-light)" : "var(--foreground)",
              }}>
              {interest}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => router.push("/onboarding/profile")}
          className="px-3 py-2 rounded-lg text-xs border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={skip}
            className="px-3 py-2 rounded-lg text-xs border"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Skip
          </button>
          <button
            onClick={next}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
            {saving ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
