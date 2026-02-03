// src/lib/stores/onboardingStore.ts
// Zustand store for onboarding state with AsyncStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { updateSettings } from "./settingsStore";

const STORAGE_KEY = "gymrats.onboarding.v1";

/**
 * Experience level for tailoring app experience
 */
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

/**
 * Training goal for personalization
 */
export type TrainingGoal = "strength" | "aesthetics" | "health" | "sport" | "general";

/**
 * Onboarding steps
 */
export type OnboardingStep = "welcome" | "avatar" | "goals" | "profile" | "personality" | "highlights" | "tutorial" | "complete";

/**
 * User profile data collected during onboarding
 */
export interface OnboardingProfile {
  displayName: string;
  bodyweight: number; // Always stored in kg internally
  bodyweightUnit: "lb" | "kg"; // User's preferred unit for display
  experienceLevel: ExperienceLevel;
  personalityId: string; // ID of selected gym buddy personality
  goal: TrainingGoal | null; // Training goal for personalization
}

/**
 * Onboarding state
 */
export interface OnboardingState {
  // State
  completed: boolean;
  currentStep: OnboardingStep;
  startedAt: number | null;
  completedAt: number | null;
  profile: OnboardingProfile | null;
  hydrated: boolean;
  tutorialStep: number;
  tutorialCompleted: boolean;

  // Actions
  startOnboarding: () => void;
  setCurrentStep: (step: OnboardingStep) => void;
  setProfile: (profile: OnboardingProfile) => void;
  setPersonality: (personalityId: string) => void;
  setGoal: (goal: TrainingGoal) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void; // For testing/re-onboarding
  skipOnboarding: () => void; // Skip tutorial but mark complete
  setHydrated: (value: boolean) => void;
  advanceTutorialStep: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
}

/**
 * Personality options for gym buddy
 */
export interface Personality {
  id: string;
  name: string;
  description: string;
  tagline: string;
  emoji: string;
  color: string;
}

/**
 * Available personalities (can be expanded later)
 */
export const PERSONALITIES: Personality[] = [
  {
    id: "coach",
    name: "Coach",
    description: "Motivating and straightforward",
    tagline: "Let's get to work.",
    emoji: "🏋️",
    color: "#10b981", // green
  },
  {
    id: "hype",
    name: "Hype",
    description: "High energy and enthusiastic",
    tagline: "LET'S GOOO!",
    emoji: "🔥",
    color: "#ef4444", // red
  },
  {
    id: "chill",
    name: "Chill",
    description: "Relaxed and supportive",
    tagline: "You got this.",
    emoji: "😌",
    color: "#3b82f6", // blue
  },
  {
    id: "savage",
    name: "Savage",
    description: "No excuses, just results",
    tagline: "Is that all you got?",
    emoji: "💀",
    color: "#8b5cf6", // purple
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completed: false,
      currentStep: "welcome",
      startedAt: null,
      completedAt: null,
      profile: null,
      hydrated: false,
      tutorialStep: 0,
      tutorialCompleted: false,

      startOnboarding: () => {
        set({
          startedAt: Date.now(),
          currentStep: "welcome",
        });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setProfile: (profile) => {
        set({ profile });
        // Sync to settings store
        updateSettings({
          displayName: profile.displayName,
          bodyweight: profile.bodyweight,
          experienceLevel: profile.experienceLevel,
          personalityId: profile.personalityId,
          goal: profile.goal || "general",
          unitSystem: profile.bodyweightUnit,
        });
      },

      setPersonality: (personalityId) => {
        set((state) => ({
          profile: {
            ...state.profile,
            personalityId,
          } as OnboardingProfile,
        }));
        // Sync to settings store
        const profile = get().profile;
        if (profile) {
          updateSettings({
            personalityId,
            displayName: profile.displayName,
            bodyweight: profile.bodyweight,
            experienceLevel: profile.experienceLevel,
            goal: profile.goal || "general",
            unitSystem: profile.bodyweightUnit,
          });
        } else {
          updateSettings({ personalityId });
        }
      },

      setGoal: (goal) => {
        set((state) => ({
          profile: {
            ...state.profile,
            goal,
          } as OnboardingProfile,
        }));
        // Sync to settings store
        const profile = get().profile;
        if (profile) {
          updateSettings({
            goal,
            displayName: profile.displayName,
            bodyweight: profile.bodyweight,
            experienceLevel: profile.experienceLevel,
            personalityId: profile.personalityId,
            unitSystem: profile.bodyweightUnit,
          });
        } else {
          updateSettings({ goal });
        }
      },

      completeOnboarding: () => {
        set({
          completed: true,
          completedAt: Date.now(),
          currentStep: "complete",
        });
      },

      resetOnboarding: () => {
        set({
          completed: false,
          currentStep: "welcome",
          startedAt: null,
          completedAt: null,
          profile: null,
          tutorialStep: 0,
          tutorialCompleted: false,
        });
      },

      skipOnboarding: () => {
        const defaultProfile = {
          displayName: "Lifter",
          bodyweight: 70, // default kg
          bodyweightUnit: "lb",
          experienceLevel: "intermediate",
          personalityId: "coach",
          goal: "general",
        };
        set({
          completed: true,
          completedAt: Date.now(),
          currentStep: "complete",
          profile: defaultProfile,
        });
        // Sync to settings store
        updateSettings({
          displayName: defaultProfile.displayName,
          bodyweight: defaultProfile.bodyweight,
          experienceLevel: defaultProfile.experienceLevel,
          personalityId: defaultProfile.personalityId,
          goal: defaultProfile.goal,
          unitSystem: defaultProfile.bodyweightUnit,
        });
      },

      advanceTutorialStep: () => {
        set((state) => ({
          tutorialStep: state.tutorialStep + 1,
        }));
      },
      completeTutorial: () => {
        set({
          tutorialCompleted: true,
          tutorialStep: 0,
        });
      },
      resetTutorial: () => {
        set({
          tutorialStep: 0,
          tutorialCompleted: false,
        });
      },
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        completed: state.completed,
        currentStep: state.currentStep,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        profile: state.profile,
        tutorialStep: state.tutorialStep,
        tutorialCompleted: state.tutorialCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectIsOnboarding = (state: OnboardingState) => !state.completed;
export const selectOnboardingProfile = (state: OnboardingState) => state.profile;
export const selectCurrentStep = (state: OnboardingState) => state.currentStep;

// ============================================================================
// Hooks
// ============================================================================

export function useIsOnboarding(): boolean {
  return useOnboardingStore((state) => !state.completed);
}

export function useOnboardingProfile(): OnboardingProfile | null {
  return useOnboardingStore((state) => state.profile);
}

export function useCurrentOnboardingStep(): OnboardingStep {
  return useOnboardingStore((state) => state.currentStep);
}

// ============================================================================
// Imperative getters
// ============================================================================

export function isOnboarding(): boolean {
  return !useOnboardingStore.getState().completed;
}

export function getOnboardingProfile(): OnboardingProfile | null {
  return useOnboardingStore.getState().profile;
}

// ============================================================================
// Imperative actions
// ============================================================================

export function startOnboarding() {
  useOnboardingStore.getState().startOnboarding();
}

export function setOnboardingStep(step: OnboardingStep) {
  useOnboardingStore.getState().setCurrentStep(step);
}

export function setOnboardingProfile(profile: OnboardingProfile) {
  useOnboardingStore.getState().setProfile(profile);
}

export function setOnboardingGoal(goal: TrainingGoal) {
  useOnboardingStore.getState().setGoal(goal);
}

export function completeOnboarding() {
  useOnboardingStore.getState().completeOnboarding();
}

export function skipOnboarding() {
  useOnboardingStore.getState().skipOnboarding();
}

export function resetOnboarding() {
  useOnboardingStore.getState().resetOnboarding();
}
