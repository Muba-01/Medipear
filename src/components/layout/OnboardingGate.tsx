"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_PATHS = new Set([
  "/onboarding",
  "/onboarding/profile",
  "/onboarding/interests",
  "/onboarding/communities",
  "/onboarding/connect",
  "/onboarding/first-post",
  "/onboarding/complete",
]);

function pathForStep(step: number): string {
  if (step <= 1) return "/onboarding";
  if (step === 2) return "/onboarding/profile";
  if (step === 3) return "/onboarding/interests";
  if (step === 4) return "/onboarding/communities";
  if (step === 5) return "/onboarding/connect";
  if (step === 6) return "/onboarding/first-post";
  return "/onboarding/complete";
}

export default function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading,
    onboardingCompleted,
    onboardingStep,
    refreshProfile,
  } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    if (onboardingCompleted === null) {
      void refreshProfile();
    }
  }, [isAuthenticated, isLoading, onboardingCompleted, refreshProfile]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || onboardingCompleted === null) return;

    const inOnboarding = ONBOARDING_PATHS.has(pathname);

    if (!onboardingCompleted) {
      const target = pathForStep(onboardingStep || 1);
      // While onboarding is in progress, only force redirect when the user is outside
      // onboarding routes or lands on the generic welcome route with a later saved step.
      if (!inOnboarding || (pathname === "/onboarding" && target !== "/onboarding")) {
        router.replace(target);
      }
      return;
    }

    if (inOnboarding || pathname === "/") {
      router.replace("/home");
    }
  }, [isAuthenticated, isLoading, onboardingCompleted, onboardingStep, pathname, router]);

  return null;
}
