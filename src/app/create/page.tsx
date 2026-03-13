import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Shield, Users, Zap } from "lucide-react";
import CreatePostForm from "@/components/forms/CreatePostForm";

export const metadata = { title: "Create Post · Medipear" };

export default function CreatePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--muted)" }}>
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      <h1 className="text-xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
        Create a Post
      </h1>

      <div className="flex gap-6 items-start">
        {/* ── Left column: post composer ───────────────────────── */}
        <div className="flex-1 min-w-0">
          <Suspense>
            <CreatePostForm />
          </Suspense>
        </div>

        {/* ── Right column: posting guidelines ─────────────────── */}
        <aside className="hidden lg:flex flex-col gap-4 w-80 flex-shrink-0">
          {/* Guidelines card */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div
              className="px-4 py-3 border-b flex items-center gap-2"
              style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, #3b1f6e 0%, #1e3a8a 60%, #0f172a 100%)" }}>
              <Zap size={14} className="text-white" />
              <span className="text-sm font-semibold text-white">Posting to Medipear</span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {[
                { n: 1, text: "Remember the human — be respectful and considerate in all interactions." },
                { n: 2, text: "Behave as if you're in a public space — follow community rules." },
                { n: 3, text: "No hate speech, harassment, or doxxing." },
                { n: 4, text: "Spam, vote manipulation, and ban evasion are prohibited." },
                { n: 5, text: "Reposts within 3 months of the original are not allowed." },
              ].map(({ n, text }) => (
                <div key={n} className="flex gap-3 px-4 py-3">
                  <span
                    className="text-xs font-bold mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent)", color: "#fff", fontSize: "10px" }}>
                    {n}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="px-4 py-3 border-t"
              style={{ borderColor: "var(--border)" }}>
              <Link
                href="/p/help"
                className="text-xs font-medium hover:underline"
                style={{ color: "var(--accent)" }}>
                Read full posting guidelines →
              </Link>
            </div>
          </div>

          {/* Tips card */}
          <div
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Info size={14} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Tips for a great post
              </span>
            </div>
            {[
              { Icon: Shield, tip: "Choose the most relevant community for your post." },
              { Icon: Users, tip: "A clear title gets more engagement than a vague one." },
              { Icon: Zap, tip: "Include context — help readers understand your post quickly." },
            ].map(({ Icon, tip }, i) => (
              <div key={i} className="flex gap-2.5">
                <Icon size={13} className="flex-shrink-0 mt-0.5" style={{ color: "var(--muted)" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{tip}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

