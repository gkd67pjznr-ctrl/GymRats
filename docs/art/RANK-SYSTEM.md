# GymRats Rank System

> **THE source of truth** for the GymRats ranking system.
>
> **Last Updated:** 2026-02-07
> **Version:** 2.0
> **Total Ranks:** 28

---

## Quick Reference

| Tier | Rank Name | Levels | Total Ranks | Color | Status |
|------|-----------|--------|-------------|-------|--------|
| 1 | Copper | I, II, III | 3 | `#B87333` | Defined |
| 2 | Bronze | I, II, III | 3 | `#CD7F32` | Defined |
| 3 | Iron | I, II, III | 3 | `#6B6B6B` | Defined |
| 4 | Silver | I, II, III | 3 | `#C0C0C0` | Defined |
| 5 | Gold | I, II, III | 3 | `#FFD700` | Defined |
| 6 | Master | I, II, III | 3 | `#FFF8DC` | Defined |
| 7 | Legendary | I, II, III | 3 | `#9B30FF` | Defined |
| 8 | Mythic | I, II, III | 3 | `#00CED1` | Defined |
| 9 | Supreme Being | I, II, III | 3 | TBD | Pending |
| 10 | G.O.A.T | (none) | 1 | TBD | Pending |
| | | **TOTAL** | **28** | | |

---

## Complete Rank List

### Tier 1: Copper (Beginner)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| copper_1 | Copper I | 0-59 | `#B87333` |
| copper_2 | Copper II | 60-119 | `#B87333` |
| copper_3 | Copper III | 120-179 | `#B87333` |

### Tier 2: Bronze (Novice)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| bronze_1 | Bronze I | 180-239 | `#CD7F32` |
| bronze_2 | Bronze II | 240-299 | `#CD7F32` |
| bronze_3 | Bronze III | 300-359 | `#CD7F32` |

### Tier 3: Iron (Intermediate)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| iron_1 | Iron I | 360-419 | `#6B6B6B` |
| iron_2 | Iron II | 420-479 | `#6B6B6B` |
| iron_3 | Iron III | 480-539 | `#6B6B6B` |

### Tier 4: Silver (Advanced)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| silver_1 | Silver I | 540-599 | `#C0C0C0` |
| silver_2 | Silver II | 600-659 | `#C0C0C0` |
| silver_3 | Silver III | 660-719 | `#C0C0C0` |

### Tier 5: Gold (Expert)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| gold_1 | Gold I | 720-779 | `#FFD700` |
| gold_2 | Gold II | 780-839 | `#FFD700` |
| gold_3 | Gold III | 840-899 | `#FFD700` |

### Tier 6: Master (Elite)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| master_1 | Master I | 900-929 | `#FFF8DC` (bright white-gold) |
| master_2 | Master II | 930-959 | `#FFF8DC` |
| master_3 | Master III | 960-979 | `#FFF8DC` |

### Tier 7: Legendary (Exceptional)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| legendary_1 | Legendary I | 980-989 | `#9B30FF` (royal purple) |
| legendary_2 | Legendary II | 990-994 | `#9B30FF` |
| legendary_3 | Legendary III | 995-997 | `#9B30FF` |

### Tier 8: Mythic (Transcendent)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| mythic_1 | Mythic I | 998-998.5 | `#00CED1` (ethereal cyan) |
| mythic_2 | Mythic II | 998.5-999 | `#00CED1` |
| mythic_3 | Mythic III | 999-999.5 | `#00CED1` |

### Tier 9: Supreme Being (Godlike)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| supreme_1 | Supreme Being I | 999.5-999.7 | TBD |
| supreme_2 | Supreme Being II | 999.7-999.9 | TBD |
| supreme_3 | Supreme Being III | 999.9-999.99 | TBD |

### Tier 10: G.O.A.T (Greatest Of All Time)

| Rank | Display | Score Range | Color |
|------|---------|-------------|-------|
| goat | G.O.A.T | 999.99+ | TBD |

---

## Display Formatting

### Naming Convention

- **Internal ID:** `{rank}_{level}` (e.g., `copper_1`, `gold_3`, `goat`)
- **Display Name:** `{Rank} {Roman Numeral}` (e.g., "Copper I", "Gold III")
- **G.O.A.T Exception:** Display as "G.O.A.T" (no level suffix)

### Roman Numeral Mapping

| Level | Roman | Display |
|-------|-------|---------|
| 1 | I | "Bronze I" |
| 2 | II | "Bronze II" |
| 3 | III | "Bronze III" |

---

## Visual Design Specifications

### Universal Elements (All Ranks)

1. **Square Inlay Text Box**
   - Position: Bottom center of badge
   - Shape: Small square/rectangle
   - Content: Rank display name (e.g., "Gold II")
   - Background: Slightly darker than border color
   - Text: White or contrasting color
   - Size: ~30% of badge width

2. **Border Shape Progression**
   - Copper → Gold: Circular borders
   - Master → G.O.A.T: Unique shapes (see tier-specific details)

3. **Level Enhancement (I → II → III)**
   - **Level I:** Default/base border design
   - **Level II:** Added decorative elements (subtle lines, small accents)
   - **Level III:** Maximum ornamentation for that tier (flourishes, glow effects)

---

## Tier-Specific Visual Elements

### Copper (Tier 1)
- **Border Style:** Simple circular ring
- **Color:** `#B87333` warm copper
- **Texture:** Dull, slightly oxidized metal
- **Elements:** Plain, minimal decoration
- **Level Progression:**
  - I: Plain ring
  - II: Subtle inner line
  - III: Double ring with tiny notches

### Bronze (Tier 2)
- **Border Style:** Circular ring
- **Color:** `#CD7F32` classic bronze
- **Texture:** Slightly polished metal
- **Elements:** Basic geometric patterns
- **Level Progression:**
  - I: Simple polished ring
  - II: Added small dots/rivets around edge
  - III: Decorative notches, more refined finish

### Iron (Tier 3)
- **Border Style:** Circular ring
- **Color:** `#6B6B6B` dark steel gray
- **Texture:** Industrial, forged metal
- **Elements:** Rivets, bolts, industrial aesthetic
- **Level Progression:**
  - I: Plain forged ring
  - II: Visible rivets around edge
  - III: Heavy industrial with gear-like elements

### Silver (Tier 4)
- **Border Style:** Circular ring
- **Color:** `#C0C0C0` clean silver
- **Texture:** Polished, reflective
- **Elements:** Refined, elegant details
- **Level Progression:**
  - I: Clean polished ring
  - II: Subtle engraved lines
  - III: Ornate engravings, slight shine effect

### Gold (Tier 5)
- **Border Style:** Circular ring
- **Color:** `#FFD700` rich gold
- **Texture:** Lustrous, warm glow
- **Elements:** Decorative flourishes, premium feel
- **Level Progression:**
  - I: Polished gold ring
  - II: Added laurel or vine accents
  - III: Full ornate design with flourishes

### Master (Tier 6)
- **Border Style:** Circular with pointed spikes
- **Color:** `#FFF8DC` bright white-gold (cornsilk/cream-gold)
- **Texture:** Radiant, almost glowing
- **Elements:**
  - Small points/spikes extending outward all around the circle
  - Whitish-yellow-gold glow emanating from behind
  - Premium, elite aesthetic
- **Glow:** Soft outer glow in `#FFFACD` (lemon chiffon)
- **Level Progression:**
  - I: Basic spiked border with subtle glow
  - II: More defined spikes, stronger glow
  - III: Maximum spikes, intense radiant glow

### Legendary (Tier 7)
- **Border Style:** TBD (unique shape)
- **Color:** `#9B30FF` royal purple
- **Texture:** Mystical, ethereal
- **Elements:**
  - Glowing edges
  - Magical aura effect
  - Possible gem inlays
- **Level Progression:**
  - I: Base legendary design
  - II: Enhanced glow effects
  - III: Full mystical aura

### Mythic (Tier 8)
- **Border Style:** TBD (unique shape)
- **Color:** `#00CED1` ethereal cyan/turquoise
- **Texture:** Otherworldly, translucent feel
- **Elements:**
  - Floating particles
  - Energy wisps
  - Transcendent aesthetic
- **Level Progression:**
  - I: Base mythic design
  - II: Visible energy particles
  - III: Full particle aura

### Supreme Being (Tier 9)
- **Border Style:** TBD
- **Color:** TBD (considering cosmic fire/orange `#FF4500`)
- **Texture:** TBD
- **Elements:** TBD
  - Concepts: Celestial, cosmic, divine
  - Radiating energy
- **Level Progression:** TBD

### G.O.A.T (Tier 10)
- **Border Style:** TBD
- **Color:** TBD (considering prismatic/rainbow or pure white)
- **Texture:** TBD
- **Elements:** TBD
  - Concepts: Transcendent, ultimate achievement
  - Possible animated shimmer
  - May incorporate literal goat imagery (fun/meme element)
- **No Levels:** Single ultimate rank

---

## Asset Requirements

### Badge Assets Needed

| Tier | Rank | Variants (I/II/III) | Total Assets |
|------|------|---------------------|--------------|
| 1 | Copper | 3 | 3 |
| 2 | Bronze | 3 | 3 |
| 3 | Iron | 3 | 3 |
| 4 | Silver | 3 | 3 |
| 5 | Gold | 3 | 3 |
| 6 | Master | 3 | 3 |
| 7 | Legendary | 3 | 3 |
| 8 | Mythic | 3 | 3 |
| 9 | Supreme Being | 3 | 3 |
| 10 | G.O.A.T | 1 | 1 |
| | **TOTAL** | | **28** |

### Asset Specifications

- **Format:** PNG
- **Size:** 512x512 base (scales down for display)
- **Background:** Transparent
- **Style:** Clean vector, brushed metal texture, flat lighting
- **Icon:** Stylized flexed arm holding dumbbell (2 plates per side)
- **Prompts:** See `docs/art/generation/RANK-BADGE-PROMPTS.md`

### File Naming Convention

```
rank-badge-{tier}-{level}.png
```

Examples:
- `rank-badge-copper-1.png`
- `rank-badge-gold-3.png`
- `rank-badge-master-2.png`
- `rank-badge-goat.png`

### Output Directory

```
assets/ui/badges/rank/
├── rank-badge-copper-1.png  ✅
├── rank-badge-copper-2.png  ✅
├── rank-badge-copper-3.png  ✅
├── rank-badge-bronze-1.png  ✅
├── rank-badge-bronze-2.png  ✅
├── rank-badge-bronze-3.png  ✅
├── rank-badge-iron-1.png    ✅
├── rank-badge-iron-2.png    ✅
├── rank-badge-iron-3.png    ✅
├── rank-badge-silver-1.png
├── ... (28 total files)
└── rank-badge-goat.png
```

---

## Color Reference

### Defined Colors

| Rank | Primary | Glow/Accent | Status |
|------|---------|-------------|--------|
| Copper | `#B87333` | `#8B5A2B` (darker) | Defined |
| Bronze | `#CD7F32` | `#A0522D` (darker) | Defined |
| Iron | `#6B6B6B` | `#4A4A4A` (darker) | Defined |
| Silver | `#C0C0C0` | `#A8A8A8` (darker) | Defined |
| Gold | `#FFD700` | `#DAA520` (darker) | Defined |
| Master | `#FFF8DC` | `#FFFACD` (glow) | Defined |
| Legendary | `#9B30FF` | `#7B68EE` (glow) | Defined |
| Mythic | `#00CED1` | `#20B2AA` (glow) | Defined |
| Supreme Being | TBD | TBD | Pending |
| G.O.A.T | TBD | TBD | Pending |

---

## Score Thresholds

The scoring algorithm maps player performance (0-1000 scale) to ranks:

| Score Range | Rank |
|-------------|------|
| 0-59 | Copper I |
| 60-119 | Copper II |
| 120-179 | Copper III |
| 180-239 | Bronze I |
| 240-299 | Bronze II |
| 300-359 | Bronze III |
| 360-419 | Iron I |
| 420-479 | Iron II |
| 480-539 | Iron III |
| 540-599 | Silver I |
| 600-659 | Silver II |
| 660-719 | Silver III |
| 720-779 | Gold I |
| 780-839 | Gold II |
| 840-899 | Gold III |
| 900-929 | Master I |
| 930-959 | Master II |
| 960-979 | Master III |
| 980-989 | Legendary I |
| 990-994 | Legendary II |
| 995-997 | Legendary III |
| 998-998.5 | Mythic I |
| 998.5-999 | Mythic II |
| 999-999.5 | Mythic III |
| 999.5-999.7 | Supreme Being I |
| 999.7-999.9 | Supreme Being II |
| 999.9-999.99 | Supreme Being III |
| 999.99+ | G.O.A.T |

**Note:** Higher tiers have progressively smaller score windows, making advancement exponentially harder.

---

## Migration Notes

### Changes from v1.0 (7-tier system)

| Old Rank | New Equivalent |
|----------|----------------|
| Iron | Copper I-III |
| Bronze | Bronze I-III |
| Silver | Silver I-III |
| Gold | Gold I-III |
| Platinum | Master I-III |
| Diamond | Legendary I-III |
| Mythic | Mythic I-III |

### New Additions
- **Copper:** New entry-level tier (previously "Iron" was lowest)
- **Iron:** Moved up to Tier 3
- **Master:** Replaces Platinum with unique visual style
- **Legendary:** Replaces Diamond with enhanced mystical theme
- **Supreme Being:** New Tier 9 (godlike achievement)
- **G.O.A.T:** New ultimate single rank

### Removed
- Platinum (replaced by Master)
- Diamond (replaced by Legendary)

---

## Implementation Checklist

- [ ] Update `src/lib/ranks.ts` with new rank definitions
- [ ] Update `src/ui/designSystem.ts` with new colors
- [ ] Update `src/lib/GrScoring.ts` with new thresholds
- [ ] Update all UI components displaying ranks
- [ ] Generate 28 badge border assets
- [ ] Update documentation files
- [ ] Add Roman numeral formatting utility
- [ ] Test rank progression logic

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [Art Asset Master Tracker](./ART-ASSET-MASTER-TRACKER.md) | Overall asset tracking |
| [UI Asset Inventory](./UI-ASSET-INVENTORY.md) | UI element specifications |
| [Design System](../../src/ui/designSystem.ts) | Color definitions in code |
| [Scoring Algorithm](../../src/lib/GrScoring.ts) | Score calculation logic |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-07 | 2.0 | Complete redesign: 10 tiers, 28 ranks, I-III levels, new visuals |
| (previous) | 1.0 | Original 7-tier system (Iron → Mythic) |

---

*This document is THE source of truth for the GymRats rank system. All code and assets should reference this specification.*
