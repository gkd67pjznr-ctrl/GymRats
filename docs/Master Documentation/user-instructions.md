# Forgerank User Instructions

**This file is the central repository for all instructions on using features and systems built for Forgerank.**

Whenever a new feature is built that requires special usage instructions, those instructions will be added here.

---

## Table of Contents

1. [Supabase Database Migrations](#supabase-database-migrations)
2. [Adding Images to PR Celebrations](#adding-images-to-pr-celebrations)
3. [Customizing AI Gym Buddy Personalities](#customizing-ai-gym-buddy-personalities)
4. [Adding Custom Avatar Art Styles](#adding-custom-avatar-art-styles)
5. [Configuring Forge Lab Analytics](#configuring-forge-lab-analytics)

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