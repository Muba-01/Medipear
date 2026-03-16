import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findOrCreateUserByGoogleAccount, findUserByEmail, getUserById, linkGoogleToUser } from "@/services/userService";
import { verifyPassword } from "@/lib/password";
import { verifyLinkJWT } from "@/lib/jwt";

export function buildAuthOptions(rawLinkToken?: string | null): AuthOptions {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      }),
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await findUserByEmail(credentials.email);
          if (!user || !user.passwordHash) return null;
          const valid = await verifyPassword(credentials.password, user.passwordHash);
          if (!valid) return null;
          return {
            id: user._id.toString(),
            email: user.email ?? "",
            name: user.username,
            image: user.avatarUrl ?? null,
          };
        },
      }),
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async signIn({ account, user }) {
        if (account?.provider === "google" && (!user.email || !account.providerAccountId)) {
          return false;
        }

        if (account?.provider === "google" && rawLinkToken) {
          const linkPayload = await verifyLinkJWT(rawLinkToken);
          if (!linkPayload?.userId) return false;
        }

        return true;
      },

      async jwt({ token, account, user }) {
        // ── Google account linking ──────────────────────────────────────────────
        if (account?.provider === "google" && rawLinkToken) {
          if (!user?.email || !account.providerAccountId) {
            throw new Error("Invalid Google link payload");
          }

          const linkPayload = await verifyLinkJWT(rawLinkToken);
          if (!linkPayload?.userId) {
            throw new Error("Google link session expired");
          }

          const linked = await linkGoogleToUser(
            linkPayload.userId,
            account.providerAccountId,
            user.email,
            user.image ?? undefined
          );

          if (!linked) {
            throw new Error("Failed to link Google account");
          }

          token.userId = linked._id.toString();
          token.username = linked.username;
          token.walletAddress = linked.walletAddress ?? null;
          token.provider = "google";
          return token;
        }

        // ── Normal Google sign-in ───────────────────────────────────────────────
        if (account?.provider === "google" && user?.email && account.providerAccountId) {
          try {
            const dbUser = await findOrCreateUserByGoogleAccount(
              account.providerAccountId,
              user.email,
              user.name ?? undefined,
              user.image ?? undefined
            );
            token.userId = dbUser._id.toString();
            token.username = dbUser.username;
            token.walletAddress = dbUser.walletAddress ?? null;
            token.provider = "google";
          } catch {
            token.userId = token.sub ?? undefined;
            token.username = user.name ?? user.email ?? undefined;
            token.walletAddress = null;
            token.provider = "google";
          }
        }

        // ── Credentials sign-in ─────────────────────────────────────────────────
        if (account?.provider === "credentials" && user?.id) {
          const dbUser = await findUserByEmail(user.email ?? "");
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.username = dbUser.username;
            token.walletAddress = dbUser.walletAddress ?? null;
          } else {
            token.userId = user.id;
            token.username = user.name ?? undefined;
            token.walletAddress = null;
          }
          token.provider = "email";
        }

        return token;
      },

      async session({ session, token }) {
        if (token.userId) {
          let walletAddress = token.walletAddress ?? null;
          let username = token.username ?? "";

          try {
            const dbUser = await getUserById(token.userId);
            if (dbUser) {
              walletAddress = dbUser.walletAddress ?? null;
              username = dbUser.username;
            }
          } catch {
            // Keep token-derived values if DB read fails.
          }

          session.user.id = token.userId;
          session.user.username = username;
          session.user.walletAddress = walletAddress;
          session.user.provider = token.provider ?? "google";
        }
        return session;
      },
    },
    pages: {
      signIn: "/",
      error: "/",
    },
  };
}

export const authOptions: AuthOptions = buildAuthOptions(null);
