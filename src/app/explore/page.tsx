import { Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          Explore Communities
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Discover and join communities on MedPear
        </p>
      </div>

      <div
        className="flex flex-col items-center justify-center py-24 rounded-xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Compass size={48} style={{ color: "var(--muted)" }} className="mb-4 opacity-50" />
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          No communities yet
        </h2>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--muted)" }}>
          Communities will appear here once they are created. Check back soon!
        </p>
      </div>
    </div>
  );
}
