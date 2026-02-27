import { Zap, Calendar, ExternalLink } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

interface ProfileHeaderProps {
  walletAddress: string;
}

export default function ProfileHeader({ walletAddress }: ProfileHeaderProps) {
  const joinDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div
        className="h-24 w-full"
        style={{
          background: "linear-gradient(135deg, #3b1f6e 0%, #1e3a8a 50%, #0f172a 100%)",
        }}
      />

      <div className="px-5 pb-5">
        <div className="flex items-end gap-4 -mt-8 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white border-4 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              borderColor: "var(--surface)",
            }}>
            {walletAddress.slice(2, 4).toUpperCase()}
          </div>

          <div className="pb-1 flex-1 min-w-0">
            <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              {shortenAddress(walletAddress)}
            </h1>
            <div className="flex items-center gap-1.5">
              <span
                className="text-xs font-mono truncate max-w-[220px]"
                style={{ color: "var(--muted)" }}>
                {walletAddress}
              </span>
              <a
                href={`https://etherscan.io/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity flex-shrink-0">
                <ExternalLink size={10} style={{ color: "var(--muted)" }} />
              </a>
            </div>
          </div>

          <button
            className="ml-auto flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium border hover:bg-white/5 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Follow
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBox
            label="Karma"
            value="0"
            icon={<span className="text-sm">⭐</span>}
            color="#fb923c"
          />
          <StatBox
            label="MPR Earned"
            value="0"
            icon={<Zap size={14} style={{ color: "#a78bfa" }} />}
            color="#a78bfa"
          />
          <StatBox
            label="Member since"
            value={joinDate}
            icon={<Calendar size={14} style={{ color: "#60a5fa" }} />}
            color="#60a5fa"
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {label}
        </span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
