import { Compass } from "lucide-react";
import Link from "next/link";
import { getCommunities } from "@/services/communityService";
import CreateCommunityButton from "@/components/community/CreateCommunityButton";

export default async function ExplorePage() {
  let communities: Awaited<ReturnType<typeof getCommunities>> = [];
  try {
    communities = await getCommunities();
  } catch { /* DB not ready */ }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Explore Communities
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Discover and join communities on Medipear
          </p>
        </div>
        <CreateCommunityButton />
      </div>

      {communities.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communities.map((c) => (
            <Link
              key={c._id.toString()}
              href={`/p/${c.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl border hover:border-purple-500/40 transition-all"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                {c.slug.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: "var(--foreground)" }}>
                  🍐/{c.slug}
                </p>
                {c.description && (
                  <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--muted)" }}>
                    {c.description}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {c.membersCount.toLocaleString()} members
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
