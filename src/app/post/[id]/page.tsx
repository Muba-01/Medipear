import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div
            className="rounded-xl border flex flex-col items-center justify-center py-24 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-4xl mb-4"></p>
            <h1 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Post not found
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This post may have been removed or does not exist yet.
            </p>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
