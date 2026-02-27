import CreatePostForm from "@/components/forms/CreatePostForm";
import Sidebar from "@/components/layout/Sidebar";
import { Lightbulb } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Create a Post
          </h1>
          <CreatePostForm />
        </div>

        {/* Tips sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-4">
          <div className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b flex items-center gap-2"
              style={{ borderColor: "var(--border)" }}>
              <Lightbulb size={14} style={{ color: "#fbbf24" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Posting Guidelines
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { title: "Be specific", body: "Detailed posts earn significantly more MPR tokens and receive better engagement." },
                { title: "Choose the right community", body: "Posting in the correct community improves visibility and karma." },
                { title: "Add relevant tags", body: "Tags help others discover your content through search." },
                { title: "Share original insights", body: "First-hand research, code, and analysis is valued over reposts." },
                { title: "Cite your sources", body: "Link to protocols, papers, or repos when referencing external work." },
              ].map((tip) => (
                <div key={tip.title}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>
                    {tip.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {tip.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Token info */}
          <div className="rounded-xl border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
              Token Rewards
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Post published", reward: "+10 MPR" },
                { label: "Per upvote received", reward: "+2 MPR" },
                { label: "Post goes trending", reward: "+50 MPR" },
                { label: "Front page feature", reward: "+200 MPR" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>
                    {item.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
