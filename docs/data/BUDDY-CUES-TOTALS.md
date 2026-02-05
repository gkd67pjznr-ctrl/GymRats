# Buddy Text Cues - Complete Inventory

**Last Updated:** February 5, 2026
**Total Cues:** 4,710 (parsed from source docs)

---

## Source Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `BUDDY-TEXT-CUES-MASTER.md` | Original 8 personalities, 3 categories (SHORT/HYPE/CULTURE) | Complete |
| `BUDDY-TEXT-CUES-MASTER-V2.md` | 5 personalities (Default + 4 new), 10 categories | Complete |
| `BUDDY-TEXT-CUES-SUPPLEMENT.md` | Original 8 personalities, 7 new categories | Complete |

---

## Cue Categories

| Category | Count per Personality | Trigger Context |
|----------|----------------------|-----------------|
| SHORT | 50 | Quick acknowledgment after any set |
| HYPE | 50 | PR moments, rank-ups, big achievements |
| CULTURE | 50 | Random flavor, personality expression |
| START | 50 | Workout session begins |
| END | 50 | Workout session completes |
| REST | 30 | During rest timer between sets |
| NUDGE | 20 | Long rest detected, gentle reminder |
| FAILURE | 30 | Missed rep, failed set, lower than expected |
| COMEBACK | 20 | Return after 3+ days away |
| MILESTONE | 30 | Major achievements (streaks, totals, rank-ups) |

**Total per fully-implemented personality:** 380 cues

---

## Personality Inventory

### Parsed Cue Counts (from `scripts/parseBuddyCues.js`)

| Personality | ID | Parsed Cues |
|-------------|-----|-------------|
| **Default** | `default` | 530 (150 V1 + 380 V2) |
| **Gym Bro** | `gym_bro` | 380 |
| **Fit Influencer** | `fit_influencer` | 380 |
| **Terminally Online** | `terminally_online` | 380 |
| **Counterculture/Demons** | `counterculture` | 380 |
| **Powerlifting** | `powerlifting` | 380 |
| **Bodybuilding** | `bodybuilding` | 380 |
| **B-Boy/Calisthenics** | `bboy` | 380 |
| **Anime/Weeb** | `anime` | 380 |
| **Old School/Iron Era** | `old_school` | 380 |
| **Military/Tactical** | `military` | 380 |
| **Stoic** | `stoic` | 380 |

**Total Parsed: 4,710 cues**

---

## Cues by Category (All Personalities)

| Category | Cues per Personality | × 12 Personalities | **Total** |
|----------|---------------------|-------------------|-----------|
| SHORT | 50 | × 12 | **600** |
| HYPE | 50 | × 12 | **600** |
| CULTURE | 50 | × 12 | **600** |
| START | 50 | × 12 | **600** |
| END | 50 | × 12 | **600** |
| REST | 30 | × 12 | **360** |
| NUDGE | 20 | × 12 | **240** |
| FAILURE | 30 | × 12 | **360** |
| COMEBACK | 20 | × 12 | **240** |
| MILESTONE | 30 | × 12 | **360** |

**Grand Total: 4,560 cues**

---

## Personality IDs (for codebase)

| Personality | ID | Tier | Price |
|-------------|----|------|-------|
| Default | `default` | Free | - |
| Gym Bro | `gym_bro` | Free | - |
| Fit Influencer | `fit_influencer` | Free | - |
| Terminally Online | `terminally_online` | Premium | $1.99 |
| Counterculture/Demons | `counterculture` | Premium | $1.99 |
| Powerlifting | `powerlifting` | Premium | $1.99 |
| Bodybuilding | `bodybuilding` | Premium | $1.99 |
| B-Boy/Calisthenics | `bboy` | Premium | $1.99 |
| Anime/Weeb | `anime` | Premium | $1.99 |
| Old School/Iron Era | `old_school` | Premium | $1.99 |
| Military/Tactical | `military` | Premium | $1.99 |
| Stoic | `stoic` | Premium | $1.99 |

---

## Voice Line Status

| Personality | Text Cues | Voice Lines | Status |
|-------------|-----------|-------------|--------|
| Default | 380 | 0 | Pending ElevenLabs |
| Gym Bro | 380 | 0 | Pending |
| Fit Influencer | 380 | 0 | Pending |
| Terminally Online | 380 | 0 | Pending |
| Counterculture/Demons | 380 | 0 | Pending |
| Powerlifting | 380 | 0 | Pending |
| Bodybuilding | 380 | 0 | Pending |
| B-Boy/Calisthenics | 380 | 0 | Pending |
| Anime/Weeb | 380 | 0 | Pending |
| Old School/Iron Era | 380 | 0 | Pending |
| Military/Tactical | 380 | 0 | Pending |
| Stoic | 380 | 0 | Pending |

---

## Implementation Checklist

- [x] Write all text cues (4,342 total)
- [x] Create cue parsing script (`scripts/parseBuddyCues.js`)
- [x] Generate JSON files per personality (`scripts/output/cues/*.json`)
- [x] Generate Supabase seed SQL (`scripts/output/cues/seed_cues.sql`)
- [x] Create Supabase migration (`supabase/migrations/20260205_create_buddy_cues.sql`)
- [x] Create Zustand cue store (`src/lib/stores/cueStore.ts`)
- [ ] Run Supabase migration
- [ ] Seed database with cues
- [ ] Generate voice lines (ElevenLabs)
- [ ] Upload voice files to Supabase Storage
- [ ] Link voice URLs in database
- [ ] Connect `buddyEngine.ts` to use `cueStore`
- [ ] Add personality unlock/purchase flow

---

## File Locations

**Source of Truth (docs):**
- `docs/data/BUDDY-CUES-MASTER.md` - **Single source of truth** (4,710 cues, 12 personalities, 10 categories)
- `docs/data/BUDDY-CUES-TOTALS.md` - This inventory/tracking file

**Parsing & Seed Data:**
- `scripts/parseBuddyCues.js` - Markdown → JSON/SQL parser
- `scripts/output/cues/*.json` - Individual personality JSON files
- `scripts/output/cues/_all_cues.json` - Combined cue database
- `scripts/output/cues/seed_cues.sql` - Supabase seed INSERT statements

**Codebase (implementation):**
- `src/lib/stores/cueStore.ts` - Zustand store for cues (fetches from Supabase, caches locally)
- `src/lib/stores/buddyStore.ts` - Buddy selection/unlock state
- `src/lib/buddyEngine.ts` - Cue selection logic (needs update to use cueStore)
- `src/lib/buddyData.ts` - Legacy hard-coded buddy definitions

**Database:**
- `supabase/migrations/20260205_create_buddy_cues.sql` - Migration file
- `buddy_cues` table - All cues with category, personality, text, voice_url
- `buddy_personalities` table - Personality metadata, pricing, unlock status
- `user_buddy_state` table - Per-user buddy selection and unlocks
