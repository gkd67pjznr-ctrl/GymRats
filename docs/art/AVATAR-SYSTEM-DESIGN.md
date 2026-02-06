# Avatar System Design

> Comprehensive design specification for GymRats avatar customization system.
>
> **Last Updated:** 2026-02-06
> **Version:** 1.0
> **Status:** Design Complete, Ready for Implementation

---

## Overview

### System Philosophy

The avatar system is a major engagement feature where users create and grow their fitness character over time. Unlike static profile pictures, avatars in GymRats are **living representations** of the user's fitness journey.

**Core Principles:**
1. **Emotional Investment**: Users should feel attached to their avatar
2. **Visual Progression**: Avatar should visibly "grow" with the user's fitness level
3. **Infinite Expandability**: Architecture supports unlimited future items
4. **Theme Integration**: Avatars work seamlessly with any equipped theme
5. **Performance First**: Lazy loading, efficient compositing, minimal memory footprint

### User Journey

```
1. CREATE   → First-time setup during onboarding (select base body, face, skin, starter outfit)
2. DISPLAY  → Avatar appears on profile, social feed posts, workout summaries
3. GROW     → Avatar appearance evolves as user levels up (5 growth stages)
4. UNLOCK   → Clothing/accessories unlocked through achievements, levels, or purchase
5. HANGOUT  → Future: Avatar in customizable room with trophies and equipment
```

### Monetization Strategy

**No Pay-to-Win**: All cosmetics are optional and aesthetic-only.

| Tier | Access | Items |
|------|--------|-------|
| **Free** | All users | Base bodies, skin tones, starter outfits, basic accessories |
| **Premium** | IAP subscription | Premium hairstyles, branded gym wear, animated effects |
| **Legendary** | IAP subscription | Legendary auras, mythic accessories, full transformation sets |
| **Forge Tokens** | Earned currency | Most items purchasable with in-game currency |

---

## Layer Architecture

### Layer Stack (Bottom to Top)

The avatar is composed of 10 layers rendered in order. Each layer is a separate PNG with transparency.

| Layer | Z-Index | Required | Description | File Prefix |
|-------|---------|----------|-------------|-------------|
| 1. Base Body | 0 | Yes | Body shape/silhouette | `body_` |
| 2. Skin Tone | 1 | Yes | Skin color overlay | `skin_` |
| 3. Face | 2 | Yes | Facial features and expression | `face_` |
| 4. Hair | 3 | No | Hairstyle (can be bald) | `hair_` |
| 5. Outfit Base | 4 | Yes | Tank top, t-shirt, sports bra | `top_` |
| 6. Outfit Bottom | 5 | Yes | Shorts, leggings, joggers | `bottom_` |
| 7. Footwear | 6 | Yes | Sneakers, lifting shoes | `foot_` |
| 8. Accessories | 7 | No | Headbands, wristbands, belts | `acc_` |
| 9. Equipment | 8 | No | Dumbbells, kettlebells (pose-specific) | `equip_` |
| 10. Effects | 9 | No | Auras, sparkles (high ranks only) | `fx_` |

### Image Specifications

```typescript
interface AvatarLayerSpec {
  dimensions: { width: 512, height: 512 };
  format: 'PNG';
  colorSpace: 'sRGB';
  bitDepth: 32; // RGBA
  anchorPoint: { x: 256, y: 480 }; // Bottom-center of character
  padding: 32; // Minimum edge padding in pixels
  background: 'transparent';
}
```

### Anchor Point System

All layers share a common anchor point for perfect alignment:

```
                    512px
    +-----------------------------------+
    |                                   |
    |   [32px padding on all sides]    |
    |                                   |
    |         +-------------+           |
    |         |   AVATAR    |           |
    |         |   CONTENT   |           |
    |         |     AREA    |           | 512px
    |         |             |           |
    |         |             |           |
    |         +------X------+           |
    |              (anchor)             |
    +-----------------------------------+
                256, 480
```

**Anchor Point**: `(256, 480)` - Bottom-center of the character's feet

### File Naming Convention

```
{layer}_{item}_{variant}_{stage}.png
```

**Examples:**
- `body_athletic_male_stage3.png`
- `skin_tone4.png`
- `face_determined_default.png`
- `hair_short_curly_brown.png`
- `top_tanktop_black_stage2.png`
- `bottom_shorts_gray.png`
- `foot_sneakers_white.png`
- `acc_headband_neon.png`
- `equip_dumbbells_heavy.png`
- `fx_aura_diamond.png`

---

## Growth Stages

The avatar visually progresses through 5 stages based on user level. Each stage unlocks new content and features subtle physique changes.

### Stage Definitions

| Stage | Level Range | Visual Changes | Unlocks |
|-------|-------------|----------------|---------|
| **1: Beginner** | 1-10 | Neutral posture, slightly nervous expression available | Basic gym clothes, starter accessories |
| **2: Getting Fit** | 11-25 | More confident stance, slightly more defined silhouette | Better gym wear, confidence expressions |
| **3: Intermediate** | 26-50 | Athletic build visible, power poses available | Premium accessories, determined expressions |
| **4: Advanced** | 51-75 | Clearly fit appearance, dynamic poses | Competition wear, intense expressions |
| **5: Elite** | 76-100 | Peak physique silhouette, legendary auras available | Champion accessories, mythic effects |

### Stage Transition Assets

Each body type requires 5 stage variants:
- `body_{type}_stage1.png` through `body_{type}_stage5.png`

**Physique Progression:**
- Stage 1: Normal, relaxed posture
- Stage 2: Slightly improved posture, hint of muscle definition
- Stage 3: Noticeable athletic build, confident stance
- Stage 4: Well-defined muscles, powerful presence
- Stage 5: Peak physique, hero pose option

### Expression Unlocks by Stage

| Stage | Available Expressions |
|-------|----------------------|
| 1 | neutral, happy, nervous, tired |
| 2 | + determined, focused |
| 3 | + confident, intense |
| 4 | + powerful, fierce |
| 5 | + legendary, transcendent |

---

## MVP Asset List

### Scope Summary

| Category | Count | Priority |
|----------|-------|----------|
| Base Bodies | 4 | P0 |
| Skin Tones | 6 | P0 |
| Faces | 8 | P0 |
| Hair Styles | 12 | P0 |
| Tops | 10 | P0 |
| Bottoms | 8 | P0 |
| Footwear | 4 | P0 |
| Accessories | 6 | P1 |
| **Total Unique Items** | **58** | |
| **Total with Variants** | **~150-200** | |

### Base Bodies (4 items)

| ID | Name | Type | Stage Variants | Priority |
|----|------|------|----------------|----------|
| `body_athletic_male` | Athletic Male | Masculine | 5 | P0 |
| `body_average_male` | Average Male | Masculine | 5 | P0 |
| `body_athletic_female` | Athletic Female | Feminine | 5 | P0 |
| `body_average_female` | Average Female | Feminine | 5 | P0 |

**Total body PNGs: 20** (4 bodies x 5 stages)

### Skin Tones (6 items)

| ID | Name | Hex Base | Priority |
|----|------|----------|----------|
| `skin_tone1` | Porcelain | #FFE0BD | P0 |
| `skin_tone2` | Warm Ivory | #F5D0A9 | P0 |
| `skin_tone3` | Sand | #D4A76A | P0 |
| `skin_tone4` | Warm Brown | #A67B5B | P0 |
| `skin_tone5` | Deep Brown | #6B4423 | P0 |
| `skin_tone6` | Ebony | #3D2314 | P0 |

**Total skin PNGs: 6**

### Faces (8 expressions)

| ID | Name | Stage Unlock | Priority |
|----|------|--------------|----------|
| `face_neutral` | Neutral | 1 | P0 |
| `face_happy` | Happy | 1 | P0 |
| `face_nervous` | Nervous | 1 | P0 |
| `face_tired` | Tired | 1 | P0 |
| `face_determined` | Determined | 2 | P0 |
| `face_focused` | Focused | 2 | P0 |
| `face_confident` | Confident | 3 | P0 |
| `face_intense` | Intense | 3 | P0 |

**Total face PNGs: 8**

### Hair Styles (12 items)

| ID | Name | Type | Color Variants | Priority |
|----|------|------|----------------|----------|
| `hair_short_straight` | Short Straight | Neutral | 6 | P0 |
| `hair_short_curly` | Short Curly | Neutral | 6 | P0 |
| `hair_medium_wavy` | Medium Wavy | Neutral | 6 | P0 |
| `hair_long_straight` | Long Straight | Neutral | 6 | P0 |
| `hair_ponytail` | Ponytail | Neutral | 6 | P0 |
| `hair_bun` | Bun | Neutral | 6 | P0 |
| `hair_buzz` | Buzz Cut | Neutral | 6 | P0 |
| `hair_fade` | Fade | Neutral | 6 | P0 |
| `hair_braids` | Braids | Neutral | 6 | P0 |
| `hair_afro` | Afro | Neutral | 6 | P0 |
| `hair_undercut` | Undercut | Neutral | 6 | P0 |
| `hair_bald` | Bald | - | 0 | P0 |

**Hair Colors:** black, brown, blonde, red, gray, theme_accent

**Total hair PNGs: 67** (11 styles x 6 colors + 1 bald)

### Tops (10 items)

| ID | Name | Stage Unlock | Color Variants | Priority |
|----|------|--------------|----------------|----------|
| `top_tanktop` | Tank Top | 1 | 4 | P0 |
| `top_tshirt` | T-Shirt | 1 | 4 | P0 |
| `top_sportsbra` | Sports Bra | 1 | 4 | P0 |
| `top_hoodie` | Hoodie | 1 | 4 | P0 |
| `top_stringer` | Stringer | 2 | 4 | P0 |
| `top_longsleeve` | Long Sleeve | 2 | 4 | P0 |
| `top_compression` | Compression Shirt | 3 | 4 | P0 |
| `top_cropped` | Cropped Top | 3 | 4 | P0 |
| `top_sleeveless_hoodie` | Sleeveless Hoodie | 4 | 4 | P1 |
| `top_competition` | Competition Singlet | 5 | 4 | P1 |

**Top Colors:** black, white, gray, theme_accent

**Total top PNGs: 40** (10 tops x 4 colors)

### Bottoms (8 items)

| ID | Name | Stage Unlock | Color Variants | Priority |
|----|------|--------------|----------------|----------|
| `bottom_shorts` | Gym Shorts | 1 | 4 | P0 |
| `bottom_joggers` | Joggers | 1 | 4 | P0 |
| `bottom_leggings` | Leggings | 1 | 4 | P0 |
| `bottom_sweatpants` | Sweatpants | 1 | 4 | P0 |
| `bottom_compression` | Compression Shorts | 2 | 4 | P0 |
| `bottom_cargo` | Cargo Shorts | 2 | 4 | P0 |
| `bottom_biker` | Biker Shorts | 3 | 4 | P0 |
| `bottom_competition` | Competition Shorts | 5 | 4 | P1 |

**Bottom Colors:** black, white, gray, theme_accent

**Total bottom PNGs: 32** (8 bottoms x 4 colors)

### Footwear (4 items)

| ID | Name | Stage Unlock | Color Variants | Priority |
|----|------|--------------|----------------|----------|
| `foot_sneakers` | Sneakers | 1 | 3 | P0 |
| `foot_trainers` | Training Shoes | 1 | 3 | P0 |
| `foot_lifting` | Lifting Shoes | 3 | 3 | P0 |
| `foot_barefoot` | Barefoot | 1 | 0 | P0 |

**Footwear Colors:** white, black, theme_accent

**Total footwear PNGs: 10** (3 shoes x 3 colors + 1 barefoot)

### Accessories (6 items)

| ID | Name | Stage Unlock | Unlock Condition | Priority |
|----|------|--------------|------------------|----------|
| `acc_headband` | Headband | 1 | Free | P1 |
| `acc_wristbands` | Wristbands | 1 | Free | P1 |
| `acc_belt` | Lifting Belt | 3 | Level 30 | P1 |
| `acc_cap` | Baseball Cap | 2 | 7-day streak | P1 |
| `acc_straps` | Lifting Straps | 4 | First weight PR | P1 |
| `acc_kneesleeves` | Knee Sleeves | 3 | 100 squats logged | P1 |

**Total accessory PNGs: 12** (6 items x ~2 variants average)

---

## Color/Theme Integration

### Theme-Reactive Colors

Certain items use `theme_accent` as a color variant, which dynamically matches the user's equipped theme.

```typescript
interface ThemeReactiveColor {
  type: 'theme_accent' | 'static';
  fallback: string; // Hex color if theme not available
}

// Example: Toxic Energy theme
const toxicAccent = '#ADFF2F'; // Lime

// Avatar items with theme_accent will render in this color
```

### Theme Color Mapping

| Theme | Accent Color | Usage in Avatars |
|-------|-------------|------------------|
| Toxic Energy | `#ADFF2F` (Lime) | Accent hair, outfit trim, effects |
| Iron Forge | `#FF6B35` (Orange) | Accent hair, outfit trim, effects |
| Neon Glow | `#FF00FF` (Magenta) | Accent hair, outfit trim, effects |
| Infernal Cosmos | `#FF2D2D` (Red) | Accent hair, outfit trim, effects |

### Effect Layer Theming

Effect layers (auras, particles) inherit theme colors automatically:

| Effect | Theme Property | Description |
|--------|---------------|-------------|
| `fx_aura_rank` | Rank color | Matches user's highest rank |
| `fx_particles` | Theme accent | Sparkles in theme color |
| `fx_glow` | Theme accent | Soft glow behind avatar |

---

## Monetization Items

### Premium Items (Subscription)

Items only accessible with Premium or Legendary subscription:

| Category | Items | Description |
|----------|-------|-------------|
| Hair | 6 premium styles | Unique cuts, animated movement |
| Tops | 4 branded items | "GymRats" logo wear |
| Effects | 3 particle effects | Sparkles, energy, pulse |
| Accessories | 4 premium items | Gold accents, special materials |

### Legendary Items (Subscription)

Items only accessible with Legendary subscription:

| Category | Items | Description |
|----------|-------|-------------|
| Effects | 5 auras | Rank-specific legendary auras |
| Sets | 3 complete sets | Full transformation outfits |
| Accessories | 3 mythic items | Crown, wings, halo |

### Forge Token Purchases

Most items purchasable with earned Forge Tokens:

| Category | Token Cost Range |
|----------|------------------|
| Basic hair colors | 50-100 FT |
| Basic outfits | 100-200 FT |
| Premium outfits | 300-500 FT |
| Accessories | 150-400 FT |
| Basic effects | 500-1000 FT |

### Achievement Unlocks

Some items unlocked through gameplay achievements:

| Item | Achievement | Rarity |
|------|-------------|--------|
| Champion Belt | 1000 sets logged | Rare |
| PR Crown | 50 PRs achieved | Epic |
| Diamond Aura | Reach Diamond rank | Epic |
| Mythic Wings | Reach Mythic rank | Legendary |
| Streaker Headband | 100-day streak | Rare |
| Iron Warrior Set | Log 10,000 kg volume | Epic |

---

## Hangout Room (Future Feature)

### Architecture Notes

The Hangout Room is a future feature where the user's avatar exists in a customizable space. This section documents the architecture for later implementation.

### Room Structure

```typescript
interface HangoutRoom {
  id: string;
  userId: string;
  background: RoomBackground;
  furniture: FurnitureItem[];
  trophies: Trophy[];
  equipment: GymEquipment[];
  visitors: VisitorAvatar[]; // Friends viewing room
  lighting: LightingConfig;
}

interface FurnitureItem {
  id: string;
  type: 'bench' | 'rack' | 'mirror' | 'plant' | 'decoration';
  position: { x: number; y: number; z: number };
  rotation: number;
  variant: string;
}

interface Trophy {
  id: string;
  achievementId: string;
  position: { x: number; y: number; z: number };
  displayStyle: 'shelf' | 'wall' | 'floor';
}
```

### Room Backgrounds

| Background | Theme | Unlock |
|------------|-------|--------|
| Basic Gym | Neutral | Free |
| Home Gym | Cozy | Level 10 |
| Pro Gym | Industrial | Level 30 |
| Champion Arena | Epic | Level 50 |
| Legendary Hall | Mythic | Level 75 |

### Social Features

- **Visiting**: Friends can visit each other's rooms
- **Guest Book**: Leave reactions and messages
- **Photo Mode**: Screenshot avatar in room with effects
- **Room Rankings**: Weekly featured rooms based on creativity

### Decoration Categories

| Category | Example Items |
|----------|---------------|
| Equipment | Dumbbells, barbells, kettlebells, machines |
| Trophies | Achievement displays, rank badges |
| Furniture | Benches, racks, mirrors |
| Plants | Succulents, gym plants |
| Posters | Motivational quotes, PR records |
| Lighting | Neon signs, spotlights |

---

## Implementation Notes

### TypeScript Interfaces

```typescript
// Core avatar types
interface UserAvatar {
  id: string;
  userId: string;
  body: BodyConfig;
  skin: SkinConfig;
  face: FaceConfig;
  hair: HairConfig | null;
  outfit: OutfitConfig;
  footwear: FootwearConfig;
  accessories: AccessoryConfig[];
  effects: EffectConfig[];
  stage: GrowthStage; // 1-5, derived from user level
  createdAt: number;
  updatedAt: number;
}

interface BodyConfig {
  type: 'athletic_male' | 'average_male' | 'athletic_female' | 'average_female';
}

interface SkinConfig {
  tone: 1 | 2 | 3 | 4 | 5 | 6;
}

interface FaceConfig {
  expression: AvatarExpression;
}

interface HairConfig {
  style: string; // e.g., 'short_straight', 'ponytail'
  color: string; // 'black', 'brown', 'blonde', 'red', 'gray', 'theme_accent'
}

interface OutfitConfig {
  top: { item: string; color: string };
  bottom: { item: string; color: string };
}

interface FootwearConfig {
  item: string;
  color: string;
}

interface AccessoryConfig {
  slot: 'head' | 'wrist' | 'waist' | 'hands' | 'knees';
  item: string;
}

interface EffectConfig {
  type: 'aura' | 'particles' | 'glow';
  variant: string;
  intensity: 'low' | 'medium' | 'high';
}

type GrowthStage = 1 | 2 | 3 | 4 | 5;

type AvatarExpression =
  | 'neutral' | 'happy' | 'nervous' | 'tired'
  | 'determined' | 'focused'
  | 'confident' | 'intense'
  | 'powerful' | 'fierce'
  | 'legendary' | 'transcendent';
```

### Asset Loading Strategy

```typescript
// Lazy loading with caching
class AvatarAssetLoader {
  private cache: Map<string, ImageBitmap> = new Map();
  private loadingPromises: Map<string, Promise<ImageBitmap>> = new Map();

  async loadLayer(layerPath: string): Promise<ImageBitmap> {
    // Return cached if available
    if (this.cache.has(layerPath)) {
      return this.cache.get(layerPath)!;
    }

    // Wait for existing load if in progress
    if (this.loadingPromises.has(layerPath)) {
      return this.loadingPromises.get(layerPath)!;
    }

    // Start new load
    const loadPromise = this.loadImage(layerPath);
    this.loadingPromises.set(layerPath, loadPromise);

    const image = await loadPromise;
    this.cache.set(layerPath, image);
    this.loadingPromises.delete(layerPath);

    return image;
  }

  async compositeAvatar(config: UserAvatar, theme: ThemeConfig): Promise<ImageData> {
    const layers = await Promise.all([
      this.loadLayer(`body_${config.body.type}_stage${config.stage}`),
      this.loadLayer(`skin_tone${config.skin.tone}`),
      this.loadLayer(`face_${config.face.expression}`),
      config.hair ? this.loadLayer(`hair_${config.hair.style}_${config.hair.color}`) : null,
      this.loadLayer(`top_${config.outfit.top.item}_${config.outfit.top.color}`),
      this.loadLayer(`bottom_${config.outfit.bottom.item}_${config.outfit.bottom.color}`),
      this.loadLayer(`foot_${config.footwear.item}_${config.footwear.color}`),
      ...config.accessories.map(acc => this.loadLayer(`acc_${acc.item}`)),
      ...config.effects.map(fx => this.loadLayer(`fx_${fx.type}_${fx.variant}`)),
    ].filter(Boolean));

    return this.composite(layers, theme);
  }
}
```

### Database Schema

```sql
-- Avatar configuration
CREATE TABLE user_avatars (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  body_type VARCHAR(50) NOT NULL,
  skin_tone SMALLINT NOT NULL CHECK (skin_tone BETWEEN 1 AND 6),
  face_expression VARCHAR(50) NOT NULL,
  hair_style VARCHAR(50),
  hair_color VARCHAR(50),
  top_item VARCHAR(50) NOT NULL,
  top_color VARCHAR(50) NOT NULL,
  bottom_item VARCHAR(50) NOT NULL,
  bottom_color VARCHAR(50) NOT NULL,
  footwear_item VARCHAR(50) NOT NULL,
  footwear_color VARCHAR(50) NOT NULL,
  accessories JSONB DEFAULT '[]',
  effects JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unlocked avatar items
CREATE TABLE user_avatar_items (
  user_id UUID REFERENCES users(id),
  item_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_source VARCHAR(50) NOT NULL, -- 'free', 'purchase', 'achievement', 'level'
  PRIMARY KEY (user_id, item_id)
);

-- Avatar item catalog
CREATE TABLE avatar_items (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'body', 'skin', 'face', 'hair', 'top', 'bottom', 'foot', 'accessory', 'effect'
  layer INTEGER NOT NULL,
  stage_unlock SMALLINT DEFAULT 1,
  is_premium BOOLEAN DEFAULT FALSE,
  is_legendary BOOLEAN DEFAULT FALSE,
  forge_token_cost INTEGER,
  achievement_unlock VARCHAR(100),
  asset_path VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}'
);
```

### Performance Targets

| Metric | Target |
|--------|--------|
| Initial avatar load | < 500ms |
| Layer swap | < 100ms |
| Composite render | < 50ms |
| Memory per avatar | < 5MB |
| Cache size limit | 50MB |

### Accessibility Considerations

1. **Color contrast**: Ensure avatar is visible on all backgrounds
2. **Motion reduction**: Disable animated effects for users who prefer reduced motion
3. **Alt text**: Generate descriptive text for screen readers
4. **Keyboard navigation**: Avatar editor fully navigable via keyboard

---

## Generation Queue

See `docs/art/generation/avatar-prompts.csv` for the complete list of AI generation prompts.

### Priority Order

1. **P0 (MVP Launch)**
   - All base bodies (20 PNGs)
   - All skin tones (6 PNGs)
   - All faces (8 PNGs)
   - Hair styles (67 PNGs)
   - Basic outfits (72 PNGs)
   - Footwear (10 PNGs)

2. **P1 (Post-Launch)**
   - Accessories (12 PNGs)
   - Premium items
   - Effects

### Batch Strategy

Generate in this order for consistency:
1. All body types (same session for consistent proportions)
2. All faces (same session for consistent features)
3. Hair by style, then by color
4. Outfits by category, then by color
5. Footwear together
6. Accessories by slot

---

## Related Documentation

- [Asset Specs](./generation/avatar-asset-specs.md) - Technical generation specifications
- [Avatar Prompts](./generation/avatar-prompts.csv) - AI generation prompts
- [Premium Content System](./implementation/premium-content-system.md) - IAP integration
- [Visual Style Guide](./style-guide.md) - Overall visual direction
- [Gamification Feature](../features/gamification/feature-gamification.md) - XP and levels

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-06 | Initial design document |
