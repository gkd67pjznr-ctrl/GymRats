# FORGERANK MASTER PLAN
**The Vision, Strategy, and Roadmap**

---

## Document Info
- **Created:** 2026-01-25
- **Last Updated:** 2026-01-30
- **Status:** Active — Updated from brainstorm interview and documentation organization

---

# VISION STATEMENT

**Forgerank is a workout tracking app that feels alive.**

It's not just a logging tool — it's a gym buddy with personality, a ranking system that means something, a growing avatar that represents your journey, and a social experience that keeps you coming back. Where other apps feel sterile and transactional, Forgerank feels like it knows you, celebrates with you, and pushes you to be better.

**Day-one goal:** Very polished, feature-rich, beautiful. Not a beta. Seamless, sleek, well-designed.

---

# CORE DIFFERENTIATORS

## 1. Forgerank Scoring System
**What makes us different:** Static, verified standards.

- **0-1000 score, 20 ranks per exercise** (Iron to Mythic)
- **e1RM-based scoring** using Epley formula
- **Static top-end standards** based on verified, video'd world-class lifts
- **Key insight:** Users compare against REAL standards, not inflated user-submitted data
- **Anti-cheat philosophy:** Playful cues for anomalies, but ranks never inflate

**Why this wins:** Users know their rank means something real.

## 2. AI Gym Buddy System
**What makes us different:** The app has a character.

- **8-12 personality archetypes at launch** — original characters inspired by archetypes (not licensed real people)
- **Reactive commentary** — like a sports announcer, not a chatbot
- **Tiered buddy system:**
  - Basic (text-only, 2-3 free)
  - Premium (voice + text, IAP)
  - Legendary (full theme transformation, IAP)
- **AI-generated voices** for original characters
- **Community-created packs** (post-launch)
- **Reacts to everything:** PRs, rank-ups, long rests, streaks, workout start/finish, final set push

**Why this wins:** Every other app is a spreadsheet. We have a character.

## 3. Avatar & Hangout Room
**What makes us different:** Emotional investment beyond gamification.

- **Finch-inspired growing avatar** — literal height/size growth representing commitment to self-care
- **Multiple art styles** — Bitmoji, pixel art (Mega Man), retro (Street Fighter 2), 3D
- **Shared hangout room** — see friends' avatars, visual-only, lightly animated
- **Purchasable decorations** — room members contribute, room creator has admin control
- **Avatar leaves room** when friend is working out (with status message)

**Why this wins:** Users open the app even on rest days. Deep emotional connection.

## 4. The Aesthetic
**What makes us different:** Looks so good people want to show it off.

**Inspired by:** Pure dating app

**Visual direction:**
- **Mysterious/exclusive** — like a members-only club
- **Layered approach** — PURE's emotional personality over LIFTOFF's functional efficiency
- **Multiple color palette options** — with emotional meaning rather than semantic state
- **Hand-drawn illustration style** — surreal/psychedelic elements for unique brand identity
- **Typography system** — balancing functional clarity with personality-driven treatments
- **Dark gradients + accent colors** — almost monochromatic with pops of color
- **Bold typography** — confident, makes statements
- **Minimal UI chrome** — lots of negative space, content-focused
- **Punchy animations** — PRs, rank-ups, streaks get visual reactions
- **Emotional language/copy** — for key workout moments and user interactions

**Complete visual implementation:**
See `docs/visual-style/` for comprehensive documentation including UI Aesthetic Implementation Plan, Visual Style Guide, and Implementation Roadmap.

**Why this wins:** Young lifters care about aesthetics. If the app looks cool, they'll use it.

## 5. The Social Loop
**What makes us different:** Built for lifters, not general fitness.

- **Full feed with Global + Friends tabs**
- **Auto-generated workout cards** — beautiful, shareable
- **Auto-posts for milestones** — rank-ups, PRs, streaks
- **Workout Replay** — cinematic post-workout summaries (THE share moment)
- **Live presence** — see when friends are working out
- **Reactions** — quick emotes on friends' workouts
- **Online competitions** — powerlifting meets, bodybuilding shows (post-launch)

**Why this wins:** Lifters want to share with other lifters, not their running friends.

## 6. Forge DNA & Analytics
**What makes us different:** Your training identity, visualized.

- **Forge DNA** — visual fingerprint of training style (muscle balance, lift preferences, strength vs volume)
- **Forge Lab** — premium analytics dashboard (strength curves, volume trends, rank progression)
- **Premium blur mechanic** — show partial DNA free, full version behind subscription

**Why this wins:** Serious lifters crave data. Casual lifters love the visual identity.

---

# TARGET USER

## Primary: All Lifters
- **Serious lifters** — want progression data, ranks, analytics
- **Gym newcomers** — need guidance, motivation, and that first rank-up moment
- **Social gym-goers** — work out with friends, want to share/compete
- **Gamers who lift** — respond to XP, ranks, streaks, achievements, avatars

## Cultural Positioning
- Tap into current social media fitness culture
- Stay current but not cringey — a little spice, not over the top
- Expand to appeal to healthy lifestyle/middle-aged audience over time
- Inclusive body options standard (gender-neutral, diverse representation)

---

# BUSINESS MODEL

## Freemium + IAP Hybrid

### Free Tier (Core Experience)
- Full workout logging + Forgerank scoring + ranks
- Social feed + friends + reactions
- 2-3 starter gym buddy personalities (text-only)
- Basic history/calendar + weight graph
- Streak tracking + gamification (XP, levels, Forge Tokens)
- Avatar (default style) + hangout room
- Forge DNA (partially blurred)
- Forge Milestones + trophy case
- Workout Replay

### Pro Subscription
- **Forge Lab** — full analytics dashboard
- **Full Forge DNA** — unblurred training identity
- **Advanced AI coaching** suggestions (post-launch)
- **Integration analytics** — Apple Health, MFP, Whoop data displayed

### IAP (In-App Purchases)
Individual purchases, no subscription required:
- **Premium buddy packs** — voice + text personalities
- **Legendary buddy packs** — full theme transformation (colors, sounds, UI style)
- **Avatar cosmetics** — clothes, accessories, art style packs
- **Room decorations** — hangout room items
- **Seasonal items** — limited-time earnable cosmetics (Forge Seasons)

### Currency: Forge Tokens
Earned through gameplay, spent on cosmetics:

| Action | Tokens |
|--------|--------|
| Level up | 50 |
| 7-day streak | 25 |
| 30-day streak | 100 |
| 100-day streak | 500 |
| Weight PR | 10 |
| e1RM PR | 5 |
| Rank up | 25-100 (tier dependent) |

**Philosophy:** No pay-to-win. Cosmetics and analytics only. Core workout experience always free.

---

# GAMIFICATION SYSTEMS

## 1. Forgerank (Per-Exercise)
- 0-1000 score, 20 ranks per exercise
- Based on e1RM against verified standards
- Rank-up celebrations with animations + sound
- Shareable moments via Workout Replay

## 2. User Level (XP System)
- Separate from Forgerank (measures activity, not strength)
- Increases by logging workouts
- Visual XP bar progression
- Earns Forge Tokens for cosmetic store

## 3. Streak System
- Simple day counter, breaks after 5 days inactivity
- Visual streak calendar (GitHub-style contribution graph)
- Milestone celebrations (7, 30, 100, 365 days)
- Currency rewards at milestones

## 4. Forge Milestones
- Non-repeatable lifetime achievements
- Tiered rarity: Common, Rare, Epic, Legendary
- Trophy case on profile with special visual treatment
- Legendary = genuinely hard (top 1% type achievements)

## 5. Avatar Growth
- Finch-inspired growing companion
- Physical size/height growth driven by volume + sets + rank
- Represents user's commitment to self-care
- Multiple art styles mix in shared rooms

## 6. Leaderboards (Post-Launch)
- Per-exercise, overall, volume, user level
- Friends-only AND global views
- Gym-level leaderboards (via Gym Finder)

---

# KEY FEATURES

## Core Workout Experience
| Feature | Priority | Notes |
|---------|----------|-------|
| Quick number pad input | P0 | Fast, calculator-style |
| Stepper +/- buttons | P0 | Increment weight/reps easily |
| Auto-fill from last workout | P0 | Smart defaults |
| Rest timer | P0 | Auto-start, push notification when done |
| Routine/program builder | P0 | Create and follow structured workouts |
| Exercise library | P0 | Comprehensive, linked to muscle groups |
| History/calendar view | P0 | Visual streak calendar |
| Training journal | P2 | Free-form notes per workout (post-launch) |

## PR & Celebration Experience
| Feature | Priority | Notes |
|---------|----------|-------|
| Buddy reactive commentary | P0 | Personality-driven cues on every PR |
| Sound effects | P0 | Audio cues per personality tier |
| Haptic feedback | P0 | Physical response |
| Workout Replay | P0 | Cinematic post-workout summary |
| Share to in-app feed | P0 | Focus on Forgerank social, not external |

## Avatar & Social Space
| Feature | Priority | Notes |
|---------|----------|-------|
| Avatar creation | P0 | Multiple art styles, skippable in onboarding |
| Avatar growth | P0 | Driven by volume + sets + rank |
| Hangout room | P1 | Visual-only, lightly animated |
| Room decorations | P1 | Purchasable, IAP |
| Friend presence | P1 | Avatar leaves when working out |

## Social Features
| Feature | Priority | Notes |
|---------|----------|-------|
| Global + Friends feed tabs | P0 | Easy to switch |
| Auto-generated workout cards | P0 | Beautiful, shareable summaries |
| Auto-posts for milestones | P0 | Rank-ups, PRs, streaks |
| Optional photo attachments | P1 | Or default to body model |
| Reactions | P0 | Quick emotes |
| Live workout presence | P1 | See friends working out |
| Live workout together | P2 | Shared sessions (post-launch) |
| Online competitions | P2 | PL meets, BB shows (post-launch) |

## Analytics & Identity
| Feature | Priority | Notes |
|---------|----------|-------|
| Forge DNA | P0 | Partially blurred free, full premium |
| Forge Lab | P1 | Premium analytics dashboard |
| Weight graph | P0 | Free |
| Health integrations | P2 | Apple Health, MFP, Whoop (post-launch) |

## Notifications
| Feature | Priority | Notes |
|---------|----------|-------|
| Friend requests | P0 | Minimal, essential |
| DMs | P0 | Minimal, essential |
| Competition results | P1 | Post-launch |
| Rest timer (backgrounded) | P0 | During workout only |

**Notification philosophy:** Minimal only. No nagging. Respect the user's attention.

## Integrations (Post-Launch)
| Feature | Priority | Notes |
|---------|----------|-------|
| Apple Health | P1 | Weight, BMI import |
| MyFitnessPal | P2 | Nutrition data for Forge Lab |
| Whoop | P2 | Recovery, strain data |
| Fitbit | P2 | Weight, activity data |

**Not doing:** Spotify/Apple Music integration (buddy sounds only, no ambient/music).

---

# ANTI-CHEAT PHILOSOPHY

## Static Ranks
- Top-end standards are **fixed** based on verified world-class lifts
- User-submitted data **cannot inflate** the ranking tiers

## Playful Anomaly Detection
- Flag 10%+ e1RM jumps for users in top 3 ranks
- Lower ranks have more tolerance (new users experimenting)
- Cross-exercise validation

## Philosophy
- Users can lie to themselves
- Users cannot lie to affect others
- The system celebrates authenticity through static, verified standards

---

# ONBOARDING

## First-Time Flow (All Steps Skippable)
1. **Avatar creation**
   - Pick art style (Bitmoji, pixel, retro, 3D)
   - Basic customization
   - Default avatar assigned if skipped

2. **Goal setting**
   - "What are you training for?"
   - Options: Strength, Aesthetics, Health, Sport
   - Personalizes AI suggestions

3. **Profile setup**
   - Name
   - Bodyweight (with unit toggle)
   - Experience level (beginner/intermediate/advanced)

4. **Pick a personality**
   - Choose gym buddy
   - Preview text samples per personality
   - Can change later in settings

5. **Guided first workout**
   - Walk through logging one real set
   - Show PR detection + buddy commentary
   - Trigger first Workout Replay
   - Skip option for experienced users

---

# CONTENT MODERATION

## Approach
- **Report + Block** — users can flag content
- **AI pre-filtering** — automatic detection of inappropriate content
- **Anti-toxicity focus** — steer away from direct body comparison
- **No built-in video platform** — link to IG/TikTok for general content
- **Video upload only** for competition submissions (scoped context)

## Privacy
- **Public by default** — encourages discovery
- **Opt-out available** — friends-only or private options
- **Per-post control** — users choose visibility

---

# ACCESSIBILITY & INCLUSIVITY

- **Community-driven exercise alternatives** — users suggest/flag modifications for injuries, wheelchair, etc.
- **Inclusive body options** standard from day one (gender-neutral body model, diverse representation)
- **Not a launch blocker** — phase in after core, but inclusive body model is day-one standard

---

# SOUND DESIGN

- **Buddy sounds only** — sound effects for PRs, rank-ups, set completion + buddy voice lines
- **No ambient soundscapes** — not a music app
- **No music integration** — no Spotify/Apple Music player
- **Tiered audio:** Basic buddies = no audio, Premium = voice lines, Legendary = full sound theme

---

# PLATFORM STRATEGY

## v1 Launch
- **iOS + Android simultaneously**
- React Native (Expo) for cross-platform
- Single codebase, consistent experience

## Future
- **Web app** for premium users (analytics dashboard, routine builder)
- Apple Watch companion (post-launch)

---

# TIMELINE

## Phase 0: Stabilization (Complete)
- ✅ Fix existing bugs
- ✅ Complete Zustand migration
- ✅ Establish solid foundation
- ✅ Build backend sync system

## Phase 1: Core Workout Polish
- Routine-based workout flow
- Exercise logging polish
- Rest timer improvements

## Phase 2: AI Gym Buddy + Avatar
- Personality engine (8-12 archetypes)
- Reactive commentary system
- AI-generated voice system
- Avatar creation + growth system
- Hangout room

## Phase 3: Social & Engagement
- Full feed with auto-generated workout cards
- Workout Replay (cinematic summaries)
- Reactions + comments
- Forge DNA + Forge Lab
- Forge Milestones

## Phase 4: Launch Polish
- Full onboarding (avatar, goals, guided workout)
- Visual polish + animations
- Performance optimization
- App Store preparation

## Phase 5: Post-Launch v2
- Leaderboards + competitions
- Online powerlifting meets / bodybuilding shows
- Live Workout Together
- Integrations (Apple Health, MFP, Whoop)

## Phase 6: Ecosystem
- Gym Finder / Map with partnerships
- AI Coaching (template-based)
- Templates Marketplace
- Training Journal
- Forge Seasons

---

# REST DAY ENGAGEMENT

What keeps users coming back when they're not lifting:
- **Social feed** — scrolling, reacting, checking leaderboards
- **Planning** — browse/edit routines, plan next workout
- **Avatar care** — visit avatar, check room, see friends' status
- **Rank checking** — review progression for serious lifters
- **Forge DNA** — review training identity

---

# SUCCESS METRICS

## Launch Goals
- 0 critical bugs in first week
- <1% crash rate
- Average session duration >5 minutes
- 60%+ friend feature adoption

## Growth Goals
- Organic sharing of Workout Replays to in-app feed
- Word-of-mouth from aesthetic/vibe
- Retention through avatar + streak + hangout room
- Premium conversion through Forge Lab + Forge DNA blur

## Performance Targets
- App launch: <2s
- Set logging: <100ms
- Screen transitions: <300ms
- Smooth 60fps scrolling

---

# COMPETITIVE POSITIONING

## We Are NOT
- A comprehensive fitness suite (MyFitnessPal)
- A complex programming tool (Strong, Juggernaut)
- A form analysis app (Tempo)
- A general health app
- An AI-everything workout generator

## We ARE
- A workout tracker with personality
- A social platform for lifters
- A progress visualization tool
- A premium-feeling experience
- A virtual gym companion (avatar + buddy)

## Vs. Competition

| Feature | Forgerank | Liftoff | Hevy | Strong | Finch |
|---------|-----------|---------|------|--------|-------|
| Personality/cues | Yes (8-12) | No | No | No | No |
| Static verified ranks | Yes | No | No | No | No |
| Aesthetic focus | Yes | Some | No | No | Yes |
| Social built-in | Yes | Limited | Yes | No | No |
| Growing avatar | Yes | No | No | No | Yes |
| Cosmetic store | Yes | No | No | No | Yes |
| Workout Replay | Yes | No | No | No | No |
| Forge DNA | Yes | No | No | No | No |
| Online competitions | Yes | No | No | No | No |
| Free tier | Yes | Yes | Yes | Freemium | Freemium |

---

# RISKS & MITIGATIONS

## Technical Complexity
**Risk:** 204 features across 27 feature groups is ambitious
**Mitigation:** 6-phase approach. Launch with 155 features, add 49 post-launch.

## Avatar System
**Risk:** Multi-style avatar creation + growth is technically complex
**Mitigation:** Start with 2D styles, add 3D later. Growth system is data-driven, not art-intensive.

## AI Voice Generation
**Risk:** Quality AI voices for 8-12 characters
**Mitigation:** Start with text-only (free tier), add voice progressively. AI voice tech is improving rapidly.

## Design Execution
**Risk:** Getting the "mysterious/exclusive" vibe right
**Mitigation:** Reference Pure dating app, iterate on design, get feedback

## User Acquisition
**Risk:** Building it is easier than getting users
**Mitigation:** Workout Replay drives in-app sharing. Aesthetic drives screenshots. Avatar/room drives daily engagement.

## Competition
**Risk:** Liftoff/Hevy/Strong are established
**Mitigation:** Differentiate on personality + avatar + verified ranks + competitions. No one has online PL meets or BB shows.

---

# DECISION LOG

## 2026-01-30: Documentation Organization
Key decisions:
- **Documentation structure:** Organized into clear directories for better navigation
- **Feature files:** Moved to subdirectories by category (Auth, Avatar, Workout, Social, etc.)
- **Master documentation:** Updated all file paths to reflect new organization
- **README files:** Created for all directories to explain contents

## 2026-01-29: Feature Brainstorm Interview
Full transcript: `docs/AskUQ/2026-01-29-feature-brainstorm.md`

Key decisions:
- **AI Gym Buddy:** 8-12 archetypes, tiered (basic/premium/legendary), reactive commentary, AI-generated voices, original characters only
- **Avatar & Hangout Room:** Finch-inspired, multiple art styles, visual-only social room, purchasable decorations
- **Workout Replay:** Cinematic post-workout summary, share to in-app feed (not external)
- **Forge DNA:** Training identity fingerprint, premium blur mechanic
- **Forge Lab:** Premium analytics dashboard, weight graph free
- **Forge Milestones:** Tiered rarity (common/rare/epic/legendary), trophy case
- **Forge Seasons:** Lighter version (no battle pass), limited-time cosmetics
- **Online Competitions:** PL meets + BB shows, tiered judging, seasonal events
- **Gym Finder / Map:** Full ecosystem with community reviews + partnerships
- **Templates Marketplace:** Community-driven routine sharing
- **Training Journal:** Free-form notes, feeds into AI coaching
- **AI Coaching:** Template-based first, AI suggestions layer on top, premium
- **Live Workout Together:** Passive + shared + guided modes
- **Business model:** Freemium + IAP (not just subscription)
- **Notifications:** Minimal only (friend requests, DMs, competition results)
- **Integrations:** Health data only (Apple Health, MFP, Whoop), no music
- **Sound:** Buddy sounds only, no ambient/music
- **Accessibility:** Community-driven exercise alternatives, inclusive body options standard
- **Target user:** All lifters (serious, newcomers, social, gamers)
- **Launch strategy:** Polished, feature-rich day one

## 2026-01-25: Initial Interview
Key decisions:
- Forgerank scoring system confirmed (0-1000, 20 ranks, static standards)
- Cue system with customizable personalities
- Pure-inspired aesthetic (mysterious/exclusive)
- Full social features in v1
- Freemium + cosmetic store model
- iOS + Android simultaneously

---

**End of Master Plan v2.1**
*This document is the source of truth for Forgerank's vision and strategy.*
*Updated from documentation organization on 2026-01-30.*