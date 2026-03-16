"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BrowserProvider } from "ethers";
import { signIn, signOut, useSession } from "next-auth/react";

interface AuthState {
  walletAddress: string | null;
  userId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  birthday: string | null;
  interests: string[];
  joinedCommunities: string[];
  onboardingCompleted: boolean | null;
  onboardingStep: number;
  karma: number;
  provider: "wallet" | "google" | "email" | null;
  walletLinked: boolean;
  googleLinked: boolean;
  emailLinked: boolean;
  linkEmail: (email: string, password: string) => Promise<void>;
  linkWallet: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  dismissWalletNotice: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const EMPTY: AuthState = {
  walletAddress: null,
  userId: null,
  username: null,
  displayName: null,
  avatarUrl: null,
  email: null,
  birthday: null,
  interests: [],
  joinedCommunities: [],
  onboardingCompleted: null,
  onboardingStep: 1,
  karma: 0,
  provider: null,
  walletLinked: false,
  googleLinked: false,
  emailLinked: false,
  const invalidateWalletSession = useCallback(async (nextWalletAddress: string | null, notice: string) => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({
      ...EMPTY,
      walletAddress: nextWalletAddress,
      walletNeedsVerification: !!nextWalletAddress,
      walletNotice: notice,
    });
  }, []);

  // Restore session on mount (handles wallet JWT cookie)
  useEffect(() => {
    (async () => {
      try {
        const providerWalletAddress = (await requestProviderAccounts("eth_accounts"))[0] ?? null;
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const sessionWalletAddress = normalizeWalletAddress(data.walletAddress);
          console.info("[wallet-auth] session restore", {
            providerWalletAddress,
            sessionWalletAddress,
            matches:
              !!providerWalletAddress &&
              !!sessionWalletAddress &&
              providerWalletAddress === sessionWalletAddress,
          });

            displayName: data.displayName ?? data.username ?? null,
            avatarUrl: data.avatarUrl ?? null,
            email: data.email ?? null,
            birthday: data.birthday ?? null,
            interests: data.interests ?? [],
            joinedCommunities: data.joinedCommunities ?? [],
            onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : null,
            onboardingStep: data.onboardingStep ?? 1,
            karma: data.karma ?? 0,
            provider: data.provider ?? null,
            walletLinked: data.walletLinked ?? !!data.walletAddress,
            googleLinked: data.googleLinked ?? false,
            emailLinked: data.emailLinked ?? false,
          setState({ ...EMPTY, walletAddress: providerWalletAddress });
        }
      } catch {
        setState({ ...EMPTY });
      }
    })();
  }, [invalidateWalletSession]);

  // Sync Google OAuth session from next-auth into app state
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "authenticated" && nextAuthSession?.user) {
      setState((prev) => {
        // Don't overwrite a fully-loaded session (wallet or google from /api/auth/me)
        if (prev.isAuthenticated && prev.userId) return prev;
        const u = nextAuthSession.user;
        return {
          walletAddress: (u as { walletAddress?: string | null }).walletAddress ?? null,
          userId: (u as { id?: string }).id ?? null,
          username: (u as { username?: string }).username ?? u.name ?? null,
          displayName: u.name ?? (u as { username?: string }).username ?? null,
          avatarUrl: u.image ?? null,
          email: (u as { email?: string | null }).email ?? null,
          birthday: null,
          interests: [],
          joinedCommunities: [],
          onboardingCompleted: null,
          onboardingStep: 1,
          karma: 0,
          provider: "google" as const,
          walletLinked: !!((u as { walletAddress?: string | null }).walletAddress),
          googleLinked: true,
          emailLinked: !!(u as { email?: string | null }).email,
          needsGoogleLink: false,
          needsWalletLink: !((u as { walletAddress?: string | null }).walletAddress),
          walletNeedsVerification: false,
          walletNotice: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      });
    } else if (sessionStatus === "unauthenticated") {
      setState((prev) => {
        // Don't clear a wallet session on unauthenticated nextAuth status
        if (prev.provider === "wallet" && prev.isAuthenticated) return prev;
        return prev;
      });
    }
  }, [sessionStatus, nextAuthSession]);

  const login = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it from metamask.io to continue.");
      }

      const accounts = await requestProviderAccounts("eth_requestAccounts");
      const address = accounts[0];
      if (!address) throw new Error("No account selected.");

      console.info("[wallet-auth] provider returned wallet", {
        providerWalletAddress: address,
      });

      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      if (!nonceRes.ok) throw new Error((await nonceRes.json()).error ?? "Failed to get nonce.");
      const { message } = await nonceRes.json();

      const signer = await new BrowserProvider(window.ethereum).getSigner();
      const signerAddress = normalizeWalletAddress(await signer.getAddress());
      if (signerAddress && signerAddress !== address) {
        console.warn("[wallet-auth] signer address differs from requested provider account", {
          providerWalletAddress: address,
          signerWalletAddress: signerAddress,
        });
      }
      const signature = await signer.signMessage(message);

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error ?? "Verification failed.");
      const data = await verifyRes.json();
      const sessionWalletAddress = normalizeWalletAddress(data.walletAddress);

      console.info("[wallet-auth] verification complete", {
        providerWalletAddress: address,
        sessionWalletAddress,
        matches:
          !!sessionWalletAddress &&
          sessionWalletAddress === address,
      });

      setState({
        walletAddress: sessionWalletAddress ?? address,
        userId: data.userId ?? null,
        username: data.username ?? null,
        displayName: data.displayName ?? data.username ?? null,
        avatarUrl: null,
        email: null,
        birthday: null,
        interests: [],
        joinedCommunities: [],
        onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : null,
        onboardingStep: data.onboardingStep ?? 1,
        karma: 0,
        provider: "wallet",
        walletLinked: true,
        googleLinked: data.googleLinked ?? false,
        emailLinked: data.emailLinked ?? false,
        needsGoogleLink: data.needsGoogleLink ?? !(data.googleLinked ?? false),
        needsWalletLink: false,
        walletNeedsVerification: false,
        walletNotice: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({ redirect: false });
    console.info("[wallet-auth] cleared wallet auth session");
    setState({ ...EMPTY });
  }, []);

          return { ...prev, walletAddress: providerWalletAddress, walletNeedsVerification: false };
        }
        return prev;
      });

        void invalidateWalletSession(
          providerWalletAddress,
          "Wallet account changed. Please verify ownership to continue."
        );
      }
    };

    const handleChainChanged = (_chainId: unknown) => {
      void requestProviderAccounts("eth_accounts")
        .then((accounts) => {
          const providerWalletAddress = accounts[0] ?? null;
          const current = stateRef.current;
          const sessionWalletAddress = normalizeWalletAddress(current.walletAddress);

          console.info("[wallet-auth] provider chain changed", {
            providerWalletAddress,
            sessionWalletAddress,
            matches:
              !!providerWalletAddress &&
              !!sessionWalletAddress &&
              providerWalletAddress === sessionWalletAddress,
          });

          setState((prev) => {
            if (!prev.isAuthenticated || prev.provider === "wallet") {
              return { ...prev, walletAddress: providerWalletAddress };
            }
            return prev;
          });
    const handleDisconnect = () => {
      const current = stateRef.current;
      if (current.isAuthenticated && current.provider === "wallet") {
        void invalidateWalletSession(null, "Wallet disconnected. Please reconnect to continue.");
      } else {
        setState((prev) => ({ ...prev, walletAddress: null }));
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", handleDisconnect);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
      window.ethereum?.removeListener("disconnect", handleDisconnect);
    };
  }, [invalidateWalletSession]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const sessionWalletAddress = normalizeWalletAddress(data.walletAddress);

        console.info("[wallet-auth] refresh profile", {
          sessionWalletAddress,
        });

        setState((prev) => ({
          ...prev,
          username: data.username ?? prev.username,
          displayName: data.displayName ?? data.username ?? prev.displayName,
          avatarUrl: 'avatarUrl' in data ? data.avatarUrl : prev.avatarUrl,
          email: data.email ?? prev.email,
          birthday: 'birthday' in data ? data.birthday : prev.birthday,
          interests: data.interests ?? prev.interests,
          joinedCommunities: data.joinedCommunities ?? prev.joinedCommunities,
          onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : prev.onboardingCompleted,
          onboardingStep: data.onboardingStep ?? prev.onboardingStep,
          walletAddress: "walletAddress" in data ? sessionWalletAddress : prev.walletAddress,
          walletLinked: data.walletLinked ?? prev.walletLinked,
          googleLinked: data.googleLinked ?? prev.googleLinked,
          emailLinked: data.emailLinked ?? prev.emailLinked,
  const linkEmail = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/link-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to link email.");
    }
    await refreshProfile();
  }, [refreshProfile]);

  const loginWithGoogle = useCallback(async () => {
    await signIn("google", { callbackUrl: window.location.href });
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) {
      setState((s) => ({ ...s, isLoading: false, error: "Invalid email or password." }));
      throw new Error("Invalid email or password.");
    }
    // Fetch full profile after credentials sign-in
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setState({
        walletAddress: data.walletAddress ?? null,
        userId: data.userId ?? null,
        username: data.username ?? null,
        displayName: data.displayName ?? data.username ?? null,
        avatarUrl: data.avatarUrl ?? null,
        email: data.email ?? null,
        birthday: data.birthday ?? null,
        interests: data.interests ?? [],
        joinedCommunities: data.joinedCommunities ?? [],
        onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : null,
        onboardingStep: data.onboardingStep ?? 1,
        karma: data.karma ?? 0,
        provider: data.provider ?? "email",
        walletLinked: data.walletLinked ?? false,
        googleLinked: data.googleLinked ?? false,
        emailLinked: data.emailLinked ?? true,
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, loginWithEmail, linkEmail, linkWallet, linkGoogle, dismissWalletNotice, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}