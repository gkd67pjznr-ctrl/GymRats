# Theme System Documentation

**Consolidated from:** `docs/Themes/theme-system.md`, `theme-pack-development-guide.md`

---

## Overview

The GymRats theme system implements a layered approach combining emotional personality with functional efficiency. It provides:

1. **Multiple color palette options** with emotional meaning
2. **Typography system** balancing clarity with personality
3. **Illustration styles** with hand-drawn aesthetic
4. **Motion profiles** for theme-specific animations
5. **Theme persistence** across app sessions
6. **Premium content gating** for monetization

---

## Architecture

### Core Files

| File | Purpose |
|------|---------|
| `src/lib/themes/types.ts` | TypeScript interfaces |
| `src/lib/themes/defaultPacks.ts` | Built-in theme packs |
| `src/lib/themes/themePackStore.ts` | Zustand store for theme state |
| `src/lib/themes/index.ts` | Public exports |

### Theme Pack Structure

Each theme pack contains:

```typescript
interface ThemePack {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  isLegendary: boolean;

  colors: ThemeColors;        // Color palette
  motion: ThemeMotion;        // Animation settings
  particles: ThemeParticles;  // Celebration particles
  celebrations: ThemeCelebrations; // PR/rank-up configs
}
```

---

## Available Themes

### Free Themes

| Theme | Primary | Secondary | Mood |
|-------|---------|-----------|------|
| **Toxic Energy** | Lime `#ADFF2F` | Magenta `#FF00FF` | Electric, aggressive |
| **Iron Forge** | Orange `#FF6B35` | Gold `#FFB347` | Gritty, powerful |

### Premium Themes

| Theme | Primary | Secondary | Mood |
|-------|---------|-----------|------|
| **Neon Glow** | Magenta `#FF00FF` | Cyan `#00FFFF` | Futuristic, vibrant |
| **Infernal Cosmos** | Deep Red | Purple | Intense, cosmic |

### Legendary Themes

Legendary themes include full visual transformation with unique:
- Voice lines and audio
- Custom particle effects
- Theme-specific illustrations
- Visual flair overrides

---

## Usage

### Reactive Hooks (React Components)

```typescript
import {
  useThemePackColors,
  useThemePackMotion,
  useResolvedTheme
} from '@/src/lib/themes';

function MyComponent() {
  // Colors only
  const colors = useThemePackColors();

  // Motion config only
  const motion = useThemePackMotion();

  // Full resolved theme
  const theme = useResolvedTheme();

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

### Imperative API (Non-React Code)

```typescript
import {
  getResolvedTheme,
  getEquippedThemePack
} from '@/src/lib/themes';

function getAccentColor(): string {
  const theme = getResolvedTheme();
  return theme.colors.accent;
}
```

### Managing Theme State

```typescript
import { useThemePackStore } from '@/src/lib/themes';

function ThemeSelector() {
  const {
    equippedPackId,
    ownedPackIds,
    equipPack,
    purchasePack
  } = useThemePackStore();

  const handleSelect = async (packId: string) => {
    if (ownedPackIds.includes(packId)) {
      equipPack(packId);
    } else {
      await purchasePack(packId);
    }
  };
}
```

---

## Color Reference

### Legacy to Theme Pack Migration

| Legacy (`ds.tone.*`) | Theme Pack (`colors.*`) |
|---------------------|------------------------|
| `ds.tone.bg` | `colors.background` |
| `ds.tone.card` | `colors.surface` |
| `ds.tone.card2` | `colors.surfaceElevated` |
| `ds.tone.text` | `colors.text` |
| `ds.tone.textSecondary` | `colors.textSecondary` |
| `ds.tone.muted` | `colors.textMuted` |
| `ds.tone.border` | `colors.border` |
| `ds.tone.accent` | `colors.accent` or `colors.primary` |
| `ds.tone.accent2` | `colors.secondary` |
| `ds.tone.accentSoft` | `colors.primarySoft` |
| `ds.tone.success` | `colors.success` |
| `ds.tone.danger` | `colors.danger` |
| `ds.tone.warning` | `colors.warning` |

### Rank Colors

Access via `colors.ranks`:
```typescript
const goldColor = colors.ranks?.gold ?? '#fbbf24';
```

---

## Creating a Theme Pack

### 1. Define Colors

```typescript
// src/lib/themes/myTheme/colors.ts
export const colors = {
  background: '#0A0A0D',
  surface: '#111118',
  surfaceElevated: '#1A1A22',
  border: '#26263A',
  text: '#F2F4FF',
  textSecondary: '#A9AEC7',
  textMuted: '#6B7094',

  primary: '#FF00FF',
  primarySoft: '#FF00FF20',
  secondary: '#00FFFF',
  accent: '#FF00FF',

  success: '#20FF9A',
  danger: '#FF2D55',
  warning: '#FFB020',
  info: '#3A8DFF',

  ranks: {
    iron: '#7B7E8A',
    bronze: '#B07A4A',
    silver: '#BFC7D5',
    gold: '#FFCC4A',
    platinum: '#64E6C2',
    diamond: '#53A8FF',
    mythic: '#FF4DFF',
  },
};
```

### 2. Define Motion

```typescript
// src/lib/themes/myTheme/motion.ts
export const motion = {
  durationScale: 1.0,       // Multiplier for all durations
  enableGlow: true,         // Enable glow effects
  enableParticles: true,    // Enable particle celebrations

  toastAnimation: {
    entryDurationMs: 200,
    exitDurationMs: 150,
    holdDurationMs: 3000,
  },

  spring: {
    tension: 280,
    friction: 22,
  },
};
```

### 3. Define Particles

```typescript
// src/lib/themes/myTheme/particles.ts
export const particles = {
  shape: 'confetti',        // 'confetti' | 'star' | 'spark'
  colors: ['#FF00FF', '#00FFFF', '#FFFF00'],
  count: 50,

  events: {
    pr: { shape: 'star', count: 100 },
    rankUp: { shape: 'confetti', count: 200 },
  },
};
```

### 4. Register the Pack

```typescript
// src/lib/themes/index.ts
import { myThemePack } from './myTheme';

export const THEME_PACKS = {
  // ... existing packs
  'my-theme': myThemePack,
};
```

---

## Asset Requirements

Each theme needs these assets:

### Illustrations (per theme)

| Asset | Size | Format | Description |
|-------|------|--------|-------------|
| `pr-weight.png` | 200x200 | PNG | Weight PR celebration |
| `pr-rep.png` | 200x200 | PNG | Rep PR celebration |
| `pr-e1rm.png` | 200x200 | PNG | e1RM PR celebration |
| `pr-legendary.png` | 300x300 | PNG | Legendary PR |
| `rank-up.png` | 200x200 | PNG | Rank progression |
| `texture.png` | 512x512 | PNG | Background texture (tileable) |
| `badge-frame.svg` | Vector | SVG | Achievement frame |

### Directory Structure

```
assets/themes/[theme-id]/
├── illustrations/
│   ├── pr-weight.png
│   ├── pr-rep.png
│   ├── pr-e1rm.png
│   ├── pr-legendary.png
│   └── rank-up.png
├── textures/
│   └── texture.png
├── frames/
│   └── badge-frame.svg
└── audio/ (premium only)
    ├── pr-sound.mp3
    └── rank-up-sound.mp3
```

---

## Premium Content System

### Tier Structure

| Tier | Access | Content |
|------|--------|---------|
| **Free** | All users | Basic themes, standard assets |
| **Premium** | IAP | Additional themes, enhanced assets |
| **Legendary** | IAP | Full transformation, voice lines, unique flair |

### Checking Ownership

```typescript
import { useIsPackOwned } from '@/src/lib/themes';

function PackCard({ packId }: { packId: string }) {
  const isOwned = useIsPackOwned(packId);

  return isOwned ? <EquipButton /> : <PurchaseButton />;
}
```

---

## Testing

```typescript
import { useThemePackStore } from '@/src/lib/themes';

beforeEach(() => {
  useThemePackStore.getState().resetToDefault();
});

it('should apply theme colors', () => {
  useThemePackStore.getState().equipPack('toxic-energy');

  render(<MyComponent />);

  // Assert expected colors
});
```

---

## Best Practices

### DO

- Use hooks for reactive updates in components
- Use imperative API in callbacks and utilities
- Memoize computed styles
- Provide fallbacks for optional colors

### DON'T

- Call hooks conditionally
- Store stale color values in closures
- Import legacy `makeDesignSystem` for new code

---

## Related Documentation

- [Style Guide](../style-guide.md) - Visual design specifications
- [Theme Pack Migration](./THEME-PACK-MIGRATION.md) - Migration from legacy
- [Theme Implementation Plan](./theme-implementation-plan.md) - Detailed implementation
- [Premium Content System](../implementation/premium-content-system.md) - IAP integration
