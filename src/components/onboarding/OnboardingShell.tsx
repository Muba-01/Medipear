"use client";

import Link from "next/link";

interface OnboardingShellProps {
  step: number;
  totalSteps?: number;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function OnboardingShell({
  step,
  totalSteps = 7,
  title,
  description,
  children,
  footer,
}: OnboardingShellProps) {
  const progress = Math.min(100, Math.max(0, Math.round((step / totalSteps) * 100)));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            Step {step} of {totalSteps}
          </span>
          <Link href="/home" className="text-xs hover:opacity-80" style={{ color: "var(--muted)" }}>
            Skip onboarding
          </Link>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--brand-gradient)" }} />
        </div>
      </div>

      <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{title}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{description}</p>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
