# Voice Memo Summary - February 5, 2026

Summary of decisions and action items from voice memo session.

---

## Voice Memo 2: CSV Export/Import System

### Decision
CSV export/import is a **core feature from day one** - non-negotiable.

### Key Points
1. **CSV Export**: Complete workout history with timestamps
2. **CSV Import**: Accept data from other apps (Strong, Hevy, JEFIT)
3. **Anti-Gaming Rule**: Imported data does NOT count toward GymRats rankings
   - Imported = analytics only (Gym Lab)
   - Only native GymRats workouts affect ranks

### Implementation
- Add `source: 'native' | 'imported'` field to WorkoutSession
- Scoring logic filters out imported sessions
- Flexible parser for various CSV formats
- Exercise name fuzzy matching for imports

---

## Voice Memo 3: Server Infrastructure Documentation

### Decision
Create comprehensive server architecture document with cost projections.

### Key Points
1. Document current Supabase setup
2. Performance requirements for seamless workout logging
3. Handle: social feed, images, videos, avatars, messaging, friends
4. Scaling roadmap by user tiers: 10 → 100 → 500 → 1,000 → 10,000+
5. Secure development access
6. Cost breakdown at each tier

### Deliverable
`docs/infrastructure/SERVER-ARCHITECTURE.md`

---

## Voice Memo 4: Monetization & Revenue Tracking

### Decision
Create master revenue document with projections and business scaling triggers.

### Key Points
1. RevenueCat dashboard setup and understanding
2. Fee breakdown: Apple/Google (15-30%), RevenueCat (1% after $2.5K)
3. Bank account flow: App Store → RevenueCat → Stripe → Mercury
4. Revenue projections: 100 → 1K → 10K → 100K → 500K users
5. Tax obligations (self-employment, federal, quarterly estimates)
6. Business scaling triggers (when to hire CPA, lawyer, upgrade banking)

### Deliverable
`docs/business/REVENUE-MASTER.md` (git-ignored)

### Action
- Apply for Apple Small Business Program (15% rate)
- Apply for Google Play small business program

---

## Voice Memo 6: Exercise Database Overhaul

### Decision
Exercise database needs complete restructuring with master source of truth file.

### Key Points
1. **Master File Created**: `docs/data/EXERCISE-DATABASE-MASTER.md`
   - 1,590 exercises organized by primary muscle group
   - Alphabetical within groups
   - Equipment flags (BB, DB, Machine, Cable, Bands, KB, Bodyweight)
   - Human-readable format for manual editing

2. **Workflow**:
   - User reviews and cleans exercise names
   - Claude syncs cleaned file back to database
   - File becomes maintained source of truth

3. **Exercise Images/Icons**:
   - Every exercise needs visual representation
   - AI-generate consistent icon style
   - Simple silhouette/line-art for visual reminders

### Deliverables
- [x] `docs/data/EXERCISE-DATABASE-MASTER.md` (generated)
- [ ] Sync script: .md → exercises-raw.json
- [ ] Exercise icon generation pipeline

---

## Voice Memo 7: Exercise Notes & Workout Journal

### Decision
Two-tier note system that actually provides value through analytics.

### Key Points

**1. Per-Exercise Notes (Persistent)**
- Small icon on exercise card during workout
- Tap → dropdown text input
- Attaches to that exercise for user permanently
- Use case: Machine weight differences, form reminders

**2. Workout Day Log (Per-Session)**
- Log physical/mental state during workout
- **Must tie to analytics** - not empty notes

**Data Points:**
| Category | Inputs |
|----------|--------|
| Physical | Hydration (1-5), Calories, Carbs |
| Pain | Yes/No → body part checkboxes (elbows, shoulders, wrists, tendons L/R) |
| Mental | Energy level (1-5), Sleep quality (1-5) |

**Analytics Integration:**
- Correlate journal data with performance
- "When well hydrated + fed → 23% more likely to hit PR"
- "When well-rested → 15% more volume"
- Makes journaling USEFUL, not decorative

---

## New Tasks Summary

| # | Task | Category | Priority | Source |
|---|------|----------|----------|--------|
| 1 | Add `source` field to WorkoutSession model | Data Model | High | VM2 |
| 2 | Update ranking logic to exclude imported sessions | Scoring | High | VM2 |
| 3 | Implement CSV export function | Feature | High | VM2 |
| 4 | Add Export Data UI in settings | Feature | High | VM2 |
| 5 | Research competitor CSV formats | Research | Medium | VM2 |
| 6 | Implement CSV import parser | Feature | High | VM2 |
| 7 | Add Import Data UI with preview | Feature | High | VM2 |
| 8 | Exercise name fuzzy matching for imports | Feature | Medium | VM2 |
| 9 | Create SERVER-ARCHITECTURE.md | Documentation | High | VM3 |
| 10 | Research Supabase tier limits and pricing | Research | High | VM3 |
| 11 | Create REVENUE-MASTER.md | Documentation | High | VM4 |
| 12 | Set up RevenueCat dashboard | DevOps | High | VM4 |
| 13 | Apply for Apple Small Business Program | Business | High | VM4 |
| 14 | Create sync script: .md → exercises-raw.json | Tooling | High | VM6 |
| 15 | Define exercise icon style | Design | Medium | VM6 |
| 16 | Generate exercise icon prompts | Asset | Medium | VM6 |
| 17 | Create exerciseNotesStore.ts | Feature | High | VM7 |
| 18 | Add note icon + dropdown to exercise cards | UI | High | VM7 |
| 19 | Create DayLog data model and store | Feature | High | VM7 |
| 20 | Build Day Log input UI | UI | High | VM7 |
| 21 | Build Gym Lab correlation analytics | Feature | Medium | VM7 |

---

## Files Created This Session

| File | Purpose |
|------|---------|
| `docs/data/EXERCISE-DATABASE-MASTER.md` | Source of truth for exercises (1,590) |
| `scripts/generateExerciseMaster.js` | Script to regenerate master file |
| `docs/Master Documentation/VOICE-MEMO-SUMMARY-2026-02-05.md` | This summary |

---

*Generated: 2026-02-05*
