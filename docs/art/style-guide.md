# GymRats Visual Style Guide

**Consolidated Guide** - Combined from `visual-style-guide.md` and `ui-aesthetic-implementation.md`

---

## Design Philosophy

### Core Approach
GymRats uses a **layered approach** that combines emotional personality over functional efficiency:
- **Foundation**: Functional components for core workout logging (performance-first)
- **Personality Layer**: Emotional elements for key moments (celebrations, achievements)
- **Themes**: Multiple color palettes expressing feeling rather than function

### Visual Voice
- **Confident**: Bold colors and clear hierarchy
- **Honest**: Realistic imagery and direct copy
- **Motivational**: Upbeat but grounded messaging
- **Distinctive**: Unique style that stands out from corporate designs

---

## Color Palette System

### Foundation Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary Background | `#0A0A0A` | Deep Black - main bg |
| Secondary Background | `#1A1A1A` | Charcoal - elevated surfaces |
| Card Background | `#2A2A2A` | Dark Gray - cards |
| Border/Divider | `#3A3A3A` | Medium Gray - borders |
| Text Primary | `#FFFFFF` | Pure White - main text |
| Text Secondary | `#CCCCCC` | Light Gray - secondary text |
| Text Tertiary | `#999999` | Gray - muted text |

### Theme Palettes

#### Toxic Energy (Default)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Lime | `#ADFF2F` |
| Secondary | Magenta | `#FF00FF` |
| Success | Lime | `#ADFF2F` |
| Mood | Electric, aggressive |

#### Iron Forge
| Role | Color | Hex |
|------|-------|-----|
| Primary | Orange | `#FF6B35` |
| Secondary | Gold | `#FFB347` |
| Success | Green | `#4CAF50` |
| Mood | Gritty, powerful |

#### Neon Glow
| Role | Color | Hex |
|------|-------|-----|
| Primary | Magenta | `#FF00FF` |
| Secondary | Cyan | `#00FFFF` |
| Success | Teal | `#00FF88` |
| Mood | Futuristic, vibrant |

#### Infernal Cosmos (Premium)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep Red | `#FF2D2D` |
| Secondary | Purple | `#8B2FF5` |
| Success | Orange | `#FF8C00` |
| Mood | Intense, cosmic |

### Rank Colors
| Rank | Hex | Usage |
|------|-----|-------|
| Iron | `#71797E` | Beginner |
| Bronze | `#CD7F32` | Intermediate |
| Silver | `#C0C0C0` | Advanced |
| Gold | `#FFD700` | Elite |
| Platinum | `#E5E4E2` | Expert |
| Diamond | `#B9F2FF` | Master |
| Mythic | Theme Accent | Legendary |

---

## Typography System

### Font Family Hierarchy
- **Display/Headlines**: Modern Sans Serif (Bold weight)
- **Body Text**: Clean, readable sans serif
- **Monospace**: For data, metrics, and numbers (SpaceMono)

### Font Sizes & Weights
| Role | Size | Weight |
|------|------|--------|
| Display Large | 32px | Bold |
| Display Medium | 24px | Bold |
| Display Small | 20px | Bold |
| Headline | 18px | Semi-Bold |
| Body Large | 16px | Regular |
| Body Medium | 14px | Regular |
| Body Small | 12px | Regular |
| Caption | 10px | Light |

### Personality Treatments
- **Motivational Text**: Bold + slight letter spacing variation
- **Quote Display**: Hand-drawn inspired treatment
- **Data Labels**: Clean, consistent spacing
- **Achievement Titles**: Bold + color accent

---

## Illustration Style

### Artistic Direction
- **Style**: Hand-drawn aesthetic with surreal/psychedelic elements
- **Personality**: Anti-corporate, indie-inspired
- **Line Work**: Slight imperfections for human feel
- **Colors**: Limited palette matching accent schemes
- **Texture**: Subtle grain for tactile feel
- **Movement**: Dynamic, energetic compositions

### Categories

#### Strength & Power
- Abstract force representations
- Dynamic muscle tension visuals
- Energy burst motifs
- Geometric interpretations of effort

#### Growth & Progression
- Evolving shape series
- Layered development illustrations
- Organic growth patterns
- Level-up visual metaphors

#### Abstract Energy
- Particle effects and flows
- Kinetic line work
- Light burst compositions
- Gradient energy representations

### Size Guidelines
| Use Case | Size |
|----------|------|
| Small Icons | 24x24px - 48x48px |
| Medium Illustrations | 64x64px - 128x128px |
| Large Artwork | 256x256px and above |
| File Formats | SVG primary, PNG fallback |

---

## Iconography

### Style Principles
- **Line Weight**: Consistent 2px stroke
- **Corners**: Slightly rounded (2px radius)
- **Details**: Minimal but recognizable
- **Perspective**: Isometric where appropriate

### Icon Categories
1. **Workout Actions**: Lifting, cardio, stretching
2. **Equipment**: Barbells, dumbbells, machines
3. **Body Parts**: Muscle groups, joints
4. **UI Functions**: Navigation, actions, states
5. **Achievements**: Badges, trophies, milestones

### State Colors
| State | Color Source |
|-------|-------------|
| Active | Primary accent |
| Passive | Text secondary |
| Disabled | Text tertiary |
| Success | Success color |
| Warning | Highlight color |

---

## Layout & Spacing

### Grid System
- **Base Unit**: 8px
- **Mobile Columns**: 4
- **Tablet Columns**: 8
- **Desktop Columns**: 12
- **Gutters**: 16px standard, 24px for content sections
- **Max Width**: 1200px

### Spacing Scale
| Token | Value |
|-------|-------|
| XXS | 4px |
| XS | 8px |
| S | 16px |
| M | 24px |
| L | 32px |
| XL | 48px |
| XXL | 64px |

### Component Spacing
- **Buttons**: 16px height minimum, 24px padding
- **Cards**: 16px padding, 24px gap between
- **Form Fields**: 16px height minimum, 16px vertical spacing
- **Navigation**: 48px height (main), 32px (secondary)

---

## Animation Principles

### Motion Philosophy
- **Purpose**: Enhance understanding, not decoration
- **Timing**: Quick (150ms) for micro-interactions, Moderate (300ms) for transitions
- **Performance**: 60fps target
- **Accessibility**: Respect prefers-reduced-motion

### Animation Types

#### Micro-interactions
- Button hover/focus states
- Icon transformations
- Input field validation
- Toggle switches

#### Transitions
- Page navigation
- Modal appearance/dismissal
- Panel expansions
- Tab switching

#### Celebratory Moments
- PR achievement reveals
- Rank-up animations
- Badge unlocks
- Completion celebrations

### Theme Motion Modifiers
| Theme | Character | Effect |
|-------|-----------|--------|
| Iron Forge | Heavy, impact | Camera shake on legendary |
| Toxic Energy | Fast, aggressive | Glitch effect on entry |
| Neon Glow | Smooth, fluid | Light trail effect |

---

## Component Design Tokens

### Shadows
| Level | Value |
|-------|-------|
| Elevation 1 | `0 1px 2px rgba(0,0,0,0.2)` |
| Elevation 2 | `0 4px 8px rgba(0,0,0,0.2)` |
| Elevation 3 | `0 8px 16px rgba(0,0,0,0.2)` |
| Focus Ring | `0 0 0 2px [primary accent]` |

### Borders & Radii
| Name | Value |
|------|-------|
| Sharp | 0px |
| Soft | 4px |
| Rounded | 8px |
| Pill | 9999px |

### Opacity Levels
| State | Opacity |
|-------|---------|
| Disabled | 40% |
| Overlay | 60% |
| Hover | 80% |
| Focus | 100% |

---

## Emotional Language

### Tone: Confident but Realistic
Copy examples for key moments:

| Moment | Copy |
|--------|------|
| Workout Start | "Time to earn it." |
| Workout Completion | "You showed up. That's what matters." |
| Personal Record | "That's a statement lift." |
| Rank Progression | "You climbed. Respect." |
| Rest Timer | "Recovery is where champions are made." |
| Empty State | "Your journey starts with showing up." |

### Application
- Core logging: Minimal, functional text
- Emotional moments: Personality-driven copy
- Achievement displays: Celebratory but grounded

---

## Implementation Notes

### Technical Considerations
- CSS custom properties for theme switching
- SVG for all illustrations and icons
- Optimized PNG for complex raster graphics
- Lazy loading for non-critical visual elements
- Fallbacks for all personality enhancements

### Performance Targets
| Metric | Target |
|--------|--------|
| Core app load | < 3 seconds |
| Illustration load | < 200ms (cached) |
| Animation frame rate | 60fps minimum |
| Color palette switch | < 100ms |
| Theme memory overhead | < 50KB |

---

## Related Documentation

- [Theme System](./themes/theme-system.md) - How the theme system works
- [Theme Pack Migration](./themes/THEME-PACK-MIGRATION.md) - Migration guide
- [Theme Implementation Plan](./themes/theme-implementation-plan.md) - Detailed implementation
- [Cue System Implementation](./implementation/cue-system-implementation.md) - Visual cue system
- [Asset Integration Guide](./implementation/asset-integration-guide.md) - Asset loading
- [Exercise Icon Style Guide](./generation/EXERCISE-ICON-STYLE-GUIDE.md) - Exercise icon generation
