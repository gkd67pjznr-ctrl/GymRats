# Feature: Onboarding

## Overview
First-time user experience that gets users set up quickly while introducing key features. Goal: under 2 minutes to first workout. All steps are skippable.

**Progress: 3/7 sub-features complete**

---

## Sub-Features

### Done - Quick Profile Setup ✅
- [x] Name input
- [x] Bodyweight input (with unit toggle)
- [x] Experience level selection
### Done - Quick Profile Setup ✅
- [x] Name input
- [x] Bodyweight input (with unit toggle)
- [x] Experience level selection
  - Beginner (0-1 years)
  - Intermediate (1-3 years)
  - Advanced (3+ years)
- [ ] Optional: Profile photo

**Implementation:** `app/onboarding.tsx`, `src/lib/stores/onboardingStore.ts`

**Implementation:** `app/onboarding.tsx`, `src/lib/stores/onboardingStore.ts`

**Why Bodyweight:** Required for accurate e1RM calculation on bodyweight exercises.

**Why Experience Level:** Can tailor cue messages and expectations.

---

### Done - Personality Picker ✅
- [x] Display available gym buddy options
- [x] Preview text samples
### Done - Personality Picker ✅
- [x] Display available gym buddy options
- [x] Preview text samples
- [ ] Preview audio samples (if available)
- [x] Select one to start
- [x] Select one to start
- [ ] "Can change later in settings" note

**Implementation:** `app/onboarding.tsx` - Personality picker with 4 options

---

### Done - Welcome Step ✅
- [x] Feature overview with emoji icons
- [x] "Let's Get Started" CTA

---

### Planned - Avatar Creation Step
- [ ] Pick art style (Bitmoji, pixel, retro, 3D)
- [ ] Basic customization (hair, skin tone, outfit, etc.)
- [ ] Default avatar assigned if skipped
- [ ] Avatar preview during creation
- [ ] Skippable - default avatar assigned automatically

**Notes:** This is the first personalization step after Welcome. Gives the user a visual identity early on. If skipped, the system assigns a default avatar so the profile is never blank.

---

### Planned - Goal Setting Step
- [ ] "What are you training for?" prompt
- [ ] Options: Strength, Aesthetics, Health, Sport
- [ ] Allow single or multi-select
- [ ] Personalizes AI coaching suggestions
- [ ] Skippable - defaults to general training

**Notes:** Goal selection feeds into future AI coaching features. Knowing the user's primary training goal allows the app to tailor cue messages, suggest relevant routines, and prioritize metrics that matter to them.

---

### Planned - Guided First Workout
- [ ] Tutorial overlay on live-workout screen
- [ ] Highlight key UI elements
- [ ] Walk through logging a few sets
- [ ] Trigger a "fake" PR to show celebration
- [ ] Skip option for experienced users
- [ ] Completing the guided workout should trigger the first Workout Replay

**Implementation:** Created placeholder step in onboarding flow

**Workout Replay:** The guided first workout is the ideal trigger for a user's first Workout Replay experience. After finishing, the app plays back a summary of what they just did, introducing the replay feature naturally.

---

### Planned - Feature Highlights
- [ ] Quick carousel of key features
- [ ] Social feed preview
- [ ] Streak system explanation
- [ ] "Get started" CTA

---

## Onboarding Flow Order

The onboarding steps proceed in this order:

1. **Welcome** - Feature overview, "Let's Get Started"
2. **Avatar Creation** - Pick art style and customize (skippable)
3. **Goal Setting** - "What are you training for?" (skippable)
4. **Profile Setup** - Name, bodyweight, experience level (skippable)
5. **Personality Picker** - Select gym buddy personality (skippable)
6. **Guided First Workout** - Tutorial overlay on live workout (skippable)
7. **Complete** - Celebration, redirect to home

All steps are skippable. Sensible defaults are applied for any skipped step (default avatar, general training goal, etc.).

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
  goal: "strength" | "aesthetics" | "health" | "sport" | null;
};

type OnboardingStep =
  | "welcome"
  | "avatar"
  | "goals"
  | "profile"
  | "personality"
  | "tutorial"
  | "complete";
```

**Storage:**
- Store onboarding state in AsyncStorage via Zustand persist
- Store onboarding state in AsyncStorage via Zustand persist
- Clear on logout/account deletion
- Track completion for analytics

**Tutorial Overlay:**
- Placeholder in onboarding flow
- Future: Use react-native-copilot or custom tooltip/highlight system
- Placeholder in onboarding flow
- Future: Use react-native-copilot or custom tooltip/highlight system
- Must not block app usage (skippable)

---

## UI Design

**Step 1: Welcome ✅**
- Feature overview with emoji icons
- "Let's Get Started" CTA

**Step 2: Avatar Creation (Planned)**
- Art style selector: Bitmoji, pixel, retro, 3D
- Basic customization panel (hair, skin tone, outfit)
- Live preview of avatar
- "Skip" assigns a default avatar
- Back/Continue navigation

**Step 3: Goal Setting (Planned)**
- "What are you training for?" heading
- Four option cards: Strength, Aesthetics, Health, Sport
- Single or multi-select with visual feedback
- Brief description under each option
- "Skip" defaults to general training
- Back/Continue navigation

**Step 4: Profile Setup ✅**
- Clean, minimal form
- Name input with auto-capitalize
- Bodyweight input with lb/kg toggle
- Experience level selection (3 cards)
- Back/Continue navigation

**Step 5: Personality Picker ✅**
- 4 personality options with emoji, name, tagline
- Coach, Hype, Chill, Savage
- Single selection with visual feedback

**Step 6: Guided Workout (Placeholder)**
- "Ready to train?" message
- Skip to completion
- On completion, triggers first Workout Replay

**Step 7: Done ✅**
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
- "Let's get you set up." -> "Let's Get Started"
- "Create your avatar." -> Avatar creation
- "What are you training for?" -> Goal setting
- "Pick your gym buddy." -> Personality selection
- "You're ready to train!"

---

## Dependencies

- ✅ Settings store (save preferences)
- ✅ Onboarding store (track state)
- ✅ App layout (redirect logic)
- Avatar asset system (needed for avatar creation step)
- Goal store or settings extension (needed for goal setting step)

---

## Priority

**P0 (Pre-Launch):**
- ✅ Profile setup (name, bodyweight)
- ✅ Personality picker
- ✅ Profile setup (name, bodyweight)
- ✅ Personality picker

**P1 (Launch):**
- Avatar creation step
- Goal setting step
- Guided first workout
- Workout Replay trigger from guided workout

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
1. Coach - "Let's get to work."
2. Hype - "LET'S GOOO!"
3. Chill - "You got this."
4. Savage - "Is that all you got?"

**Flow:**
1. Welcome -> Avatar -> Goals -> Profile -> Personality -> Tutorial -> Complete -> Home
2. All steps are skippable
3. Auto-redirects to onboarding if not completed
4. Settings persist across sessions

**Next Steps:**
- Implement avatar creation step with art style selection
- Implement goal setting step
- Add `goal` field to OnboardingProfile and settings store
- Add `"avatar"` and `"goals"` to OnboardingStep type in code
- Implement actual tutorial overlay with live-workout integration
- Wire guided first workout completion to trigger Workout Replay
- Create profile photo upload option
