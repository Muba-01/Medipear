"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

type Community = { id: string; slug: string; name: string };

export default function OnboardingFirstPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/communities", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data.communities ?? []).map((c: { _id: string; slug: string; name: string }) => ({
        id: c._id,
        slug: c.slug,
        name: c.name,
      }));
      setCommunities(mapped);
      if (mapped.length > 0) setCommunitySlug(mapped[0].slug);
    })();
  }, []);

  const finish = async () => {
    await fetch("/api/onboarding/step", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStep: 7 }),
    });
    router.push("/onboarding/complete");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!communitySlug) {
      setError("Please choose a community.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        content,
        communitySlug,
        postType: "text",
        tags: [],
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create post");
      setSaving(false);
      return;
    }

    await finish();
  };

  return (
    <OnboardingShell
      step={6}
      title="Create Your First Post"
      description="Introduce yourself to the community. You can also skip this step.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Tell us about your goals, interests, or background..."
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <select
          value={communitySlug}
          onChange={(e) => setCommunitySlug(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          {communities.map((community) => (
            <option key={community.id} value={community.slug}>🍐/{community.slug}</option>
          ))}
        </select>

        {error ? <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p> : null}

        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={() => router.push("/onboarding/connect")}
            className="px-3 py-2 rounded-lg text-xs border"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void finish()}
              className="px-3 py-2 rounded-lg text-xs border"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              Skip
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
              {saving ? "Posting..." : "Publish & Continue"}
            </button>
          </div>
        </div>
      </form>
    </OnboardingShell>
  );
}
