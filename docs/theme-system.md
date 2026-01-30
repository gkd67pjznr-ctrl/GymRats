# Theme System Documentation

## Overview

The Forgerank theme system implements a layered approach that combines PURE's emotional personality with LIFTOFF's functional efficiency. This system provides:

1. **Multiple color palette options** with emotional meaning rather than semantic state
2. **Typography system** balancing functional clarity with personality-driven treatments
3. **Illustration style** with hand-drawn aesthetic and surreal/psychedelic elements
4. **Theme persistence** across app sessions

## Architecture

### Theme Database (`src/lib/themeDatabase.ts`)

Manages the storage and retrieval of UI themes with the following entities:

- **ThemePalette**: Color schemes with emotional meaning
- **ThemeTypography**: Typography styles with personality treatments
- **ThemeIllustration**: Illustration styles with fitness-specific themes
- **ThemeConfiguration**: Complete theme configurations combining the above

### Theme Store (`src/lib/stores/themeStore.ts`)

Zustand store that manages the active theme state with persistence using AsyncStorage.

### Theme Provider (`src/ui/theme/ThemeProvider.tsx`)

React context provider that makes theme data available throughout the app.

### Theme Design System Hook (`src/ui/hooks/useThemeDesignSystem.ts`)

Hook that combines theme data with the existing design system to create a complete theme.

## Usage

### Setting the Active Theme

```typescript
import { useTheme } from '@/src/ui/theme';

const { setActiveTheme } = useTheme();

// Set the active theme configuration
setActiveTheme('default-dark');
```

### Accessing Theme Data

```typescript
import { useTheme } from '@/src/ui/theme';
import { useThemeDesignSystem } from '@/src/ui/hooks';

const { palette, typography, illustration } = useTheme();
const designSystem = useThemeDesignSystem();
```

## Available Themes

### Color Palettes

1. **Toxic Energy** (`toxic-energy`) - High-intensity moments with vibrant magenta and electric blue
2. **Iron Forge** (`iron-forge`) - Power and intensity with deep purple and bronze gold
3. **Neon Glow** (`neon-glow`) - Bold and vibrant with electric lime and hot pink (Premium)
4. **Cosmic Strength** (`cosmic-strength`) - Deep and powerful with deep blue and silver (Premium)
5. **Legendary Mystery** (`legendary-mystery`) - Theme-warping presence with unique personality (Legendary)

## Extending the Theme System

### Adding New Palettes

Add new palettes to the `DEFAULT_PALETTES` array in `src/lib/themeDatabase.ts`:

```typescript
{
  id: 'new-palette',
  name: 'New Palette',
  description: 'Description of the emotional meaning',
  primary: '#FF0000',
  secondary: '#00FF00',
  accent: '#0000FF',
  soft: '#111111',
  emotionalMeaning: 'Emotion',
  isPremium: false,
  isLegendary: false,
}
```

### Adding New Typography Styles

Add new typography styles to the `DEFAULT_TYPOGRAPHY` array in `src/lib/themeDatabase.ts`:

```typescript
{
  id: 'new-typography',
  name: 'New Typography',
  primaryFont: 'System',
  headingWeight: '900',
  bodyWeight: '700',
  personalityTreatment: 'bold',
  isPremium: false,
}
```

## Integration with Existing Design System

The theme system integrates with the existing `src/ui/designSystem.ts` by mapping theme palettes to the existing accent system. This ensures backward compatibility while providing the enhanced theming capabilities.

For complete visual style documentation, see the files in `docs/visual-style/`:
- `ui-aesthetic-implementation.md` - Complete implementation strategy
- `visual-style-guide.md` - Detailed design specifications
- `implementation-roadmap.md` - Phased approach with timelines