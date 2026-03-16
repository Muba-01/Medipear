import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserByWallet, getUserById, updateUser } from "@/services/userService";
import { getAuthUser } from "@/lib/getAuthUser";
import { UpdateProfileSchema } from "@/lib/validations";

const COOKIE_NAME = "mp_token";

export async function GET(req: NextRequest) {
  // 1. Wallet JWT cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload?.walletAddress) {
      console.info("[wallet-auth] me wallet session", {
        sessionWalletAddress: payload.walletAddress,
      });

      if (process.env.MONGODB_URI) {
        try {
          const dbUser = await getUserByWallet(payload.walletAddress);
          if (dbUser) {
              displayName: dbUser.displayName ?? dbUser.username,
              avatarUrl: dbUser.avatarUrl,
              karma: dbUser.karma,
              bio: dbUser.bio ?? null,
              birthday: dbUser.birthday ?? null,
              interests: dbUser.interests ?? [],
              joinedCommunities: dbUser.joinedCommunities?.map((id) => id.toString()) ?? [],
              onboardingCompleted: !!dbUser.onboardingCompleted,
              onboardingStep: dbUser.onboardingStep ?? 1,
              email: dbUser.email ?? null,
              provider: "wallet",
              walletLinked,
              googleLinked,
              emailLinked,
              needsGoogleLink: !googleLinked,
              needsWalletLink: false,
            });
          }
        } catch { /* fall through */ }
      }
      return NextResponse.json({
        walletAddress: payload.walletAddress,
        userId: null,
        username: null,
        bio: null,
        provider: "wallet",
      });
    }
  }

  // 2. NextAuth session (Google OAuth)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
          const walletLinked = !!dbUser.walletAddress;
          const googleLinked = !!dbUser.googleId;
          const emailLinked = !!dbUser.email;
          return NextResponse.json({
            walletAddress: dbUser.walletAddress ?? null,
            userId: dbUser._id.toString(),
            username: dbUser.username,
            displayName: dbUser.displayName ?? dbUser.username,
            avatarUrl: dbUser.avatarUrl,
            karma: dbUser.karma,
            bio: dbUser.bio ?? null,
            birthday: dbUser.birthday ?? null,
            interests: dbUser.interests ?? [],
            joinedCommunities: dbUser.joinedCommunities?.map((id) => id.toString()) ?? [],
            onboardingCompleted: !!dbUser.onboardingCompleted,
            onboardingStep: dbUser.onboardingStep ?? 1,
            email: dbUser.email ?? null,
            provider,
            walletLinked,
            googleLinked,
            emailLinked,
            needsGoogleLink: provider === "wallet" && !googleLinked,
            needsWalletLink: provider === "google" && !walletLinked,
          });
        }
      } catch { /* fall through */ }
    }
    return NextResponse.json({
      walletAddress: null,
      userId: session.user.id,
      username: session.user.name ?? null,
      provider,
      onboardingCompleted: false,
      onboardingStep: 1,
      needsGoogleLink: false,
      needsWalletLink: provider === "google",
    });
  }

  return NextResponse.json({ walletAddress: null }, { status: 401 });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  try {
    const updated = await updateUser(user._id.toString(), parsed.data);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({
      userId: updated._id.toString(),
      username: updated.username,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
