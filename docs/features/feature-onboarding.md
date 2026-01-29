# Feature: Onboarding

## Overview
First-time user experience that gets users set up quickly while introducing key features. Goal: under 2 minutes to first workout.

---

## Sub-Features

### Done - Quick Profile Setup ✅
- [x] Name input
- [x] Bodyweight input (with unit toggle)
- [x] Experience level selection
  - Beginner (0-1 years)
  - Intermediate (1-3 years)
  - Advanced (3+ years)
- [ ] Optional: Profile photo

**Implementation:** `app/onboarding.tsx`, `src/lib/stores/onboardingStore.ts`

**Why Bodyweight:** Required for accurate e1RM calculation on bodyweight exercises.

**Why Experience Level:** Can tailor cue messages and expectations.

---

### Done - Personality Picker ✅
- [x] Display available gym buddy options
- [x] Preview text samples
- [ ] Preview audio samples (if available)
- [x] Select one to start
- [ ] "Can change later in settings" note

**Implementation:** `app/onboarding.tsx` - Personality picker with 4 options

---

### Planned - Guided First Workout
- [ ] Tutorial overlay on live-workout screen
- [ ] Highlight key UI elements
- [ ] Walk through logging a few sets
- [ ] Trigger a "fake" PR to show celebration
- [ ] Skip option for experienced users

**Implementation:** Created placeholder step in onboarding flow

---

### Planned - Ranking System Introduction
- [ ] Explain Forgerank scoring
- [ ] Show the 7 tiers visually
- [ ] Emphasize "real standards, not inflated"
- [ ] Show example rank display

---

### Planned - Feature Highlights
- [ ] Quick carousel of key features
- [ ] Social feed preview
- [ ] Streak system explanation
- [ ] "Get started" CTA

---

## Technical Notes

**Onboarding State:**
```typescript
type OnboardingState = {
  completed: boolean;
  currentStep: OnboardingStep;
  startedAt: number | null;
  completedAt: number | null;
  profile: OnboardingProfile | null;
};

type OnboardingProfile = {
  displayName: string;
  bodyweight: number; // Always stored in kg
  bodyweightUnit: "lb" | "kg";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  personalityId: string;
};

type OnboardingStep = "welcome" | "profile" | "personality" | "tutorial" | "complete";
```

**Storage:**
- Store onboarding state in AsyncStorage via Zustand persist
- Clear on logout/account deletion
- Track completion for analytics

**Tutorial Overlay:**
- Placeholder in onboarding flow
- Future: Use react-native-copilot or custom tooltip/highlight system
- Must not block app usage (skippable)

---

## UI Design

**Step 1: Welcome ✅**
- Feature overview with emoji icons
- "Let's Get Started" CTA

**Step 2: Profile Setup ✅**
- Clean, minimal form
- Name input with auto-capitalize
- Bodyweight input with lb/kg toggle
- Experience level selection (3 cards)
- Back/Continue navigation

**Step 3: Personality Picker ✅**
- 4 personality options with emoji, name, tagline
- Coach, Hype, Chill, Savage
- Single selection with visual feedback

**Step 4: Guided Workout (Placeholder)**
- "Ready to train?" message
- Skip to completion

**Step 5: Done ✅**
- Celebration with emoji
- "You're ready!" message
- Auto-redirect to home

---

## Copy Direction

**Tone:**
- Welcoming, not overwhelming
- Confident, matches app personality
- Brief instructions, not walls of text

**Example Copy:**
- "Let's get you set up." → "Let's Get Started"
- "Pick your gym buddy." → Personality selection
- "You're ready to train!"

---

## Dependencies

- ✅ Settings store (save preferences)
- ✅ Onboarding store (track state)
- ✅ App layout (redirect logic)

---

## Priority

**P0 (Pre-Launch):**
- ✅ Profile setup (name, bodyweight)
- ✅ Personality picker

**P1 (Launch):**
- Guided first workout
- Ranking introduction

**P2 (Post-Launch):**
- Feature highlights carousel
- Refined tutorial UX

---

## Implementation Notes (2026-01-28)

**Files Created:**
- `src/lib/stores/onboardingStore.ts` - Zustand store with onboarding state
- `app/onboarding.tsx` - Multi-step onboarding screen

**Files Modified:**
- `src/lib/stores/settingsStore.ts` - Added profile fields (displayName, bodyweight, experienceLevel, personalityId)
- `app/_layout.tsx` - Added onboarding screen and redirect logic

**Personalities Available:**
1. Coach - 🏋️ "Let's get to work."
2. Hype - 🔥 "LET'S GOOO!"
3. Chill - 😌 "You got this."
4. Savage - 💀 "Is that all you got?"

**Flow:**
1. Welcome → Profile → Personality → Tutorial → Complete → Home
2. Can skip tutorial to go straight to Complete
3. Auto-redirects to onboarding if not completed
4. Settings persist across sessions

**Next Steps:**
- Implement actual tutorial overlay with live-workout integration
- Add ranking system introduction
- Create profile photo upload option
