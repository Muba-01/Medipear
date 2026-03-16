"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface OnboardingState {
  onboardingCompleted: boolean;
  onboardingStep: number;
  username: string;
  displayName: string;
  bio: string;
  birthday: string | null;
  avatarUrl: string;
  interests: string[];
  joinedCommunities: string[];
  walletLinked: boolean;
  googleLinked: boolean;
  emailLinked: boolean;
}

export function useOnboardingState() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const res = await fetch("/api/onboarding/state", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/");
      return;
    }

    if (!res.ok) {
      setLoading(false);
      return;
    }

    const data = await res.json();
    setState(data);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, setState, loading, refresh };
}
