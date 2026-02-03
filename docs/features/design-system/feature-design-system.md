# Feature: Modern Design System Architecture

**Status:** Phase 1-4 Complete, Phase 5 In Progress
**Priority:** P0 - Core Visual Foundation
**Created:** 2026-02-03
**Updated:** 2026-02-03

---

## Overview

A complete redesign of the visual architecture to create a premium, modern app aesthetic. This system replaces the flat, basic color application with a layered, theme-installable approach that supports depth, glass effects, animations, and swappable visual identities.

---

## Quick Start (Import Reference)

### New Design System (Recommended)

```typescript
// Tokens
import { colors, surface, text, border, spacing, corners } from '@/src/design';

// Components
import { Surface, Card, Text, Button } from '@/src/design/primitives';

// Gradients
import { backgroundGradients, cardGradients } from '@/src/design';

// Themes (for runtime switching)
import { useTheme, useThemeColors } from '@/src/design/themes';
```

### Legacy Compatibility (Still Works)

```typescript
// Old imports continue to work via compatibility layer
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
```

---

## Goals

1. **Visual Depth**: Replace flat colors with layered elevation system
2. **Theme Flexibility**: Enable complete visual identity swaps (colors + art + motion + audio)
3. **Premium Feel**: Glass effects, subtle gradients, micro-animations everywhere
4. **Maintainability**: Single source of truth for all visual tokens
5. **Performance**: Optimized animations using Reanimated 3
6. **Backwards Compatibility**: Gradual migration without breaking existing screens

---

## Architecture Layers

### Layer 1: Design Tokens (Foundation)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRIMITIVE TOKENS                        │
│  Raw values: colors.gray[900], spacing.lg, corners.pill     │
│  File: src/design/tokens/primitives.ts                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     SEMANTIC TOKENS                         │
│  Purpose-based: surface.raised, text.muted, border.subtle   │
│  File: src/design/tokens/semantic.ts                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT TOKENS                         │
│  Specific: card.default, button.primary, input.default      │
│  File: src/design/tokens/components.ts                      │
└─────────────────────────────────────────────────────────────┘
```

### Layer 2: Surface Elevation System

Six distinct depth levels for visual hierarchy:

| Level | Name | Use Case | Example |
|-------|------|----------|---------|
| 0 | `sunken` | Below base, input wells | Text inputs, search bars |
| 1 | `base` | Screen background | Main content area |
| 2 | `raised` | Cards, containers | Feed posts, workout cards |
| 3 | `elevated` | Modals, sheets | Bottom sheets, dialogs |
| 4 | `floating` | Dropdowns, popovers | Menus, tooltips |
| 5 | `spotlight` | Focused elements | Active cards, highlights |

### Layer 3: Theme Installation System

A **Theme** is a complete visual identity bundle:

```typescript
interface ThemeInstallation {
  id: string;
  name: string;
  palette: ColorPalette;
  typography: TypographyConfig;
  illustrations: IllustrationSet;
  motion: MotionPresets;
  audio: AudioConfig;
  haptics: HapticPatterns;
}
```

**Available Themes:**
- `toxic` - Lime green neon (default)
- `electric` - Purple/blue energy
- `ember` - Pink/orange warmth
- `ice` - Cyan/teal frost

### Layer 4: Primitive Components

Theme-aware base components that consume the token system:

- `Surface` - Elevation-aware container with shadow/blur
- `Card` - Styled card with variants (default, elevated, accent, glass)
- `Text` - Typography component with semantic variants
- `Button` - Animated button with haptic feedback

### Layer 5: Art System

Decorative elements that transform with themes:

- **Illustrations**: Empty states, onboarding, achievements
- **Celebrations**: PR particles, rank-up effects, confetti
- **Decorations**: Card borders, badges, rank indicators
- **Particles**: Sparks, flames, frost, etc.

---

## File Structure

```
src/
├── design/
│   ├── index.ts                    # Main entry point - exports all tokens
│   │
│   ├── tokens/
│   │   ├── primitives.ts           # Raw colors, spacing, typography
│   │   ├── semantic.ts             # Surface, text, border tokens
│   │   ├── components.ts           # Button, card, input tokens
│   │   └── index.ts
│   │
│   ├── surfaces/
│   │   ├── elevation.ts            # Depth/shadow system
│   │   ├── gradients.ts            # Background/card gradients
│   │   └── index.ts
│   │
│   ├── primitives/
│   │   ├── Surface.tsx             # Elevation container
│   │   ├── Card.tsx                # Card component
│   │   ├── Text.tsx                # Typography component
│   │   ├── Button.tsx              # Button with variants
│   │   └── index.ts
│   │
│   ├── themes/
│   │   ├── types.ts                # ThemeInstallation interface
│   │   ├── default.ts              # 4 default themes
│   │   ├── ThemeContext.tsx        # React context + provider
│   │   ├── useTheme.ts             # Theme hooks
│   │   └── index.ts
│   │
│   ├── motion/
│   │   └── index.ts                # Springs, easings, presets
│   │
│   └── art/
│       ├── types.ts                # Art system types
│       ├── celebrations/
│       │   ├── presets.ts          # PR, rankUp, milestone presets
│       │   └── index.ts
│       ├── particles/
│       │   ├── ParticleSystem.tsx  # Reanimated particle engine
│       │   └── index.ts
│       ├── decorations/
│       │   └── index.tsx           # Placeholder decorations
│       └── illustrations/
│           └── index.tsx           # Placeholder illustrations
│
├── ui/
│   ├── theme.ts                    # COMPATIBILITY LAYER (deprecated)
│   └── designSystem.ts             # COMPATIBILITY LAYER (deprecated)
```

---

## Backwards Compatibility Layer

The old theme system continues to work via a compatibility layer:

### src/ui/theme.ts

```typescript
// This file now redirects to the new design system
// Old code continues to work without changes

export function useThemeColors(): ThemeColors {
  // Returns dark/light colors from new design system
}

export function useTheme() {
  // Returns minimal theme interface for legacy code
}
```

### src/ui/designSystem.ts

```typescript
// Deprecated but maintained for backwards compatibility
// Uses new design system colors under the hood

export function makeDesignSystem(mode, accent): DesignSystem {
  // Returns full design system object using new tokens
}

// Tone type includes all legacy properties:
// bg, card, card2, text, textSecondary, muted, border, overlay,
// success, danger, warn, warning, info, error,
// accent, accent2, accentSoft, purple,
// iron, bronze, silver, gold, platinum, diamond, mythic
```

---

## Implementation Status

### Phase 1: Token Architecture ✅ Complete
- [x] Create primitives.ts with raw color values
- [x] Create semantic.ts with purpose-based tokens
- [x] Create components.ts with component-specific tokens
- [x] Create elevation.ts with depth system

### Phase 2: Theme System ✅ Complete
- [x] Define ThemeInstallation interface
- [x] Create ThemeContext and ThemeProvider
- [x] Build useTheme hook
- [x] Create 4 default themes (toxic, electric, ember, ice)

### Phase 3: Primitive Components ✅ Complete
- [x] Build Surface component
- [x] Build Card component with variants
- [x] Build themed Text component
- [x] Build animated Button component

### Phase 4: Art System ✅ Complete
- [x] Define celebration configurations
- [x] Create particle system (ParticleSystem.tsx)
- [x] Set up illustration placeholders
- [x] Create decoration placeholders
- [ ] Create actual illustrations (requires design assets)

### Phase 5: Screen Migration 🔄 In Progress
- [x] Home/Feed tab (proof-of-concept)
- [x] Workout with Friends screen (migrated 2026-02-03)
- [x] Hangout screen (migrated 2026-02-03)
- [x] RestTimerOverlay (fixed positioning 2026-02-03)
- [ ] Workout hub
- [ ] Profile screen
- [ ] Workout drawer
- [ ] History screen
- [ ] Routines screen
- [ ] Live workout screen

### Bug Fixes (2026-02-03)
- [x] Fixed `purple` property missing on Tone type in designSystem.ts
- [x] Fixed `useAvatarGrowth` infinite re-render loop (now uses `useMemo`)
- [x] Added 24-hour session expiration to `currentSessionStore`
- [x] Fixed rest timer pill positioning to account for safe area + tab bar

---

## Usage Examples

### Using Design Tokens

```tsx
import { colors, surface, text, spacing, corners, backgroundGradients } from '@/src/design';

const styles = StyleSheet.create({
  container: {
    backgroundColor: surface.base,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: surface.raised,
    borderRadius: corners.card,
    borderWidth: 1,
    borderColor: border.subtle,
  },
  title: {
    color: text.primary,
    fontSize: 20,
  },
  accent: {
    color: colors.toxic.primary,
  },
});
```

### Using Primitive Components

```tsx
import { Surface, Card, Text, Button } from '@/src/design/primitives';

function MyScreen() {
  return (
    <Surface elevation="base" style={{ flex: 1 }}>
      <Card variant="elevated" size="md">
        <Text variant="h3" color="primary">Card Title</Text>
        <Text variant="body" color="muted">Description text</Text>
        <Button variant="primary" onPress={() => {}}>
          Take Action
        </Button>
      </Card>
    </Surface>
  );
}
```

### Using Background Gradients

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { backgroundGradients } from '@/src/design';

function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Screen depth gradient */}
      <LinearGradient
        colors={backgroundGradients.screenDepth.colors}
        start={backgroundGradients.screenDepth.start}
        end={backgroundGradients.screenDepth.end}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glow accent */}
      <LinearGradient
        colors={backgroundGradients.topGlow.colors}
        start={backgroundGradients.topGlow.start}
        end={backgroundGradients.topGlow.end}
        style={styles.topGlow}
      />

      {/* Content */}
    </View>
  );
}
```

### Using Celebrations

```tsx
import { ParticleSystem } from '@/src/design/art/particles';
import { prConfettiPreset } from '@/src/design/art/celebrations';

function PRCelebration({ show, onComplete }) {
  return (
    <ParticleSystem
      config={prConfettiPreset.particles}
      active={show}
      duration={prConfettiPreset.duration}
      onComplete={onComplete}
    />
  );
}
```

---

## Migration Guide

### Step 1: Add New Imports

```typescript
// At the top of your file, add new imports
import {
  Surface, Card, Text,
  colors, surface, text, border, spacing, corners,
  backgroundGradients,
} from '@/src/design';
```

### Step 2: Replace Color References

```typescript
// Old
style={{ backgroundColor: c.bg }}
style={{ color: c.text }}
style={{ borderColor: c.border }}

// New
style={{ backgroundColor: surface.base }}
style={{ color: text.primary }}
style={{ borderColor: border.default }}
```

### Step 3: Replace Components

```typescript
// Old
<View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16 }}>
  <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>Title</Text>
</View>

// New
<Card variant="default" size="md">
  <Text variant="h3" color="primary">Title</Text>
</Card>
```

### Step 4: Add Screen Backgrounds

```tsx
// Wrap screen content with gradient backgrounds
<View style={{ flex: 1, backgroundColor: surface.base }}>
  <LinearGradient
    colors={backgroundGradients.screenDepth.colors}
    style={StyleSheet.absoluteFill}
  />
  <LinearGradient
    colors={backgroundGradients.topGlow.colors}
    style={styles.topGlow}
  />
  <ScreenHeader title="My Screen" />
  {/* Your content */}
</View>
```

---

## Token Reference

### Colors (`colors`)

```typescript
colors.toxic.primary      // #A6FF00 (lime green)
colors.toxic.secondary    // #00FFB3 (teal)
colors.toxic.soft         // #203018 (dark green)

colors.electric.primary   // #6D5BFF (purple)
colors.electric.secondary // #00D5FF (cyan)

colors.ember.primary      // #FF3D7F (pink)
colors.ember.secondary    // #FF9F0A (orange)

colors.ice.primary        // #00F5D4 (teal)
colors.ice.secondary      // #7DF9FF (light cyan)
```

### Surfaces (`surface`)

```typescript
surface.base       // #0A0A0D (screen background)
surface.sunken     // #050507 (input wells)
surface.raised     // #111118 (cards)
surface.elevated   // #18182A (modals)
surface.floating   // #1F1F33 (dropdowns)
surface.spotlight  // #252538 (highlights)
```

### Text Colors (`text`)

```typescript
text.primary    // #F2F4FF
text.secondary  // #D4D4D8
text.muted      // #A9AEC7
text.success    // #20FF9A
text.warning    // #FFB020
text.danger     // #FF2D55
text.info       // #3A8DFF
text.accent     // #A6FF00
```

### Spacing (`spacing`)

```typescript
spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 16
spacing.lg   // 24
spacing.xl   // 32
spacing['2xl'] // 48
spacing['3xl'] // 64
```

### Corners (`corners`)

```typescript
corners.none    // 0
corners.sm      // 8
corners.md      // 12
corners.lg      // 16
corners.xl      // 20
corners.pill    // 999
corners.card    // 16
corners.button  // 12
corners.input   // 10
```

---

## Success Criteria

- [x] All new screens use new elevation system
- [x] Theme can be swapped at runtime (context + hooks ready)
- [x] PR celebration system defined (presets created)
- [x] Backwards compatibility maintained
- [x] ScreenHeader component with safe area handling
- [x] RestTimerOverlay positioning fixed for safe area + tab bar
- [ ] Glass effects work on iOS and Android (needs testing)
- [ ] Animations run at 60fps (needs profiling)
- [ ] All screens migrated (7/15 complete)
- [ ] Users perceive app as "modern" and "premium" (needs user testing)

---

## Related Documents

- [Visual Style Guide](../../visual-style/visual-style-guide.md)
- [UI Aesthetic Implementation](../../visual-style/ui-aesthetic-implementation.md)
- [Workout Drawer](../workout-drawer/feature-workout-drawer.md)
