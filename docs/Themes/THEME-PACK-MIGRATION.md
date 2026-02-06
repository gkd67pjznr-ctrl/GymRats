# Theme Pack Migration Guide

This guide explains how to update components to use the new theme pack system.

## Overview

The theme pack system provides:
- **Sellable IAP theme packs** bundling colors, motion, audio, and particles
- **Hooks for reactive theming** that update UI when user changes theme
- **Backwards compatibility** with the legacy `designSystem.ts`

## Quick Start

### Before (Legacy)
```typescript
import { makeDesignSystem } from '@/src/ui/designSystem';

function MyComponent() {
  const ds = makeDesignSystem("dark", "toxic");  // ❌ Hardcoded, not reactive

  return (
    <View style={{ backgroundColor: ds.tone.card }}>
      <Text style={{ color: ds.tone.text }}>Hello</Text>
    </View>
  );
}
```

### After (Theme Pack)
```typescript
import { useThemePackColors } from '@/src/lib/themes';

function MyComponent() {
  const colors = useThemePackColors();  // ✓ Reactive to theme changes

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

## Migration Steps

### Step 1: Replace imports

```diff
- import { makeDesignSystem } from '@/src/ui/designSystem';
+ import { useThemePackColors, useThemePackMotion } from '@/src/lib/themes';
```

### Step 2: Replace the design system call

```diff
function MyComponent() {
-  const ds = makeDesignSystem("dark", "toxic");
+  const colors = useThemePackColors();
```

### Step 3: Update color references

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
| `ds.tone.info` | `colors.info` |
| `ds.tone.purple` | `colors.secondary` |

### Step 4: Update rank colors

```diff
- style={{ color: ds.tone.gold }}
+ style={{ color: colors.ranks?.gold ?? '#fbbf24' }}
```

## Using Motion Config

For animated components:

```typescript
import { useThemePackMotion } from '@/src/lib/themes';

function AnimatedToast() {
  const motion = useThemePackMotion();

  const duration = 200 * motion.durationScale;

  Animated.timing(opacity, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  }).start();
}
```

## Using the Full Resolved Theme

When you need everything:

```typescript
import { useResolvedTheme } from '@/src/lib/themes';

function ComplexComponent() {
  const theme = useResolvedTheme();

  // Colors
  const bgColor = theme.colors.background;

  // Motion
  const enableGlow = theme.motion.enableGlow;

  // Particles
  const particleColors = theme.particles.colors;

  // Celebrations
  const prStyle = theme.celebrations.prCelebration.style;
}
```

## Imperative API (Non-React Code)

For use outside React components:

```typescript
import { getResolvedTheme, getEquippedThemePack } from '@/src/lib/themes';

// In a utility function
function getAccentColor(): string {
  const theme = getResolvedTheme();
  return theme.colors.accent;
}

// Get the raw pack data
function getCurrentPackId(): string | null {
  const pack = getEquippedThemePack();
  return pack?.id ?? null;
}
```

## Component Examples

### BuddyMessageToast (Before)

```typescript
export function BuddyMessageToast(props: Props) {
  const ds = makeDesignSystem("dark", "toxic");  // ❌ Hardcoded

  const accentColor = isLegendary ? ds.tone.accent2 : ds.tone.accent;
  const backgroundColor = isLegendary ? `${ds.tone.card}80` : ds.tone.card;

  // ...
}
```

### BuddyMessageToast (After)

```typescript
import { useThemePackColors, useThemePackMotion } from '@/src/lib/themes';

export function BuddyMessageToast(props: Props) {
  const colors = useThemePackColors();  // ✓ Reactive
  const motion = useThemePackMotion();

  const accentColor = isLegendary ? colors.secondary : colors.accent;
  const backgroundColor = isLegendary
    ? `${colors.surface}80`
    : colors.surface;

  // Use motion config for animations
  const holdMs = motion.toastAnimation?.holdDurationMs ?? 3000;

  // ...
}
```

### PR Celebration (Using Particles)

```typescript
import { useResolvedTheme } from '@/src/lib/themes';

export function PRCelebration() {
  const theme = useResolvedTheme();

  const particleConfig = theme.particles.events?.pr ?? {
    shape: theme.particles.shape,
    colors: theme.particles.colors,
    count: theme.particles.count,
  };

  return (
    <ConfettiEffect
      colors={particleConfig.colors}
      count={particleConfig.count}
      // ...
    />
  );
}
```

## Checking Theme Pack Ownership

```typescript
import { useIsPackOwned, useThemePackStore } from '@/src/lib/themes';

function PackCard({ packId }: { packId: string }) {
  const isOwned = useIsPackOwned(packId);
  const { purchasePack, equipPack } = useThemePackStore();

  const handlePress = async () => {
    if (isOwned) {
      equipPack(packId);
    } else {
      await purchasePack(packId);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{isOwned ? 'Equip' : 'Purchase'}</Text>
    </TouchableOpacity>
  );
}
```

## Common Gotchas

### 1. Don't call hooks conditionally

```typescript
// ❌ Wrong
function MyComponent({ useTheme }) {
  if (useTheme) {
    const colors = useThemePackColors();
  }
}

// ✓ Correct
function MyComponent({ useTheme }) {
  const colors = useThemePackColors();
  const actualColors = useTheme ? colors : DEFAULT_COLORS;
}
```

### 2. Memoize computed values

```typescript
// ❌ Creates new object every render
const cardStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.border,
};

// ✓ Memoized
const cardStyle = useMemo(() => ({
  backgroundColor: colors.surface,
  borderColor: colors.border,
}), [colors.surface, colors.border]);
```

### 3. Use imperative API in callbacks

```typescript
// ❌ Stale closure
const handleEvent = () => {
  console.log(colors.accent);  // May be stale
};

// ✓ Fresh value
const handleEvent = () => {
  const theme = getResolvedTheme();
  console.log(theme.colors.accent);  // Always fresh
};
```

## Testing

When testing themed components:

```typescript
import { useThemePackStore } from '@/src/lib/themes';

beforeEach(() => {
  // Reset to default theme
  useThemePackStore.getState().resetToDefault();
});

it('should use theme colors', () => {
  // Equip a specific pack for testing
  useThemePackStore.getState().equipPack('toxic-energy');

  render(<MyComponent />);

  // Assert colors match expected pack
});
```
