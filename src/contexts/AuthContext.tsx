"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BrowserProvider } from "ethers";

interface AuthState {
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    walletAddress: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setError = (error: string | null) =>
    setState((s) => ({ ...s, error, isLoading: false }));

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setState({
            walletAddress: data.walletAddress,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({ walletAddress: null, isAuthenticated: false, isLoading: false, error: null });
        }
      } catch {
        setState({ walletAddress: null, isAuthenticated: false, isLoading: false, error: null });
      }
    })();
  }, []);

  const login = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to continue.");
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address: string = accounts[0];

      if (!address) throw new Error("No account selected.");

      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      if (!nonceRes.ok) {
        const err = await nonceRes.json();
        throw new Error(err.error ?? "Failed to get nonce.");
      }
      const { message } = await nonceRes.json();

      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error ?? "Verification failed.");
      }

      const data = await verifyRes.json();

      setState({
        walletAddress: data.walletAddress,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setState({ walletAddress: null, isAuthenticated: false, isLoading: false, error: null });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
