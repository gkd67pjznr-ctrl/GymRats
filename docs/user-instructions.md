# Forgerank User Instructions

**This file is the central repository for all instructions on using features and systems built for Forgerank.**

Whenever a new feature is built that requires special usage instructions, those instructions will be added here.

---

## Table of Contents

1. [Supabase Database Migrations](#supabase-database-migrations)
2. [Adding Images to PR Celebrations](#adding-images-to-pr-celebrations)

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
