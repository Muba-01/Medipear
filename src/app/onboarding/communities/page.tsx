"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

type CommunityRecommendation = {
  id: string;
  slug: string;
  name: string;
  description: string;
  membersCount: number;
  iconUrl: string;
};

export default function OnboardingCommunitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<CommunityRecommendation[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/onboarding/recommendations", { cache: "no-store" });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCommunities(data.communities ?? []);
      setLoading(false);
    })();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  };

  const next = async () => {
    setSaving(true);
    await fetch("/api/onboarding/communities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityIds: selected }),
    });
    router.push("/onboarding/connect");
  };

  const skip = async () => {
    await fetch("/api/onboarding/step", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStep: 5 }),
    });
    router.push("/onboarding/connect");
  };

  if (loading) return null;

  return (
    <OnboardingShell
      step={4}
      title="Recommended Communities"
      description="Join a few communities now to tailor your feed from day one.">
      <div className="space-y-2">
        {communities.length === 0 ? (
          <div className="rounded-xl border p-4 text-sm" style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--muted)" }}>
            No recommendations yet. You can discover communities later from Explore.
          </div>
        ) : communities.map((community) => {
          const active = selected.includes(community.id);
          return (
            <button
              key={community.id}
              onClick={() => toggle(community.id)}
              className="w-full text-left rounded-xl border p-3"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                background: active ? "var(--accent-muted)" : "var(--surface-2)",
              }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{community.iconUrl || "🍐"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>🍐/{community.slug}</p>
                  <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{community.description || community.name}</p>
                </div>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{community.membersCount} members</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => router.push("/onboarding/interests")}
          className="px-3 py-2 rounded-lg text-xs border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
          Back
        </button>
        <div className="flex gap-2">
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
