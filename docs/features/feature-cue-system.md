# Feature: AI Gym Buddy System

**Status:** In Progress | **Progress:** 8/11 features
**Previously:** Cue System

## Overview
The AI Gym Buddy System is what gives Forgerank its personality. Instead of being a sterile spreadsheet, the app feels like having a reactive commentator in your corner -- a sports announcer who knows your lifts, celebrates your PRs, roasts your long rests, and hypes your finishing set. These are original characters, not chatbots. They react to what you do, not what you say.

**Core Differentiator:** Every other app is a spreadsheet. Forgerank has a cast of characters.

**Interaction Model:** Reactive commentary, not conversation. Think sports announcer or fight-game commentator -- triggered by in-session events and behavior patterns, never requiring user input.

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

### Implemented - Buddy Tier System

Three tiers of gym buddy, each with increasing richness:

**Basic Tier (Free / Forge Tokens)**
- Text-only commentary
- 2-3 buddies free at install
- Additional basic buddies unlocked with Forge Tokens (earned in-app)
- No voice, no theme changes

**Premium Tier (IAP)**
- Voice + text commentary (AI-generated voices)
- Richer message pools with more variation
- Purchased individually or in packs via IAP

**Legendary Tier (IAP)**
- Full theme transformation (accent color, UI chrome, rank badge style)
- Voice + text with expanded lines
- Unique sound effects per buddy
- Premium visual flair on toasts and celebrations
- Purchased individually via IAP

---

### Implemented - Personality Roster (12 at Launch)

All buddies are **original characters** inspired by familiar archetypes -- not licensed real people, not celebrity likenesses. Each has a distinct voice, vocabulary, and energy.

| Buddy Name | Archetype | Tier | Vibe |
|---|---|---|---|
| The Coach | **The Coach** | Basic (free) | Steady, knowledgeable, encouraging. "Good set. Now let's build on that." |
| Hype Beast | **Hype Beast** | Basic (free) | Over-the-top energy, exclamation points. "LETS GOOO! THAT WAS INSANE!" |
| Chill | **Chill** | Basic (free) | Mellow, positive, no pressure. "Nice lift. You're vibing today." |
| Girl Power Fit | **Girl Power Fit** | Basic (free) | Female fitness influencer focused on empowerment. "Slay those weights like the goddess you are!" |
| Mindful Movement | **Mindful Movement** | Basic (free) | Calm female influencer focused on proper body mechanics. "Move with intention. Feel each muscle engage." |
| The Savage | **Savage** | Premium | Brutally honest, dark humor. "That rest was longer than your last relationship." |
| Anime Sensei | **Anime Sensei** | Premium | Dramatic, anime-inspired power-up energy. "Your spirit is BURNING! This is your final form!" |
| Goth Gym Rat | **Goth Gym Rat** | Premium | Dark, brain-rot, overly online goth girl. "Deadlifts so heavy they wake the ancestors 👁️💀" |
| Action Hero | **Action Hero** | Premium | One-liners, over-the-top machismo. "Weights don't lift themselves. But if they did, they'd be afraid of you." |
| Drill Sergeant | **Drill Sergeant** | Premium | Barking orders, no-nonsense. "OUTSTANDING SOLDIER! THAT'S WHAT I LIKE TO SEE!" |
| Zen Master | **Zen Master** | Premium | Calm, philosophical. "INNER STRENGTH REVEALED" |
| Trash Talker | **Trash Talker** | Legendary | Roasts you with love. Full theme reskin. "You call that a set? My grandma pulls more." |
| Legendary Mystery Buddy | **Legendary Mystery Buddy** | Legendary | Theme-warping presence with unique personality. "THE POWER AWAKENS..." |

- [x] 12 personalities designed and written at launch
- [x] Personality selection in settings
- [x] Personality preview (read sample lines, hear voice preview for premium+)
- [x] Tier-gated unlock flow (Forge Tokens for basic, IAP for premium/legendary)
- [x] Legendary buddies apply theme transformation on equip

---

### Implemented - Trigger System

Buddies react to three categories of in-session events:

**Performance Events**
- [x] Weight PR detected
- [x] Rep PR detected
- [x] e1RM PR detected
- [x] Rank-up achieved (full implementation with historical data integration)
- [x] Volume milestone hit (e.g., 10,000 kg session volume)

**Behavior Patterns**
- [x] Long rest detected (configurable threshold)
- [x] Skipping exercises in a planned workout (full implementation)
- [x] Workout streak milestone (3, 7, 14, 30 days)
- [x] Returning after absence (3+ days, 7+ days, 14+ days)
- [x] Unusually short workout (bail-out detection)

**Session Flow**
- [x] Workout start (hype / tone-setting)
- [x] Mid-workout check-in (energy maintenance)
- [x] Final set of an exercise (push cue)
- [x] Workout finish (summary + sign-off)

---

### Implemented - Text Cues (P0)
- [x] Message pool per personality per trigger type (70 messages per buddy across 14 trigger types)
- [x] Weighted random selection (avoid repeats within session)
- [x] Intensity scaling (low / high / epic) based on magnitude of event
- [x] Personality-specific vocabulary, slang, and sentence structure
- [x] Context-aware variable interpolation (weight, reps, rank name, streak count)
- [x] Session memory (buddy references earlier events: "That's your SECOND PR today")

---

### Implemented - Voice System (Premium+ Only)
- [x] AI-generated voices per buddy (not real person recordings)
- [x] Voice lines triggered on same events as text
- [x] Audio toggle in settings (default: off for basic, on for premium+)
- [x] Voice preview in buddy select screen
- [x] Buddy-specific sound effects for premium tier (PR sting, rank-up fanfare)
- [x] Legendary tier: unique sound palette per buddy

**Sound Design Scope:**
- Buddy voice lines and buddy-specific SFX only
- NO ambient soundscapes
- NO music integration or playlist features
- Keep audio footprint small and punchy

---

### Implemented - Celebrations

**PR Celebration:**
- Toast notification with personality-flavored message
- Haptic feedback
- Voice line (premium+ only)
- One-tap share to feed

**Rank-Up Celebration:**
- Full-screen modal with animation
- Buddy congratulation (text + voice for premium+)
- Legendary buddies: rank-up modal uses buddy theme colors
- Share prompt

**Streak Milestone:**
- Toast with streak count
- Buddy acknowledgment line
- Visual streak badge update

**Return After Absence:**
- Welcome-back line on session start
- Tone varies by buddy (Coach: encouraging, Savage: roasting, Zen: reflective)

---

### Post-Launch - Community Personality Packs
- [ ] Spec format for community-created buddy packs
- [ ] Submission and review pipeline
- [ ] Community marketplace or curated drops
- [ ] Revenue share model for creators (TBD)
- [ ] Content moderation tooling

---

## Technical Notes

**Key Files:**
- `src/lib/perSetCue.ts` - PR detection logic (exists)
- `src/lib/buddyEngine.ts` - Personality engine + trigger evaluation (implemented)
- `src/lib/buddyData.ts` - Message pools per personality per trigger (implemented with 12 personalities)
- `src/ui/components/InstantCueToast.tsx` - Toast display (exists)
- `src/lib/stores/buddyStore.ts` - Selected buddy, unlocked buddies, tier state (implemented)

**CueMessage Structure:**
```typescript
type CueMessage = {
  buddyId: string;
  buddyTier: 'basic' | 'premium' | 'legendary';
  triggerType:
    | 'pr_weight'
    | 'pr_rep'
    | 'pr_e1rm'
    | 'rank_up'
    | 'volume_milestone'
    | 'streak'
    | 'long_rest'
    | 'skip'
    | 'return_after_absence'
    | 'session_start'
    | 'session_mid'
    | 'final_set'
    | 'session_end';
  intensity: 'low' | 'high' | 'epic';
  text: string;
  voiceLine?: string;       // audio asset ref (premium+ only)
  sfx?: string;             // buddy-specific sound effect ref
  themeOverride?: string;    // legendary buddies only -- theme ID to apply
};
```

**Buddy (Personality) Structure:**
```typescript
type BuddyTier = 'basic' | 'premium' | 'legendary';

type Buddy = {
  id: string;
  name: string;
  archetype: string;
  tier: BuddyTier;
  description: string;
  previewLines: string[];                        // sample text lines for preview
  previewVoice?: string;                         // audio asset ref for voice preview
  themeId?: string;                              // legendary only -- theme to apply
  unlockMethod: 'free' | 'forge_tokens' | 'iap';
  unlockCost?: number;                           // forge token cost (basic tier)
  iapProductId?: string;                         // IAP product ID (premium/legendary)
  messages: Record<string, string[]>;            // triggerType -> message pool
  voiceLines?: Record<string, string[]>;         // triggerType -> voice asset refs
  sfxPack?: Record<string, string>;              // event -> sfx asset ref
};
```

---

## Design Direction

**Interaction Model:**
- Reactive, not conversational -- buddy talks AT you like a commentator
- No chat input, no back-and-forth, no AI generation at runtime
- All lines are pre-written and curated per personality
- Feels alive without feeling like a chatbot

**Tone Guidelines:**
- Authentic to each archetype -- commit to the bit
- Celebratory but not repetitive (large message pools, weighted random)
- Each buddy should feel like a distinct character, not a reskin
- Current but timeless (avoid dated slang that will age badly)

**Message Examples (Coach):**
- Weight PR: "New weight PR. That's real progress -- the work is paying off."
- Long Rest: "Take your time. Recovery is part of the process."
- Session End: "Solid session. You showed up and put in the work."

**Message Examples (Savage):**
- Weight PR: "Finally. I was starting to wonder."
- Long Rest: "You writing a novel over there? Get back to work."
- Session End: "Not bad. Not good either. See you tomorrow."

**Message Examples (Anime Sensei):**
- Weight PR: "YES! Your power level... it's RISING!"
- Final Set: "This is it. Channel everything. PLUS ULTRA!"
- Session End: "You have honored the iron today, warrior."

---

## Monetization

| Tier | Unlock Method | What You Get |
|---|---|---|
| Basic | Free (2-3) or Forge Tokens | Text-only commentary |
| Premium | IAP (individual or pack) | Voice + text, richer message pool |
| Legendary | IAP (individual) | Voice + text + full theme transformation |

- Forge Tokens are earned through in-app activity (workouts, streaks, achievements)
- IAP packs may bundle multiple premium buddies at a discount
- Legendary buddies are sold individually as premium collectibles
- Community packs (post-launch) follow a separate pricing/revenue model TBD

---

## Dependencies

- Settings store (buddy preference, voice toggle)
- Buddy store (unlocked buddies, equipped buddy, tier state)
- IAP integration (expo-iap or RevenueCat)
- Audio playback (expo-av)
- Forge Tokens economy (currency store -- shared with other cosmetic unlocks)
- Theme system (legendary buddy theme overrides)

---

## Priority

**P0 (Launch Required):**
- [x] Personality engine (trigger evaluation + message selection)
- [x] Text cues working for all trigger types
- [x] 12 buddies written with full message pools
- [x] 2-3 basic buddies free, rest gated behind Forge Tokens or IAP
- [x] Basic audio support for premium tier (voice lines playing on triggers)
- [x] Buddy selection UI in settings
- [x] IAP integration for premium/legendary purchases

**P1 (Completed):**
- [x] Legendary tier theme transformations
- [x] Expanded message pools (reduce repetition)
- [x] Behavior pattern triggers (long rest, skip, return after absence)
- [x] Session flow triggers (start hype, mid check-in, final set push)

**P2 (Post-Launch):**
- Community personality pack pipeline
- Additional buddies (beyond launch roster)
- Seasonal / limited-edition buddy drops
- Analytics on buddy usage and engagement
