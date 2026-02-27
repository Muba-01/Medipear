import PostList from "@/components/posts/PostList";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div
            className="relative rounded-xl overflow-hidden mb-5 p-6"
            style={{
              background: "linear-gradient(135deg, #3b1f6e 0%, #1e3a8a 60%, #0f172a 100%)",
            }}>
            <div className="relative z-10">
              <h1 className="text-xl font-bold text-white mb-1">
                Welcome to MedPear
              </h1>
              <p className="text-sm text-white/60 mb-4">
                The decentralized community platform for Web3 builders and explorers.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}>
                <Plus size={14} />
                Create Post
              </Link>
            </div>
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: "#7c3aed", transform: "translate(30%, -30%)" }}
            />
            <div
              className="absolute bottom-0 right-16 w-32 h-32 rounded-full blur-2xl opacity-15"
              style={{ background: "#2563eb", transform: "translateY(20%)" }}
            />
          </div>

          <PostList posts={[]} showSortBar />
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
