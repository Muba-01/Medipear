import Link from "next/link";
import { Plus, Compass } from "lucide-react";
import { getCommunities } from "@/services/communityService";
import SidebarCreateButton from "./SidebarCreateButton";
import CreateCommunityButton from "@/components/community/CreateCommunityButton";

export default async function Sidebar() {
  let communities: Awaited<ReturnType<typeof getCommunities>> = [];
  try {
    communities = await getCommunities();
  } catch { /* DB not ready */ }

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-4">
      {/* Communities */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Communities
          </span>
          <div className="flex items-center gap-2">
            <CreateCommunityButton compact />
            <Link
              href="/explore"
              className="text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--accent-light)" }}>
              See all
            </Link>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
            <Compass size={24} style={{ color: "var(--muted)" }} className="opacity-50" />
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              No communities yet. Be the first to create one!
            </p>
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-medium mt-1"
              style={{ background: "var(--accent-muted)", color: "var(--accent-light)" }}>
              <Plus size={12} />
              Create Community
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {communities.slice(0, 8).map((c) => (
              <Link
                key={c._id.toString()}
                href={`/p/${c.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 theme-hover-surface transition-colors"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
                  {c.slug.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                    🍐/{c.slug}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {c.membersCount.toLocaleString()} members
                  </p>
                </div>
              </Link>
            ))}
            <Link
              href="/explore"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium theme-hover-surface transition-colors"
              style={{ color: "var(--accent-light)" }}>
              <Compass size={12} />
              Explore all communities
            </Link>
          </div>
        )}
      </div>

      {/* Platform info */}
      <div
        className="rounded-xl border px-4 py-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          About Medipear
        </h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
          A Web3-native community platform where contributions are rewarded with on-chain tokens.
          Connect your wallet to participate.
        </p>
        <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <Link href="/explore" className="theme-hover-accent transition-colors">
            Explore communities →
          </Link>
          <SidebarCreateButton />
        </div>
      </div>
    </aside>
  );
}
