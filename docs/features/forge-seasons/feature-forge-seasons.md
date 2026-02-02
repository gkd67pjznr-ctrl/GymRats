# Feature: Forge Seasons

## Overview
Seasonal content drops to keep the app fresh. Quarterly themes with limited-time earnable cosmetics — avatar items, room decorations, and exclusive seasonal items. No battle-pass grind track.

**Status:** Planned | **Progress:** 0/4 features
**Priority:** Post-launch
**Source:** 2026-01-29 brainstorm interview

**Philosophy:** Lighter version of seasonal content. No battle pass, no FOMO-driven grind. Just limited-time items that reward active users and keep things visually fresh.

---

## Sub-Features

### Planned - Seasonal Themes
- [ ] Quarterly theme changes (e.g., "Forge Frost" winter, "Iron Summer")
- [ ] App accent color shifts
- [ ] Themed loading screens or splash art
- [ ] Seasonal buddy commentary lines
- [ ] Theme announcement in feed

---

### Planned - Limited-Time Cosmetics
- [ ] Season-exclusive avatar items (clothes, accessories)
- [ ] Season-exclusive room decorations
- [ ] Earnable through workouts during the season
- [ ] Some purchasable with Forge Tokens or IAP
- [ ] Items become unavailable after season ends (but owned items stay)

---

### Planned - Seasonal Leaderboard Events
- [ ] Season-specific volume challenges
- [ ] Seasonal rank reset option (opt-in, fresh competition)
- [ ] End-of-season awards and badges
- [ ] Seasonal milestone rewards

---

### Planned - Seasonal Avatar Items
- [ ] Themed gym wear (holiday sweaters, summer tanks, etc.)
- [ ] Themed accessories (Santa hat, sunglasses, etc.)
- [ ] Themed room items (seasonal decorations)
- [ ] Mix of free (earnable) and premium (IAP) items

---

## Technical Notes

```typescript
type Season = {
  id: string;
  name: string;
  theme: string;
  startDate: number;
  endDate: number;
  accentColor: string;
  cosmetics: SeasonalCosmetic[];
  challenges: SeasonalChallenge[];
};

type SeasonalCosmetic = {
  id: string;
  type: 'avatar_item' | 'room_decoration' | 'badge';
  cost: number;           // 0 = earnable for free
  costType: 'tokens' | 'iap' | 'earned';
  earnCondition?: string; // "Complete 20 workouts this season"
};
```

---

## Dependencies

- Avatar system (seasonal items)
- Hangout room (seasonal decorations)
- Gamification store (seasonal purchases)
- Backend (season configuration, item availability)

---

## Priority

**P3 (Post-Launch):**
- First season with basic theme + 5-10 cosmetic items
- Limited-time earnable items

**P4 (Future):**
- Seasonal leaderboard events
- Full quarterly cadence
