# Feature: Cue System (Gym Buddy)

## Overview
The Cue System is what gives Forgerank its personality. Instead of being a sterile spreadsheet, the app feels like a gym buddy who knows you, celebrates with you, and pushes you to be better.

**Core Differentiator:** Every other app is a spreadsheet. Forgerank has a character.

---

## Sub-Features

### Done - Basic PR Detection
- [x] Detect weight PRs
- [x] Detect rep PRs
- [x] Detect e1RM PRs
- [x] Priority system (Weight > Rep > e1RM)
- [x] Intensity levels (low/high)

**Implementation:** `src/lib/perSetCue.ts`

---

### Planned - Gym Buddy Personalities
- [ ] 3-5 personalities at launch
- [ ] Personality selection in settings
- [ ] Personality preview (hear/read samples)
- [ ] Store more personalities unlocked with currency

**Personality Ideas:**
- Arnold-style motivator
- Drill sergeant
- Supportive friend
- "Muscle mommy" archetype
- Fitness influencer voice
- Chill/zen coach

---

### Planned - Text Cues
- [ ] PR celebration messages
- [ ] Rank-up congratulations
- [ ] Streak milestone recognition
- [ ] Contextual encouragement during workout
- [ ] Rest period motivation
- [ ] Workout completion summary
- [ ] Personality-specific vocabulary and tone

---

### Planned - Audio Voice Packs
- [ ] Optional audio toggle (default: text only)
- [ ] Voice recordings per personality
- [ ] PR celebration sounds
- [ ] Rank-up fanfare
- [ ] Workout start/end audio cues
- [ ] AI-generated voices (future expansion)

---

### Planned - Contextual Intelligence
- [ ] Knows current streak length
- [ ] Knows recent PR history
- [ ] Knows workout duration
- [ ] Knows rest time patterns
- [ ] Adapts messages based on context
- [ ] Different energy for morning vs. evening

---

### Planned - Celebrations

**PR Celebration:**
- Toast notification with personality message
- Haptic feedback
- Optional sound effect
- One-tap share to feed

**Rank-Up Celebration:**
- Full-screen modal
- Animation + sound
- Personality congratulation
- Share prompt

**Streak Milestone:**
- Toast with streak count
- Personality acknowledgment
- Visual streak badge update

---

## Technical Notes

**Key Files:**
- `src/lib/perSetCue.ts` - PR detection logic
- `src/lib/cueMessages.ts` - Message templates (to be created)
- `src/ui/components/InstantCueToast.tsx` - Toast display

**Cue Message Structure:**
```typescript
type CueMessage = {
  personalityId: string;
  triggerType: 'pr_weight' | 'pr_rep' | 'pr_e1rm' | 'rank_up' | 'streak';
  intensity: 'low' | 'high' | 'epic';
  text: string;
  audioFile?: string;
};
```

**Personality Structure:**
```typescript
type Personality = {
  id: string;
  name: string;
  description: string;
  previewText: string;
  previewAudio?: string;
  unlockCost: number; // 0 = free starter
  messages: Record<string, string[]>;
};
```

---

## Design Direction

**Tone Guidelines:**
- Authentic, not cringey
- Celebratory but not over-the-top
- Personalized feel
- Current but timeless (avoid dated slang)

**Message Examples (Generic):**
- Weight PR: "New weight PR! You're getting stronger."
- Rep PR: "More reps at that weight? That's growth."
- Rank-Up: "Welcome to [Rank]! You earned it."

**Message Examples (Drill Sergeant):**
- Weight PR: "That's what I'm talking about! NEW WEIGHT!"
- Rep PR: "One more rep than last time. That's how champions are made."
- Rank-Up: "You just made [Rank]. Now push harder."

---

## Dependencies

- Settings store (personality preference)
- Cosmetic store (unlocking personalities)
- Audio playback (expo-av)

---

## Priority

**P0 (Launch Required):**
- Basic PR text cues
- At least 2 personality options

**P1 (Post-Launch):**
- Audio voice packs
- More personalities
- Contextual intelligence
