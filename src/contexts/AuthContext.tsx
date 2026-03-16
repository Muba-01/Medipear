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
<<<<<<< HEAD
  avatarUrl: string | null;
  email: string | null;
=======
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  birthday: string | null;
  interests: string[];
  joinedCommunities: string[];
  onboardingCompleted: boolean | null;
  onboardingStep: number;
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  karma: number;
  provider: "wallet" | "google" | "email" | null;
  walletLinked: boolean;
  googleLinked: boolean;
  emailLinked: boolean;
<<<<<<< HEAD
=======
  needsGoogleLink: boolean;
  needsWalletLink: boolean;
  walletNeedsVerification: boolean;
  walletNotice: string | null;
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
<<<<<<< HEAD
  linkWallet: () => Promise<void>;
  linkGoogle: () => Promise<void>;
=======
  linkEmail: (email: string, password: string) => Promise<void>;
  linkWallet: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  dismissWalletNotice: () => void;
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const EMPTY: AuthState = {
  walletAddress: null,
  userId: null,
  username: null,
<<<<<<< HEAD
  avatarUrl: null,
  email: null,
=======
  displayName: null,
  avatarUrl: null,
  email: null,
  birthday: null,
  interests: [],
  joinedCommunities: [],
  onboardingCompleted: null,
  onboardingStep: 1,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  karma: 0,
  provider: null,
  walletLinked: false,
  googleLinked: false,
  emailLinked: false,
<<<<<<< HEAD
=======
  needsGoogleLink: false,
  needsWalletLink: false,
  walletNeedsVerification: false,
  walletNotice: null,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeWalletAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(trimmed) ? trimmed.toLowerCase() : null;
}

async function requestProviderAccounts(method: "eth_accounts" | "eth_requestAccounts"): Promise<string[]> {
  if (typeof window === "undefined" || !window.ethereum) return [];
  const result = await window.ethereum.request({ method });
  if (!Array.isArray(result)) return [];
  return result
    .map((entry) => normalizeWalletAddress(entry))
    .filter((entry): entry is string => !!entry);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...EMPTY, isLoading: true });
  const { data: nextAuthSession, status: sessionStatus } = useSession();
  const stateRef = useRef<AuthState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setError = (error: string | null) =>
    setState((s) => ({ ...s, error, isLoading: false }));

<<<<<<< HEAD
=======
  const invalidateWalletSession = useCallback(async (nextWalletAddress: string | null, notice: string) => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({
      ...EMPTY,
      walletAddress: nextWalletAddress,
      walletNeedsVerification: !!nextWalletAddress,
      walletNotice: notice,
    });
  }, []);

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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

<<<<<<< HEAD
=======
          if (
            data.provider === "wallet" &&
            sessionWalletAddress &&
            providerWalletAddress &&
            providerWalletAddress !== sessionWalletAddress
          ) {
            await invalidateWalletSession(
              providerWalletAddress,
              "Wallet account changed. Please verify ownership to continue."
            );
            return;
          }

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
          setState({
            walletAddress: sessionWalletAddress,
            userId: data.userId ?? null,
            username: data.username ?? null,
<<<<<<< HEAD
            avatarUrl: data.avatarUrl ?? null,
            email: data.email ?? null,
=======
            displayName: data.displayName ?? data.username ?? null,
            avatarUrl: data.avatarUrl ?? null,
            email: data.email ?? null,
            birthday: data.birthday ?? null,
            interests: data.interests ?? [],
            joinedCommunities: data.joinedCommunities ?? [],
            onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : null,
            onboardingStep: data.onboardingStep ?? 1,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
            karma: data.karma ?? 0,
            provider: data.provider ?? null,
            walletLinked: data.walletLinked ?? !!data.walletAddress,
            googleLinked: data.googleLinked ?? false,
            emailLinked: data.emailLinked ?? false,
<<<<<<< HEAD
=======
            needsGoogleLink: data.needsGoogleLink ?? false,
            needsWalletLink: data.needsWalletLink ?? false,
            walletNeedsVerification: false,
            walletNotice: null,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
<<<<<<< HEAD
          setState({ ...EMPTY });
=======
          setState({ ...EMPTY, walletAddress: providerWalletAddress });
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
        }
      } catch {
        setState({ ...EMPTY });
      }
    })();
<<<<<<< HEAD
  }, []);
=======
  }, [invalidateWalletSession]);
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

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
<<<<<<< HEAD
          avatarUrl: u.image ?? null,
          email: (u as { email?: string | null }).email ?? null,
=======
          displayName: u.name ?? (u as { username?: string }).username ?? null,
          avatarUrl: u.image ?? null,
          email: (u as { email?: string | null }).email ?? null,
          birthday: null,
          interests: [],
          joinedCommunities: [],
          onboardingCompleted: null,
          onboardingStep: 1,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
          karma: 0,
          provider: "google" as const,
          walletLinked: !!((u as { walletAddress?: string | null }).walletAddress),
          googleLinked: true,
<<<<<<< HEAD
          emailLinked: false,
=======
          emailLinked: !!(u as { email?: string | null }).email,
          needsGoogleLink: false,
          needsWalletLink: !((u as { walletAddress?: string | null }).walletAddress),
          walletNeedsVerification: false,
          walletNotice: null,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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
<<<<<<< HEAD
        avatarUrl: null,
        email: null,
        karma: 0,
        provider: "wallet",
        walletLinked: true,
        googleLinked: false,
        emailLinked: false,
=======
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
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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

<<<<<<< HEAD
=======
  const dismissWalletNotice = useCallback(() => {
    setState((prev) => ({ ...prev, walletNotice: null }));
  }, []);

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const providerWalletAddress = Array.isArray(accounts)
        ? normalizeWalletAddress(accounts[0])
        : null;
      const current = stateRef.current;
      const sessionWalletAddress = normalizeWalletAddress(current.walletAddress);

      console.info("[wallet-auth] provider accounts changed", {
        providerWalletAddress,
        sessionWalletAddress,
        matches:
          !!providerWalletAddress &&
          !!sessionWalletAddress &&
          providerWalletAddress === sessionWalletAddress,
      });

      setState((prev) => {
        if (!prev.isAuthenticated || prev.provider === "wallet") {
<<<<<<< HEAD
          return { ...prev, walletAddress: providerWalletAddress };
=======
          return { ...prev, walletAddress: providerWalletAddress, walletNeedsVerification: false };
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
        }
        return prev;
      });

<<<<<<< HEAD
=======
      if (current.isAuthenticated && current.provider === "wallet" && !providerWalletAddress) {
        void invalidateWalletSession(null, "Wallet disconnected. Please reconnect to continue.");
        return;
      }

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
      if (
        current.isAuthenticated &&
        current.provider === "wallet" &&
        (!providerWalletAddress || (sessionWalletAddress && providerWalletAddress !== sessionWalletAddress))
      ) {
<<<<<<< HEAD
        void logout();
=======
        void invalidateWalletSession(
          providerWalletAddress,
          "Wallet account changed. Please verify ownership to continue."
        );
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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
<<<<<<< HEAD
=======

          if (
            current.isAuthenticated &&
            current.provider === "wallet" &&
            providerWalletAddress &&
            sessionWalletAddress &&
            providerWalletAddress !== sessionWalletAddress
          ) {
            void invalidateWalletSession(
              providerWalletAddress,
              "Network changed. Please verify wallet ownership to continue."
            );
          }
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
        })
        .catch((err: unknown) => {
          console.warn("[wallet-auth] failed to sync wallet after chain change", err);
        });
    };

<<<<<<< HEAD
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
=======
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
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
<<<<<<< HEAD
    };
  }, [logout]);
=======
      window.ethereum?.removeListener("disconnect", handleDisconnect);
    };
  }, [invalidateWalletSession]);
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a

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
<<<<<<< HEAD
          avatarUrl: 'avatarUrl' in data ? data.avatarUrl : prev.avatarUrl,
          email: data.email ?? prev.email,
=======
          displayName: data.displayName ?? data.username ?? prev.displayName,
          avatarUrl: 'avatarUrl' in data ? data.avatarUrl : prev.avatarUrl,
          email: data.email ?? prev.email,
          birthday: 'birthday' in data ? data.birthday : prev.birthday,
          interests: data.interests ?? prev.interests,
          joinedCommunities: data.joinedCommunities ?? prev.joinedCommunities,
          onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : prev.onboardingCompleted,
          onboardingStep: data.onboardingStep ?? prev.onboardingStep,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
          walletAddress: "walletAddress" in data ? sessionWalletAddress : prev.walletAddress,
          walletLinked: data.walletLinked ?? prev.walletLinked,
          googleLinked: data.googleLinked ?? prev.googleLinked,
          emailLinked: data.emailLinked ?? prev.emailLinked,
<<<<<<< HEAD
=======
          needsGoogleLink: data.needsGoogleLink ?? prev.needsGoogleLink,
          needsWalletLink: data.needsWalletLink ?? prev.needsWalletLink,
          walletNeedsVerification: false,
          walletNotice: null,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
        }));
      }
    } catch { /* silent */ }
  }, []);

  const linkWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const accounts = await requestProviderAccounts("eth_requestAccounts");
    const address = accounts[0];
    if (!address) throw new Error("No account selected.");

    console.info("[wallet-auth] provider returned wallet for linking", {
      providerWalletAddress: address,
    });

    const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
    if (!nonceRes.ok) throw new Error((await nonceRes.json()).error ?? "Failed to get nonce.");
    const { message } = await nonceRes.json();

    const signer = await new BrowserProvider(window.ethereum).getSigner();
    const signature = await signer.signMessage(message);

    const linkRes = await fetch("/api/auth/link-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, signature }),
    });
    if (!linkRes.ok) {
      const data = await linkRes.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to link wallet.");
    }
    await refreshProfile();
  }, [refreshProfile]);

  const linkGoogle = useCallback(async () => {
    const initRes = await fetch("/api/auth/link-google/initiate", { method: "POST" });
    if (!initRes.ok) {
      const data = await initRes.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to initiate Google link.");
    }
    await signIn("google", { callbackUrl: window.location.href });
  }, []);

<<<<<<< HEAD
=======
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

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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
<<<<<<< HEAD
        avatarUrl: data.avatarUrl ?? null,
        email: data.email ?? null,
=======
        displayName: data.displayName ?? data.username ?? null,
        avatarUrl: data.avatarUrl ?? null,
        email: data.email ?? null,
        birthday: data.birthday ?? null,
        interests: data.interests ?? [],
        joinedCommunities: data.joinedCommunities ?? [],
        onboardingCompleted: typeof data.onboardingCompleted === "boolean" ? data.onboardingCompleted : null,
        onboardingStep: data.onboardingStep ?? 1,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
        karma: data.karma ?? 0,
        provider: data.provider ?? "email",
        walletLinked: data.walletLinked ?? false,
        googleLinked: data.googleLinked ?? false,
        emailLinked: data.emailLinked ?? true,
<<<<<<< HEAD
=======
        needsGoogleLink: data.needsGoogleLink ?? false,
        needsWalletLink: data.needsWalletLink ?? false,
        walletNeedsVerification: false,
        walletNotice: null,
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, loginWithEmail, linkWallet, linkGoogle, logout, refreshProfile }}>
=======
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, loginWithEmail, linkEmail, linkWallet, linkGoogle, dismissWalletNotice, logout, refreshProfile }}>
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}