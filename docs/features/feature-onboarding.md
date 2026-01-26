# Feature: Onboarding

## Overview
First-time user experience that gets users set up quickly while introducing key features. Goal: under 2 minutes to first workout.

---

## Sub-Features

### Planned - Quick Profile Setup
- [ ] Name input
- [ ] Bodyweight input (with unit toggle)
- [ ] Experience level selection
  - Beginner (0-1 years)
  - Intermediate (1-3 years)
  - Advanced (3+ years)
- [ ] Optional: Profile photo

**Why Bodyweight:** Required for accurate e1RM calculation on bodyweight exercises.

**Why Experience Level:** Can tailor cue messages and expectations.

---

### Planned - Personality Picker
- [ ] Display available gym buddy options
- [ ] Preview text samples
- [ ] Preview audio samples (if available)
- [ ] Select one to start
- [ ] "Can change later in settings" note

---

### Planned - Guided First Workout
- [ ] Tutorial overlay on live-workout screen
- [ ] Highlight key UI elements
- [ ] Walk through logging a few sets
- [ ] Trigger a "fake" PR to show celebration
- [ ] Skip option for experienced users

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
  currentStep: number;
  profileSetup: boolean;
  personalityPicked: boolean;
  tutorialCompleted: boolean;
};
```

**Storage:**
- Store onboarding state in AsyncStorage
- Clear on logout/account deletion
- Track completion for analytics

**Tutorial Overlay:**
- Use a library like react-native-copilot
- Or custom tooltip/highlight system
- Must not block app usage (skippable)

---

## UI Design

**Step 1: Profile Setup**
- Clean, minimal form
- Large input fields
- Progress indicator (Step 1 of 4)

**Step 2: Personality Picker**
- Grid or list of personalities
- Avatar/icon for each
- Sample quote visible
- Play button for audio preview

**Step 3: Guided Workout**
- Dimmed background
- Spotlight on current element
- Instruction text
- "Next" / "Skip" buttons

**Step 4: Done**
- Celebration animation
- "You're ready to train"
- Proceed to home screen

---

## Copy Direction

**Tone:**
- Welcoming, not overwhelming
- Confident, matches app personality
- Brief instructions, not walls of text

**Example Copy:**
- "Let's get you set up."
- "Pick your gym buddy."
- "This is how you log a set."
- "You just hit a PR. Here's how we celebrate."

---

## Dependencies

- Auth (user must be logged in)
- Settings store (save preferences)
- Personality data
- Live workout screen (for tutorial)

---

## Priority

**P0 (Pre-Launch):**
- Profile setup (name, bodyweight)
- Personality picker

**P1 (Launch):**
- Guided first workout
- Ranking introduction

**P2 (Post-Launch):**
- Feature highlights carousel
- Refined tutorial UX
