# Forgerank Theme System

## Overview

The Forgerank theme system provides a comprehensive theming solution that goes beyond simple color changes. Each theme includes:

- Unique color palettes with emotional meaning
- Themed typography with personality treatments
- Custom illustrations and icons
- Audio feedback for achievements
- Animation and haptic feedback profiles

## Theme Components

### 1. Theme Database
Located in `src/lib/themeDatabase.ts`, this file defines:
- Default theme palettes (5 themes)
- Typography styles
- Illustration assets
- Audio files
- Motion profiles
- Theme configurations

### 2. Theme Store
Located in `src/lib/stores/themeStore.ts`, this Zustand store manages:
- Active theme state
- Theme persistence
- Theme switching functionality

### 3. UI Components
Located in `src/ui/components/`, these components demonstrate themed UI:
- `ThemeCard.tsx` - Theme selection card
- `ThemePreview.tsx` - Theme preview component
- `ThemedButton.tsx` - Button with theme colors
- `NavigationCard.tsx` - Navigation card with icons

### 4. Illustrations Gallery
Located in `app/profile/illustrations.tsx`, this screen allows users to:
- Browse all available illustrations by category
- Preview illustration styles and animations
- Activate premium and legendary illustrations
- See the active illustration in use

## Theme Selection UI

The theme selection UI includes:

### Theme Selection Screen
Located in `app/profile/themes.tsx`:
- Grid of theme cards
- Active theme indicator
- Premium/Legendary badges
- Theme preview
- Theme demo link
- Illustrations gallery link

### Theme Demo Screen
Located in `app/profile/theme-demo.tsx`:
- Active theme preview
- Themed button examples
- Theme information
- Illustrations gallery link

## Adding New Themes

To add a new theme:

1. Add a new palette to `DEFAULT_PALETTES` in `src/lib/themeDatabase.ts`
2. Add a new configuration to `DEFAULT_CONFIGURATIONS`
3. The theme will automatically appear in the theme selection UI

## Using Themes in Components

To use the active theme in components:

```tsx
import { useActivePalette } from "@/src/lib/stores/themeStore";
import { useThemeColors } from "@/src/ui/theme";

function MyComponent() {
  const c = useThemeColors(); // Basic theme colors
  const activePalette = useActivePalette(); // Extended theme palette

  return (
    <View style={{ backgroundColor: activePalette?.colors.primary }}>
      <Text style={{ color: c.text }}>Themed text</Text>
    </View>
  );
}
```

## Theme Types

### Free Themes
- Toxic Energy
- Iron Forge

### Premium Themes
- Neon Glow
- Cosmic Strength

### Legendary Themes
- Legendary Mystery

Legendary themes provide a complete app transformation with unique personalities, theme overrides, SFX, and voice lines.