import ProfileHeader from "@/components/profile/ProfileHeader";
import PostList from "@/components/posts/PostList";
import Sidebar from "@/components/layout/Sidebar";

interface PageProps {
  params: Promise<{ wallet: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { wallet } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <ProfileHeader walletAddress={wallet} />
          <PostList posts={[]} />
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
