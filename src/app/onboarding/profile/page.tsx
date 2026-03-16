"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { useOnboardingState } from "@/components/onboarding/useOnboardingState";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { state, loading } = useOnboardingState();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    setDisplayName(state.displayName || state.username || "");
    setBio(state.bio || "");
    setPhotoUrl(state.avatarUrl || "");
    setBirthday(state.birthday ? new Date(state.birthday).toISOString().slice(0, 10) : "");
  }, [state]);

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to upload photo");
    }
    const data = await res.json();
    setPhotoUrl(data.avatarUrl ?? "");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/onboarding/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim(),
        bio,
        birthday: birthday ? new Date(birthday).toISOString() : "",
        profilePhoto: photoUrl,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save profile");
      setSubmitting(false);
      return;
    }

    router.push("/onboarding/interests");
  };

  if (loading) return null;

  return (
    <OnboardingShell
      step={2}
      title="Create Your Profile"
      description="Set up your public profile so peers can recognize your contributions.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          Display Name *
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
            required
          />
        </label>

        <label className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          Profile Photo (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void uploadPhoto(file).catch((err) => setError(err instanceof Error ? err.message : "Upload failed"));
            }}
            className="mt-1 w-full text-xs"
            style={{ color: "var(--muted)" }}
          />
        </label>

        <label className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          Bio (optional)
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </label>

        <label className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          Birthday (optional)
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </label>

        {error ? <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p> : null}

        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="px-3 py-2 rounded-lg text-xs border"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
            {submitting ? "Saving..." : "Next"}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
