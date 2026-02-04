# Theme Implementation Plan: Iron Forge, Toxic Energy, Neon Glow

**Created:** 2026-02-03
**Status:** Ready for Implementation
**Target:** First 3 theme palettes

---

## Overview: Three Palettes

| Theme | Aesthetic | Primary Accent | Secondary | Mood |
|-------|-----------|----------------|-----------|------|
| **Iron Forge** | Medieval blacksmith | Orange `#FF6B35` | Gold `#FFB347` | Gritty, powerful |
| **Toxic Energy** | Radioactive neon | Lime `#ADFF2F` | Magenta `#FF00FF` | Electric, aggressive |
| **Neon Glow** | Cosmic/cyberpunk | Magenta `#FF00FF` | Cyan `#00FFFF` | Futuristic, vibrant |

---

## Phase 1: Foundation (Code Infrastructure)

### 1.1 Theme Token System

**File to create: `src/ui/themes/themeTokens.ts`**

```typescript
export interface ThemeTokens {
  id: string;
  name: string;

  // Core colors
  colors: {
    bg: string;
    bgElevated: string;
    card: string;
    cardElevated: string;
    border: string;
    borderSubtle: string;

    text: string;
    textMuted: string;
    textInverse: string;

    primary: string;
    primaryMuted: string;
    secondary: string;
    secondaryMuted: string;

    success: string;
    warning: string;
    error: string;

    // Rank colors (can be themed)
    rankIron: string;
    rankBronze: string;
    rankSilver: string;
    rankGold: string;
    rankPlatinum: string;
    rankDiamond: string;
    rankMythic: string;
  };

  // Gradients
  gradients: {
    primary: string[];      // [start, end]
    accent: string[];
    card: string[];
    prCelebration: string[];
  };

  // Typography
  typography: {
    fontFamily: {
      display: string;      // Headers, PR messages
      body: string;         // Regular text
      mono: string;         // Numbers, stats
    };
    fontWeight: {
      regular: string;
      medium: string;
      bold: string;
      black: string;
    };
  };

  // Surfaces
  surfaces: {
    cardOpacity: number;
    overlayOpacity: number;
    glowIntensity: number;
  };

  // Animation presets
  motion: {
    prEntryDuration: number;
    prHoldDuration: number;
    springTension: number;
    springFriction: number;
  };

  // Asset references
  assets: {
    illustrationSet: string;  // 'iron-forge' | 'toxic' | 'neon'
    iconSet: string;
    textureOverlay?: string;
  };
}
```

### 1.2 Individual Theme Definitions

**File: `src/ui/themes/ironForge.ts`**

```typescript
export const ironForgeTheme: ThemeTokens = {
  id: 'iron-forge',
  name: 'Iron Forge',

  colors: {
    bg: '#0D0D0D',
    bgElevated: '#1A1A1A',
    card: '#1F1F1F',
    cardElevated: '#2A2A2A',
    border: '#3D3D3D',
    borderSubtle: '#2A2A2A',

    text: '#F5F5F5',
    textMuted: '#A0A0A0',
    textInverse: '#0D0D0D',

    primary: '#FF6B35',      // Forge orange
    primaryMuted: '#CC5629',
    secondary: '#FFB347',    // Molten gold
    secondaryMuted: '#CC8F39',

    success: '#4CAF50',
    warning: '#FFB347',
    error: '#FF5252',

    rankIron: '#71797E',
    rankBronze: '#CD7F32',
    rankSilver: '#C0C0C0',
    rankGold: '#FFD700',
    rankPlatinum: '#E5E4E2',
    rankDiamond: '#B9F2FF',
    rankMythic: '#FF6B35',   // Theme accent
  },

  gradients: {
    primary: ['#FF6B35', '#FF8C42'],
    accent: ['#FFB347', '#FF6B35'],
    card: ['#1F1F1F', '#2A2A2A'],
    prCelebration: ['#FF6B35', '#FFB347', '#FF6B35'],
  },

  typography: {
    fontFamily: {
      display: 'System',     // Will use custom later
      body: 'System',
      mono: 'SpaceMono',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
      black: '900',
    },
  },

  surfaces: {
    cardOpacity: 0.95,
    overlayOpacity: 0.85,
    glowIntensity: 0.3,
  },

  motion: {
    prEntryDuration: 300,
    prHoldDuration: 3000,
    springTension: 40,
    springFriction: 7,
  },

  assets: {
    illustrationSet: 'iron-forge',
    iconSet: 'iron-forge',
    textureOverlay: 'metal-texture',
  },
};
```

**File: `src/ui/themes/toxicEnergy.ts`**

```typescript
export const toxicEnergyTheme: ThemeTokens = {
  id: 'toxic-energy',
  name: 'Toxic Energy',

  colors: {
    bg: '#0A0A0A',
    bgElevated: '#121212',
    card: '#1A1A1A',
    cardElevated: '#222222',
    border: '#2D2D2D',
    borderSubtle: '#1F1F1F',

    text: '#F0F0F0',
    textMuted: '#808080',
    textInverse: '#0A0A0A',

    primary: '#ADFF2F',      // Toxic lime
    primaryMuted: '#8BCC26',
    secondary: '#FF00FF',    // Electric magenta
    secondaryMuted: '#CC00CC',

    success: '#ADFF2F',
    warning: '#FFFF00',
    error: '#FF3366',

    rankIron: '#5A5A5A',
    rankBronze: '#8B4513',
    rankSilver: '#A8A8A8',
    rankGold: '#CCCC00',
    rankPlatinum: '#D4D4D4',
    rankDiamond: '#00FFFF',
    rankMythic: '#ADFF2F',
  },

  gradients: {
    primary: ['#ADFF2F', '#7CFC00'],
    accent: ['#FF00FF', '#ADFF2F'],
    card: ['#1A1A1A', '#222222'],
    prCelebration: ['#ADFF2F', '#FF00FF', '#ADFF2F'],
  },

  typography: {
    fontFamily: {
      display: 'System',
      body: 'System',
      mono: 'SpaceMono',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
      black: '900',
    },
  },

  surfaces: {
    cardOpacity: 0.9,
    overlayOpacity: 0.8,
    glowIntensity: 0.5,      // Higher glow for toxic
  },

  motion: {
    prEntryDuration: 200,    // Faster, more aggressive
    prHoldDuration: 2500,
    springTension: 60,
    springFriction: 5,
  },

  assets: {
    illustrationSet: 'toxic',
    iconSet: 'toxic',
    textureOverlay: 'noise-texture',
  },
};
```

**File: `src/ui/themes/neonGlow.ts`**

```typescript
export const neonGlowTheme: ThemeTokens = {
  id: 'neon-glow',
  name: 'Neon Glow',

  colors: {
    bg: '#050510',           // Deep space blue-black
    bgElevated: '#0A0A1A',
    card: '#12122A',
    cardElevated: '#1A1A3A',
    border: '#2A2A4A',
    borderSubtle: '#1A1A3A',

    text: '#FFFFFF',
    textMuted: '#8888AA',
    textInverse: '#050510',

    primary: '#FF00FF',      // Neon magenta
    primaryMuted: '#CC00CC',
    secondary: '#00FFFF',    // Cyan
    secondaryMuted: '#00CCCC',

    success: '#00FF88',
    warning: '#FFFF00',
    error: '#FF3366',

    rankIron: '#4A4A6A',
    rankBronze: '#8B5A2B',
    rankSilver: '#9090B0',
    rankGold: '#FFD700',
    rankPlatinum: '#C0C0E0',
    rankDiamond: '#00FFFF',
    rankMythic: '#FF00FF',
  },

  gradients: {
    primary: ['#FF00FF', '#FF66FF'],
    accent: ['#00FFFF', '#FF00FF'],
    card: ['#12122A', '#1A1A3A'],
    prCelebration: ['#FF00FF', '#00FFFF', '#FF00FF'],
  },

  typography: {
    fontFamily: {
      display: 'System',
      body: 'System',
      mono: 'SpaceMono',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
      black: '900',
    },
  },

  surfaces: {
    cardOpacity: 0.85,
    overlayOpacity: 0.75,
    glowIntensity: 0.6,      // Highest glow
  },

  motion: {
    prEntryDuration: 250,
    prHoldDuration: 3000,
    springTension: 50,
    springFriction: 6,
  },

  assets: {
    illustrationSet: 'neon',
    iconSet: 'neon',
    textureOverlay: 'scanlines',
  },
};
```

### 1.3 Theme Context Provider

**File: `src/ui/themes/ThemeProvider.tsx`**

```typescript
import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from '@/src/lib/stores/settingsStore';
import { ironForgeTheme } from './ironForge';
import { toxicEnergyTheme } from './toxicEnergy';
import { neonGlowTheme } from './neonGlow';
import type { ThemeTokens } from './themeTokens';

const themes: Record<string, ThemeTokens> = {
  'iron-forge': ironForgeTheme,
  'toxic-energy': toxicEnergyTheme,
  'neon-glow': neonGlowTheme,
};

const ThemeContext = createContext<ThemeTokens>(ironForgeTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeId } = useSettings();
  const theme = useMemo(() => themes[themeId] || ironForgeTheme, [themeId]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
```

---

## Phase 2: Asset Requirements

### 2.1 Illustrations Needed Per Theme

Each theme needs illustration sets for PR celebrations and UI accents:

#### Iron Forge Illustrations
| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| `pr-weight-iron.png` | Anvil with sparks | 200x200 | PNG w/ alpha |
| `pr-rep-iron.png` | Hammer strike | 200x200 | PNG w/ alpha |
| `pr-e1rm-iron.png` | Glowing forge | 200x200 | PNG w/ alpha |
| `pr-legendary-iron.png` | Full forge scene | 300x300 | PNG w/ alpha |
| `rank-up-iron.png` | Sword being forged | 200x200 | PNG w/ alpha |
| `texture-metal.png` | Subtle metal texture | 512x512 | PNG tileable |
| `badge-frame-iron.svg` | Medieval shield frame | Vector | SVG |

#### Toxic Energy Illustrations
| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| `pr-weight-toxic.png` | Biohazard burst | 200x200 | PNG w/ alpha |
| `pr-rep-toxic.png` | Electric discharge | 200x200 | PNG w/ alpha |
| `pr-e1rm-toxic.png` | Radioactive glow | 200x200 | PNG w/ alpha |
| `pr-legendary-toxic.png` | Full toxic explosion | 300x300 | PNG w/ alpha |
| `rank-up-toxic.png` | Level up effect | 200x200 | PNG w/ alpha |
| `texture-noise.png` | Noise/grain overlay | 512x512 | PNG tileable |
| `badge-frame-toxic.svg` | Hexagonal tech frame | Vector | SVG |

#### Neon Glow Illustrations
| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| `pr-weight-neon.png` | Neon burst | 200x200 | PNG w/ alpha |
| `pr-rep-neon.png` | Pulse wave | 200x200 | PNG w/ alpha |
| `pr-e1rm-neon.png` | Star explosion | 200x200 | PNG w/ alpha |
| `pr-legendary-neon.png` | Cosmic celebration | 300x300 | PNG w/ alpha |
| `rank-up-neon.png` | Ascending light | 200x200 | PNG w/ alpha |
| `texture-scanlines.png` | CRT scanlines | 512x512 | PNG tileable |
| `badge-frame-neon.svg` | Circular glow frame | Vector | SVG |

### 2.2 Asset Directory Structure

```
assets/
├── themes/
│   ├── iron-forge/
│   │   ├── illustrations/
│   │   │   ├── pr-weight.png
│   │   │   ├── pr-rep.png
│   │   │   ├── pr-e1rm.png
│   │   │   ├── pr-legendary.png
│   │   │   └── rank-up.png
│   │   ├── textures/
│   │   │   └── metal.png
│   │   └── frames/
│   │       └── badge-frame.svg
│   ├── toxic-energy/
│   │   └── ... (same structure)
│   └── neon-glow/
│       └── ... (same structure)
```

---

## Phase 3: Component Theming

### 3.1 Update CuePresenter for Themes

**File: `src/ui/components/CuePresenter/CuePresenter.tsx`**

Key changes needed:
1. Use `useTheme()` instead of `useThemeColors()`
2. Add illustration loading based on theme
3. Apply theme-specific animations

```typescript
// Add to CuePresenter.tsx

import { useTheme } from '@/src/ui/themes/ThemeProvider';
import { getThemeIllustration } from '@/src/ui/themes/themeAssets';

export function CuePresenter({ cue, onDismiss, ...props }: CuePresenterProps) {
  const theme = useTheme();

  // Get theme-specific illustration
  const illustration = useMemo(() => {
    if (!richCue || !illustrationsEnabled) return null;
    return getThemeIllustration(theme.assets.illustrationSet, richCue.prType);
  }, [richCue, theme, illustrationsEnabled]);

  // Use theme motion values
  const entryDuration = theme.motion.prEntryDuration;
  const springConfig = {
    tension: theme.motion.springTension,
    friction: theme.motion.springFriction,
  };

  // Apply theme colors
  const backgroundColor = isLegendary
    ? theme.colors.primary
    : theme.colors.card;

  // Add glow effect based on theme
  const shadowColor = theme.colors.primary;
  const shadowOpacity = theme.surfaces.glowIntensity;

  // ... rest of component
}
```

### 3.2 Themed Card Component

**File: `src/ui/components/ThemedCard.tsx`**

```typescript
import { useTheme } from '@/src/ui/themes/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

interface ThemedCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  glowing?: boolean;
  style?: ViewStyle;
}

export function ThemedCard({
  children,
  elevated = false,
  glowing = false,
  style
}: ThemedCardProps) {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? theme.colors.cardElevated : theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    ...(glowing && {
      shadowColor: theme.colors.primary,
      shadowOpacity: theme.surfaces.glowIntensity,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 },
    }),
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
}
```

### 3.3 Themed Text Components

**File: `src/ui/components/ThemedText.tsx`**

```typescript
import { useTheme } from '@/src/ui/themes/ThemeProvider';

type TextVariant = 'display' | 'heading' | 'body' | 'caption' | 'mono';

interface ThemedTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'inverse';
  children: React.ReactNode;
  style?: TextStyle;
}

export function ThemedText({
  variant = 'body',
  color,
  children,
  style,
}: ThemedTextProps) {
  const theme = useTheme();

  const textColor = color
    ? theme.colors[color === 'primary' ? 'text' :
                   color === 'secondary' ? 'primary' :
                   color === 'muted' ? 'textMuted' : 'textInverse']
    : theme.colors.text;

  const fontFamily = variant === 'mono'
    ? theme.typography.fontFamily.mono
    : variant === 'display' || variant === 'heading'
    ? theme.typography.fontFamily.display
    : theme.typography.fontFamily.body;

  return (
    <Text style={[{ color: textColor, fontFamily }, style]}>
      {children}
    </Text>
  );
}
```

---

## Phase 4: Animation Specifications

### 4.1 PR Celebration Animations

**Entry Animations by Intensity:**

| Intensity | Duration | Scale Start | Spring Tension | Glow Pulse |
|-----------|----------|-------------|----------------|------------|
| subtle | 150ms | 0.9 | 80 | None |
| normal | 200ms | 0.8 | 50 | Single |
| hype | 300ms | 0.6 | 40 | Double |
| legendary | 400ms | 0.5 | 30 | Continuous |

**Theme-Specific Animation Modifiers:**

- **Iron Forge**: Heavier, more impact - add slight camera shake on legendary
- **Toxic Energy**: Faster, more aggressive - add glitch effect on entry
- **Neon Glow**: Smoother, more fluid - add light trail effect

### 4.2 Animation Implementation

**File: `src/ui/animations/prAnimations.ts`**

```typescript
import { Animated, Easing } from 'react-native';
import type { ThemeTokens } from '@/src/ui/themes/themeTokens';
import type { CueIntensity } from '@/src/lib/cues/cueTypes';

export function getPREntryAnimation(
  theme: ThemeTokens,
  intensity: CueIntensity,
  animatedValues: {
    opacity: Animated.Value;
    scale: Animated.Value;
    translateY: Animated.Value;
    glow: Animated.Value;
  }
) {
  const { opacity, scale, translateY, glow } = animatedValues;

  // Base durations scaled by theme
  const baseDuration = theme.motion.prEntryDuration;
  const durationMultiplier = {
    subtle: 0.75,
    normal: 1,
    hype: 1.25,
    legendary: 1.5,
  }[intensity];

  const duration = baseDuration * durationMultiplier;

  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      toValue: 1,
      tension: theme.motion.springTension,
      friction: theme.motion.springFriction,
      useNativeDriver: true,
    }),
    Animated.spring(translateY, {
      toValue: 0,
      tension: theme.motion.springTension,
      friction: theme.motion.springFriction,
      useNativeDriver: true,
    }),
    // Glow pulse for higher intensities
    ...(intensity !== 'subtle' ? [
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: duration * 0.5,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: theme.surfaces.glowIntensity,
          duration: duration * 0.5,
          useNativeDriver: false,
        }),
      ])
    ] : []),
  ]);
}
```

---

## Phase 5: Implementation Steps

### Step 1: Create Theme Infrastructure (Day 1)
- [ ] Create `src/ui/themes/` directory
- [ ] Create `themeTokens.ts` with TypeScript interfaces
- [ ] Create `ironForge.ts`, `toxicEnergy.ts`, `neonGlow.ts`
- [ ] Create `ThemeProvider.tsx`
- [ ] Create `index.ts` barrel export

### Step 2: Update Settings Store (Day 1)
```typescript
// Add to settingsStore.ts
interface Settings {
  // ... existing
  themeId: string;  // 'iron-forge' | 'toxic-energy' | 'neon-glow'
}
```

### Step 3: Create Asset Loader (Day 2)
```typescript
// src/ui/themes/themeAssets.ts
const assetMap = {
  'iron-forge': {
    'weight': require('@/assets/themes/iron-forge/illustrations/pr-weight.png'),
    'rep': require('@/assets/themes/iron-forge/illustrations/pr-rep.png'),
    // ...
  },
  // ...
};

export function getThemeIllustration(themeSet: string, prType: string) {
  return assetMap[themeSet]?.[prType] || null;
}
```

### Step 4: Create Placeholder Assets (Day 2)
- [ ] Generate colored placeholder PNGs (200x200, 300x300)
- [ ] Use solid colors matching each theme
- [ ] Replace with real artwork later

### Step 5: Update CuePresenter (Day 3)
- [ ] Import theme context
- [ ] Add illustration display
- [ ] Apply theme-specific colors
- [ ] Add glow effects
- [ ] Update animations with theme values

### Step 6: Create Themed Components (Day 3-4)
- [ ] `ThemedCard`
- [ ] `ThemedText`
- [ ] `ThemedButton`
- [ ] `ThemedBadge` (for ranks)

### Step 7: Add Theme Selector UI (Day 4)
- [ ] Create `app/settings/theme.tsx`
- [ ] Show theme previews
- [ ] Allow selection
- [ ] Persist to settings

### Step 8: Wire Theme Provider (Day 5)
- [ ] Wrap app root in `<ThemeProvider>`
- [ ] Update `_layout.tsx`
- [ ] Test all screens

### Step 9: Test & Polish (Day 5+)
- [ ] Test each theme thoroughly
- [ ] Verify color contrast accessibility
- [ ] Test animations on device
- [ ] Fine-tune glow intensities

---

## Summary: What You Need to Provide

### Design Assets Needed:
1. **21 illustrations** (7 per theme x 3 themes)
2. **3 texture overlays** (one per theme)
3. **3 badge frames** (SVG, one per theme)

### Design Decisions Needed:
1. Exact hex values for any color adjustments
2. Custom font choices (if any beyond system)
3. Illustration style direction for each theme
4. Audio file requirements (future phase)

### Code Changes Summary:
- **New files**: ~10 (theme definitions, provider, asset loader, themed components)
- **Modified files**: ~5 (CuePresenter, settingsStore, root layout, existing components)
- **New directories**: `src/ui/themes/`, `assets/themes/`

---

## Related Documentation

- [Visual Style Guide](./visual-style-guide.md)
- [Visual System Architecture](./visual-system-architecture.md)
- [Implementation Roadmap v2](./implementation-roadmap-v2.md)
- [Iron Forge Palette Analysis](./Iron%20Forge%20Palette/analysis.md)
- [Toxic Energy Palette Analysis](./Toxic%20Energy%20Palette/analysis.md)
- [Neon Glow Palette Analysis](./Neon%20Glow%20Palette/analysis.md)
- [Cue System Implementation](./cue-system-implementation.md)
- [Asset Integration Guide](./asset-integration-guide.md)
