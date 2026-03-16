import { Suspense } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
<<<<<<< HEAD
=======
import AccountConnections from "@/components/profile/AccountConnections";
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
import PostList from "@/components/posts/PostList";
import Sidebar from "@/components/layout/Sidebar";
import { getPosts } from "@/services/postService";
import { getUserByWallet, getUserById } from "@/services/userService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import type { Post } from "@/lib/types";

interface PageProps {
  params: Promise<{ wallet: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { wallet } = await params;

  let posts: Post[] = [];
  let user = null;
  let viewerUserId: string | null = null;

  try {
    // Determine who is viewing
    const cookieStore = await cookies();
    const token = cookieStore.get("mp_token")?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.walletAddress) {
        const viewer = await getUserByWallet(payload.walletAddress);
        viewerUserId = viewer?._id?.toString() ?? null;
      }
    }
    if (!viewerUserId) {
      const session = await getServerSession(authOptions);
      viewerUserId = session?.user?.id ?? null;
    }

    // Load profile user
    const isWalletAddress = /^0x[0-9a-fA-F]{40}$/i.test(wallet);
    user = isWalletAddress ? await getUserByWallet(wallet) : await getUserById(wallet);
    posts = await getPosts(
      isWalletAddress
        ? { authorWallet: wallet }
        : { authorId: wallet }
    );
  } catch { /* DB not ready */ }

  const profileUserId = user?._id?.toString() ?? null;
  const isOwnProfile = !!(viewerUserId && profileUserId && viewerUserId === profileUserId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <ProfileHeader
            walletAddress={user?.walletAddress ?? (wallet.startsWith("0x") ? wallet : undefined)}
            username={user?.username ?? null}
            avatarUrl={user?.avatarUrl ?? null}
            karma={user?.karma ?? 0}
            joinDate={user?.createdAt?.toISOString() ?? null}
            bio={user?.bio ?? ""}
            isOwnProfile={isOwnProfile}
          />
<<<<<<< HEAD
=======
          {isOwnProfile ? <AccountConnections /> : null}
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
          <Suspense><PostList posts={posts} /></Suspense>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
