# GymRats User Instructions

**This file is the central repository for all instructions on using features and systems built for GymRats.**

Whenever a new feature is built that requires special usage instructions, those instructions will be added here.

---

## Table of Contents

1. [Production Services Setup](#production-services-setup)
2. [Supabase Database Migrations](#supabase-database-migrations)
3. [SQLPro Studio Connection Guide](#sqlpro-studio-connection-guide)
4. [ExerciseDB Sync Status](#exercisedb-sync-status)
5. [SQL Database Schema Review](#sql-database-schema-review)
6. [Editing Exercise Names](#editing-exercise-names)
7. [Adding Images to PR Celebrations](#adding-images-to-pr-celebrations)
8. [Customizing AI Gym Buddy Personalities](#customizing-ai-gym-buddy-personalities)
9. [Adding Custom Avatar Art Styles](#adding-custom-avatar-art-styles)
10. [Configuring Forge Lab Analytics](#configuring-forge-lab-analytics)

---

## Production Services Setup

Before deploying to production, you must configure external services for crash reporting, in-app purchases, and backend connectivity.

**Full documentation:** See `docs/Master Documentation/PRODUCTION-SETUP.md`

### Required Environment Variables

Create a `.env` file with these variables:

```bash
# Supabase (REQUIRED - app will crash in prod without these)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Sentry (crash reporting)
EXPO_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# RevenueCat (in-app purchases for buddy unlocks)
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_xxx

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Service Setup Checklist

| Service | Dashboard | What You Need |
|---------|-----------|---------------|
| **Sentry** | https://sentry.io | Create project, get DSN |
| **RevenueCat** | https://revenuecat.com | Create project, connect stores, get API keys |
| **Supabase** | https://supabase.com | Project URL and anon key (already have) |
| **Google OAuth** | https://console.cloud.google.com | OAuth 2.0 client ID |

### Code Locations

| Service | File | Notes |
|---------|------|-------|
| Sentry | `src/lib/monitoring/sentry.ts` | Initialized in `app/_layout.tsx` |
| RevenueCat | `src/lib/iap/RevenueCatService.ts` | Replaces expo-iap |
| Supabase | `src/lib/supabase/client.ts` | Production guard throws if unconfigured |

### Production Behavior

- **Sentry:** Only active in production builds (`__DEV__` = false)
- **Supabase:** Throws fatal error if credentials missing in prod
- **RevenueCat:** Gracefully disabled if keys not set

---

## Supabase Database Migrations

Some features require database migrations to be applied to your Supabase project before they can be used.

### Current Pending Migrations

**Migration 005: User Search Functionality**

The user discovery/search feature requires migration `005_user_search.sql` to be applied.

**File:** `supabase/migrations/005_user_search.sql`

**What it does:**
- Creates `search_users()` database function for searching by name/email
- Adds RLS policies to allow user profile discovery
- Creates indexes for search performance

**How to apply:**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy the contents of `supabase/migrations/005_user_search.sql`
5. Paste and click "Run" or press `Cmd+Enter`

**Verification:**

After applying, you can verify the migration worked by testing the user search in the Friends screen.

---

## SQLPro Studio Connection Guide

Connect SQLPro Studio (macOS) to your Supabase PostgreSQL database for direct SQL access.

### Connection Settings

| Field | Value |
|-------|-------|
| **Host** | `db.<your-project-ref>.supabase.co` |
| **Port** | `5432` |
| **Database** | `postgres` |
| **User** | `postgres` |
| **Password** | Your Supabase database password (set during project creation) |
| **SSL Mode** | Required (`require` or `verify-full`) |

### Step-by-Step

1. Open SQLPro Studio
2. Click **New Connection** > **PostgreSQL**
3. Enter the connection details from the table above
4. Your project ref is in your Supabase URL: `https://<project-ref>.supabase.co`
5. Enable **SSL** (check "Use SSL" or set SSL Mode to "Require")
6. Click **Connect**

### Finding Your Database Password

- **If you remember it**: Use the password you set when creating the Supabase project
- **If you forgot it**: Go to Supabase Dashboard > Project Settings > Database > Reset database password

### Useful Queries

```sql
-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies WHERE schemaname = 'public';

-- Check table row counts
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables ORDER BY n_live_tup DESC;
```

### Troubleshooting

- **Connection refused**: Ensure SSL is enabled; Supabase requires SSL for all direct connections
- **Authentication failed**: Reset your database password in Supabase Dashboard > Settings > Database
- **Timeout**: Some networks block port 5432; try using Supabase's pooler on port `6543` instead

---

## ExerciseDB Sync Status

### Current State: Infrastructure Built, Never Executed

The ExerciseDB RapidAPI sync system was built but never run. Here's what exists:

### What's Built

| Component | File | Status |
|-----------|------|--------|
| Sync Script | `scripts/syncExercises.js` | Complete but never executed |
| Sync Service | `src/lib/exerciseAPI/syncService.ts` | Complete TypeScript service |
| API Client | `src/lib/exerciseAPI/exerciseDBClient.ts` | RapidAPI client |
| Config | `src/lib/exerciseAPI/config.ts` | API key placeholder |
| Output File | `src/data/exerciseDB-synced.json` | Empty (0 bytes) |

### What's Actually in the App

The app uses `src/data/exercises-raw.json` (~873 exercises) from the **free-exercise-db** open-source project (not ExerciseDB/RapidAPI). This data is loaded by `src/data/exerciseDatabase.ts`.

### If You Want to Run the ExerciseDB Sync

1. Get a RapidAPI key for ExerciseDB
2. Set the API key in `src/lib/exerciseAPI/config.ts`
3. Run: `node scripts/syncExercises.js`
4. Output will be written to `src/data/exerciseDB-synced.json`
5. Update `exerciseDatabase.ts` to merge or replace data

### Recommendation

The free-exercise-db data (873 exercises) is already comprehensive. The ExerciseDB RapidAPI would add GIF animations and more metadata but requires a paid API subscription. Consider whether the additional data justifies the API cost before running the sync.

---

## SQL Database Schema Review

### Overview

The Supabase PostgreSQL database has **23 tables** with RLS enabled, covering auth, workouts, social, gamification, and shop systems.

### Tables by Domain

**Authentication & Users:**
- `profiles` - User profiles (username, display name, avatar, bio)
- `user_settings` - Preferences (units, theme, notifications)

**Workouts:**
- `workout_sessions` - Completed workouts with duration and metadata
- `workout_sets` - Individual sets (weight, reps, exercise)
- `exercise_prs` - Personal records tracking (weight, rep, e1RM PRs)
- `routines` / `routine_exercises` - User-created workout routines
- `gymrats_snapshots` - Scoring history snapshots

**Social:**
- `posts` - Social feed posts
- `post_reactions` - Likes/reactions on posts
- `comments` - Comments on posts
- `friendships` - Friend connections (requester/addressee model)
- `messages` - Direct messages between users
- `blocks` - User blocking

**Gamification:**
- `user_xp` - XP and level tracking
- `user_streaks` - Workout streak tracking
- `user_tokens` - Forge Token balances
- `user_milestones` - Achievement/milestone completion

**Shop & Avatar:**
- `shop_items` - Purchasable items catalog
- `user_inventory` - Owned items
- `user_purchases` - Purchase history / IAP receipts

**Journal:**
- `journal_entries` - Daily training journal entries

### Schema Quality: 7.5/10

**What's Good:**
- RLS enabled on all tables with proper policies
- UUID primary keys everywhere
- Consistent `created_at` / `updated_at` timestamps
- Proper foreign key relationships
- 40+ indexes for query performance
- `updated_at` auto-update triggers on key tables

**Issues Found (by priority):**

**High Priority:**
1. `profiles.username` needs a UNIQUE constraint (currently allows duplicates)
2. `friendships` needs a unique constraint on `(requester_id, addressee_id)` to prevent duplicate requests
3. Several RLS policies use subqueries that could cause recursion under load

**Medium Priority:**
4. `exercise_prs` should have a composite unique constraint on `(user_id, exercise_id, pr_type)`
5. Missing index on `messages(receiver_id, created_at)` for inbox queries
6. `workout_sets.reps` allows NULL but should probably default to 0
7. Some `ON DELETE` behaviors are CASCADE where RESTRICT would be safer

**Low Priority:**
8. `shop_items` has no `category` index (used for filtering)
9. Several tables missing `updated_at` trigger (journal_entries, user_milestones)
10. `blocks` table could benefit from a composite index on `(blocker_id, blocked_id)`

### Applying Fixes

To fix the high-priority issues, run this SQL in Supabase SQL Editor:

d
  ON messages(receiver_id, created_at DESC);
```

---

## Editing Exercise Names

The app uses **1590 exercises** loaded from `src/data/exercises-raw.json`. These come from two sources:

- **873 exercises** from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db) open-source project (IDs like `Barbell_Bench_Press_-_Medium_Grip`)
- **717 exercises** imported from the wger API (IDs prefixed with `wger_`, e.g. `wger_bicep_curl_123`)

### The Problem

Many exercise names are verbose or awkward:
- `Barbell_Bench_Press_-_Medium_Grip` shows as "Barbell Bench Press - Medium Grip"
- `wger_Standing_Alternating_Dumbbell_Biceps_Curl` shows as "Standing Alternating Dumbbell Biceps Curl"
- Some names include unnecessary detail like grip width, stance variation, or redundant qualifiers

### File to Edit

**`src/data/exercises-raw.json`**

This is a JSON array of exercise objects. Each exercise looks like:

```json
{
  "id": "Barbell_Bench_Press_-_Medium_Grip",
  "name": "Barbell Bench Press - Medium Grip",
  "force": "push",
  "level": "intermediate",
  "mechanic": "compound",
  "equipment": "barbell",
  "primaryMuscles": ["chest"],
  "secondaryMuscles": ["shoulders", "triceps"],
  "instructions": ["..."],
  "category": "strength",
  "images": ["..."]
}
```

### How to Rename an Exercise

1. Open `src/data/exercises-raw.json`
2. Search for the exercise by its current name
3. Change only the `"name"` field to your preferred display name
4. **Do NOT change the `"id"` field** — the ID is used as a database key for workout history, routines, and PR tracking

**Example: Shorten a verbose name**

```json
// Before:
{ "id": "Barbell_Bench_Press_-_Medium_Grip", "name": "Barbell Bench Press - Medium Grip", ... }

// After:
{ "id": "Barbell_Bench_Press_-_Medium_Grip", "name": "Bench Press", ... }
```

**Example: Clean up a wger name**

```json
// Before:
{ "id": "wger_standing_alternating_dumbbell_biceps_curl", "name": "Standing Alternating Dumbbell Biceps Curl", ... }

// After:
{ "id": "wger_standing_alternating_dumbbell_biceps_curl", "name": "Alternating DB Curl", ... }
```

### Bulk Rename Tips

- Use your editor's find & replace to batch-rename patterns:
  - Remove `"Barbell "` prefix where the equipment field already says `"barbell"`
  - Remove `" - Medium Grip"` suffixes (most exercises default to medium grip)
  - Shorten `"Dumbbell"` to `"DB"` if you prefer
- After editing, restart the Expo dev server to see changes

### Where Names Appear

Exercise names from this file appear everywhere in the app:
- Live workout exercise picker
- Routine builder add-exercise list
- Workout history details
- Social feed workout posts
- Forge Lab analytics charts

### Important Notes

- **Never change the `id` field** — changing an ID will break all historical data linked to that exercise
- The `id` is never shown to users in the UI (it was previously shown on the routine add-exercise page, but that has been fixed)
- If you delete an exercise entirely, any routines or workout history referencing it will show the raw ID instead of a name
- The 10 "popular" exercises are defined in `src/data/exerciseDatabase.ts` in the `POPULAR_EXERCISE_IDS` set — you can change which exercises appear in the "Popular" section there

---

## Adding Images to PR Celebrations

The PR celebration system is built to support AI-generated images. By default, it uses emoji placeholders, but you can easily swap in custom images.

### File to Edit

`src/lib/celebration/content.ts`

### How It Works

Celebrations are referenced by **content keys** like:
- `weight_tier_1_a` - Weight PR, tier 1, variant A
- `rep_tier_3_c` - Rep PR, tier 3, variant C
- `e1rm_tier_4_e` - e1RM PR, tier 4, variant E

Format: `{prType}_tier_{tier}_{variant}`

### Adding Your Images

**Option 1: Hosted Images (Recommended for AI-generated content)**

```typescript
// In src/lib/celebration/content.ts, update ASSET_REGISTRY:

const ASSET_REGISTRY: Record<string, {
  type: 'image' | 'animation' | 'video' | 'emoji';
  uri: string;
  aspectRatio: number;
}> = {
  // Tier 1 examples
  'weight_tier_1_a': {
    type: 'image',
    uri: 'https://your-cdn.com/celebrations/weight_tier_1_a.png',
    aspectRatio: 1
  },
  'weight_tier_1_b': {
    type: 'image',
    uri: 'https://your-cdn.com/celebrations/weight_tier_1_b.png',
    aspectRatio: 1
  },

  // Tier 2 examples (bigger celebrations)
  'weight_tier_2_a': {
    type: 'animation',  // Lottie or animated GIF
    uri: 'https://your-cdn.com/celebrations/weight_tier_2_a.json',
    aspectRatio: 1
  },

  // Tier 4 examples (massive PRs - go all out)
  'weight_tier_4_a': {
    type: 'video',
    uri: 'https://your-cdn.com/celebrations/weight_tier_4_a.mp4',
    aspectRatio: 16/9
  },

  // ... add entries for all 60 celebrations (3 PR types × 4 tiers × 5 variants)
};
```

**Option 2: Local Assets**

```typescript
// Add images to assets/celebrations/ folder in your project
// Then reference them:

'weight_tier_1_a': {
  type: 'image',
  uri: require('../../assets/celebrations/weight_tier_1_a.png'),
  aspectRatio: 1
},
```

### Content Key Reference

All 60 content keys you need to provide images for:

**Weight PRs:**
```
weight_tier_1_a, weight_tier_1_b, weight_tier_1_c, weight_tier_1_d, weight_tier_1_e
weight_tier_2_a, weight_tier_2_b, weight_tier_2_c, weight_tier_2_d, weight_tier_2_e
weight_tier_3_a, weight_tier_3_b, weight_tier_3_c, weight_tier_3_d, weight_tier_3_e
weight_tier_4_a, weight_tier_4_b, weight_tier_4_c, weight_tier_4_d, weight_tier_4_e
```

**Rep PRs:**
```
rep_tier_1_a, rep_tier_1_b, rep_tier_1_c, rep_tier_1_d, rep_tier_1_e
rep_tier_2_a, rep_tier_2_b, rep_tier_2_c, rep_tier_2_d, rep_tier_2_e
rep_tier_3_a, rep_tier_3_b, rep_tier_3_c, rep_tier_3_d, rep_tier_3_e
rep_tier_4_a, rep_tier_4_b, rep_tier_4_c, rep_tier_4_d, rep_tier_4_e
```

**e1RM PRs:**
```
e1rm_tier_1_a, e1rm_tier_1_b, e1rm_tier_1_c, e1rm_tier_1_d, e1rm_tier_1_e
e1rm_tier_2_a, e1rm_tier_2_b, e1rm_tier_2_c, e1rm_tier_2_d, e1rm_tier_2_e
e1rm_tier_3_a, e1rm_tier_3_b, e1rm_tier_3_c, e1rm_tier_3_d, e1rm_tier_3_e
e1rm_tier_4_a, e1rm_tier_4_b, e1rm_tier_4_c, e1rm_tier_4_d, e1rm_tier_4_e
```

### Enabling the Image Display in UI

Once you've updated `ASSET_REGISTRY`, the images will automatically display. The `PRCelebration.tsx` component already has the code to render them (currently commented out).

To enable image rendering, edit `src/ui/components/LiveWorkout/PRCelebration.tsx`:

```typescript
// Around line 287-296, replace the emoji fallback with:

{asset.type === 'image' ? (
  <Image
    source={{ uri: asset.uri }}
    style={[styles.image, { aspectRatio: asset.aspectRatio }]}
    resizeMode="contain"
  />
) : asset.type === 'emoji' ? (
  <Text style={styles.emoji}>{asset.emoji}</Text>
) : null}
```

### Tier Guidelines for Image Style

| Tier | Delta Range | Vibe | Image Style Suggestion |
|------|-------------|------|------------------------|
| 1 | 0-5 lb | Solid progress | Simple icons, sparkles, subtle effects |
| 2 | 5-10 lb | Nice PR | Confetti, trophies, moderate energy |
| 3 | 10-20 lb | Big achievement | Explosions, beams of light, high energy |
| 4 | 20+ lb | MYTHIC | Full-screen spectacle, particles, legendary imagery |

### Testing

1. Log a set in the live workout screen
2. Beat your previous best by the target delta
3. The celebration modal should appear with your image

---

## Customizing AI Gym Buddy Personalities

The AI Gym Buddy system includes multiple personalities with distinct voices and commentary styles. You can customize or add new personalities by modifying the buddy data.

### Files to Edit

- `src/lib/buddyData.ts` - Personality definitions
- `src/lib/buddyTypes.ts` - Type definitions
- `src/assets/voice/` - Voice line audio files (if adding audio)

### How It Works

Each buddy personality has:
1. **ID and Name** - Unique identifier and display name
2. **Archetype** - Description of their character type
3. **Tier** - Basic (free), Premium (IAP), or Legendary (IAP)
4. **Message Pools** - Collections of messages for different trigger types
5. **Voice Lines** - Optional audio files (Premium/Legendary only)
6. **SFX Pack** - Optional sound effects (Legendary only)

### Creating a New Buddy Personality

1. **Add the new buddy to the `buddies` array in `src/lib/buddyData.ts`:**

```typescript
{
  id: 'your_buddy_id',
  name: 'Your Buddy Name',
  archetype: 'Description of their personality',
  tier: 'basic', // or 'premium' or 'legendary'
  description: 'Detailed description of the buddy',
  previewLines: [
    "Sample line 1",
    "Sample line 2",
    "Sample line 3"
  ],
  unlockMethod: 'free', // or 'iap'
  iapProductId: 'buddy.your_buddy_id.premium', // if premium/legendary
  themeId: 'your_theme_id', // if legendary (theme override)
  messages: {
    // Performance Events
    pr_weight: [
      "Message for weight PRs",
      // ... add 4-5 more messages
    ],
    pr_rep: [
      "Message for rep PRs",
      // ... add 4-5 more messages
    ],
    // ... include all trigger types
    session_start: [],
    session_mid: [],
    final_set: [],
    session_end: [],
    long_rest: [],
    skip: [],
    streak: [],
    return_after_absence: [],
    short_workout: [],
    rank_up: [],
    volume_milestone: [],
    none: []
  },
  voiceLines: { // Optional for premium/legendary
    pr_weight: ['voice-id-1', 'voice-id-2'],
    // ... add voice lines for key triggers
  },
  sfxPack: { // Optional for legendary
    pr_weight: 'sfx_id',
    // ... add sound effects for key triggers
  }
}
```

2. **Add voice lines (if applicable):**
   - Place audio files in `src/assets/voice/`
   - Reference them by filename in the `voiceLines` section

3. **Add sound effects (if applicable):**
   - Place audio files in `src/assets/sfx/`
   - Reference them by filename in the `sfxPack` section

### Message Trigger Types

Each buddy should have messages for all trigger types:
- `pr_weight` - Weight personal records
- `pr_rep` - Rep personal records
- `pr_e1rm` - Estimated 1RM personal records
- `rank_up` - Rank progression achievements
- `volume_milestone` - High-volume workout completion
- `session_start` - Workout beginning
- `session_mid` - Mid-workout check-in
- `session_end` - Workout completion
- `long_rest` - Extended rest periods
- `skip` - Skipping exercises
- `streak` - Streak milestones
- `return_after_absence` - Returning after a break
- `short_workout` - Brief workout sessions

### Testing

1. Select your new buddy in the buddy settings screen
2. Perform actions that trigger different message types
3. Verify the appropriate messages appear

---

## Adding Custom Avatar Art Styles

The avatar system supports multiple art styles that users can choose from. You can add new art styles by creating the artwork and updating the avatar configuration.

### Files to Edit

- `src/lib/avatar/avatarTypes.ts` - Type definitions
- `src/lib/avatar/avatarUtils.ts` - Utility functions
- `src/assets/avatar/` - Artwork assets

### How It Works

Avatar art styles are defined by:
1. **Style ID** - Unique identifier for the style
2. **Name** - Display name for the style
3. **Description** - Brief description of the art style
4. **Asset Files** - Image files for different avatar components
5. **Growth Animation** - How the avatar grows/changes

### Creating a New Avatar Art Style

1. **Add the new style to the art style definitions in `src/lib/avatar/avatarTypes.ts`:**

```typescript
export const AVATAR_ART_STYLES: AvatarArtStyle[] = [
  // ... existing styles
  {
    id: 'your_style_id',
    name: 'Your Style Name',
    description: 'Description of your art style',
    previewImage: require('../../assets/avatar/styles/your_style_preview.png'),
    unlockMethod: 'free', // or 'iap'
    iapProductId: 'avatar.style.your_style_id', // if IAP
  }
];
```

2. **Create the artwork assets:**
   - Create images for each avatar component (body parts, clothing, accessories)
   - Place them in `src/assets/avatar/your_style_id/`
   - Ensure consistent naming and sizing conventions

3. **Update the avatar rendering logic in `src/lib/avatar/avatarUtils.ts`** to handle your new style.

### Art Asset Requirements

For each art style, you'll need:
- Base body components (head, torso, limbs)
- Growth stage variations (small, medium, large)
- Clothing/accessory options
- Preview image for style selection

### Testing

1. Select your new art style in the avatar creation screen
2. Verify all components render correctly
3. Test growth animations and transitions

---

## Configuring Forge Lab Analytics

The Forge Lab analytics dashboard provides premium users with detailed workout analytics. You can customize the data visualization and add new chart types.

### Files to Edit

- `src/lib/forgeLab/types.ts` - Type definitions
- `src/lib/forgeLab/calculator.ts` - Data processing algorithms
- `src/lib/forgeLab/chartUtils.ts` - Chart utility functions
- `src/ui/components/ForgeLab/` - UI components

### How It Works

Forge Lab analytics include:
1. **Data Processing** - Workout data is processed into meaningful metrics
2. **Chart Generation** - Metrics are converted to visual charts
3. **Premium Filtering** - Some features are behind the subscription paywall

### Adding New Chart Types

1. **Add the new chart type to `src/lib/forgeLab/types.ts`:**

```typescript
export type ChartType =
  | 'weight_history'
  | 'strength_curve'
  | 'volume_trend'
  | 'muscle_balance'
  | 'rank_progression'
  | 'your_new_chart'; // Add your chart type
```

2. **Implement data processing in `src/lib/forgeLab/calculator.ts`:**

```typescript
export function calculateYourNewChartData(
  sessions: WorkoutSession[],
  // ... parameters
): YourNewChartDataType {
  // Your data processing logic here
  return processedData;
}
```

3. **Create a new chart component in `src/ui/components/ForgeLab/`:**

```typescript
// YourNewChartCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface YourNewChartCardProps {
  data: YourNewChartDataType;
}

export function YourNewChartCard({ data }: YourNewChartCardProps) {
  return (
    <View>
      <Text>Your New Chart</Text>
      {/* Your chart visualization */}
    </View>
  );
}
```

4. **Add the chart to the main Forge Lab screen in `src/app/forge-lab.tsx`.**

### Premium Feature Implementation

To make features premium-only:
1. Check the user's subscription status using the auth store
2. Show a blur overlay or unlock prompt for premium features
3. Add the feature to the premium features list

### Testing

1. View the Forge Lab dashboard as a free user
2. Verify premium features are properly gated
3. Upgrade to premium and verify all features are accessible
4. Test all chart types with sample data

---

## Instruction Protocol

**For Future Claude Sessions:**

When you build a feature that requires user instructions to use or customize, add those instructions to this file following this format:

```markdown
### [Feature Name]

[Brief description of what the feature does]

**File(s) to Edit:** `path/to/file.ts`

**Instructions:**
[Step-by-step instructions]

**Example:**
[Code example if applicable]
```

Update the Table of Contents at the top of this file to include the new section.
