export const ONBOARDING_STEPS = {
  welcome: 1,
  profile: 2,
  interests: 3,
  communities: 4,
  connect: 5,
  firstPost: 6,
  complete: 7,
} as const;

export const INTEREST_OPTIONS = [
  "Cardiology",
  "Neurology",
  "Pharmacology",
  "Surgery",
  "Radiology",
  "Medical AI",
  "Medical Education",
  "Public Health",
  "Clinical Research",
] as const;

export const INTEREST_COMMUNITY_HINTS: Record<string, string[]> = {
  Cardiology: ["cardio", "heart"],
  Neurology: ["neuro", "brain", "neuroscience"],
  Pharmacology: ["pharma", "drug", "medication"],
  Surgery: ["surgery", "surgical", "or"],
  Radiology: ["radio", "imaging", "xray", "mri"],
  "Medical AI": ["ai", "ml", "machine", "data"],
  "Medical Education": ["education", "student", "exam", "usmle"],
  "Public Health": ["public", "health", "epidemiology"],
  "Clinical Research": ["research", "clinical", "trial"],
};

export function onboardingPathForStep(step: number): string {
  if (step <= ONBOARDING_STEPS.welcome) return "/onboarding";
  if (step === ONBOARDING_STEPS.profile) return "/onboarding/profile";
  if (step === ONBOARDING_STEPS.interests) return "/onboarding/interests";
  if (step === ONBOARDING_STEPS.communities) return "/onboarding/communities";
  if (step === ONBOARDING_STEPS.connect) return "/onboarding/connect";
  if (step === ONBOARDING_STEPS.firstPost) return "/onboarding/first-post";
  return "/onboarding/complete";
}
