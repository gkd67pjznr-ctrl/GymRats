# Forgerank Visual Style Guide

## Color Palette System

### Foundation Colors
- **Primary Background**: `#0A0A0A` (Deep Black)
- **Secondary Background**: `#1A1A1A` (Charcoal)
- **Card Background**: `#2A2A2A` (Dark Gray)
- **Border/Divider**: `#3A3A3A` (Medium Gray)
- **Text Primary**: `#FFFFFF` (Pure White)
- **Text Secondary**: `#CCCCCC` (Light Gray)
- **Text Tertiary**: `#999999` (Gray)

### Emotional Accent Colors

#### Toxic Energy Palette
- **Primary Accent**: `#FF00FF` (Magenta)
- **Secondary Accent**: `#00FFFF` (Electric Blue)
- **Highlight**: `#FFFF00` (Yellow)
- **Success**: `#00FF00` (Lime Green)

#### Iron Forge Palette
- **Primary Accent**: `#4B0082` (Indigo)
- **Secondary Accent**: `#CD7F32` (Bronze)
- **Highlight**: `#FFA500` (Orange)
- **Success**: `#32CD32` (Lime Green)

#### Neon Glow Palette
- **Primary Accent**: `#39FF14` (Neon Green)
- **Secondary Accent**: `#FF1493` (Deep Pink)
- **Highlight**: `#00BFFF` (Deep Sky Blue)
- **Success**: `#7CFC00` (Lawn Green)

#### Cosmic Strength Palette
- **Primary Accent**: `#00008B` (Dark Blue)
- **Secondary Accent**: `#C0C0C0` (Silver)
- **Highlight**: `#9370DB` (Medium Purple)
- **Success**: `#00FA9A` (Medium Spring Green)

## Typography System

### Font Family Hierarchy
- **Display/Headlines**: Modern Sans Serif with personality (Bold weight emphasized)
- **Body Text**: Clean, readable sans serif
- **Monospace**: For data and metrics

### Font Weights & Sizes
- **Display Large**: 32px, Bold
- **Display Medium**: 24px, Bold
- **Display Small**: 20px, Bold
- **Headline**: 18px, Semi-Bold
- **Body Large**: 16px, Regular
- **Body Medium**: 14px, Regular
- **Body Small**: 12px, Regular
- **Caption**: 10px, Light

### Personality Treatments
- **Motivational Text**: Bold + Slight letter spacing variation
- **Quote Display**: Hand-drawn inspired treatment
- **Data Labels**: Clean, consistent spacing
- **Achievement Titles**: Bold + Color accent

## Illustration Style Guide

### Artistic Characteristics
- **Line Work**: Hand-drawn with slight imperfections
- **Shapes**: Organic but geometric, representing strength
- **Colors**: Limited palette matching accent schemes
- **Texture**: Subtle grain for tactile feel
- **Movement**: Dynamic, energetic compositions

### Illustration Categories

#### Strength & Power Icons
- Abstract force representations
- Dynamic muscle tension visuals
- Energy burst motifs
- Geometric interpretations of effort

#### Growth & Progression Art
- Evolving shape series
- Layered development illustrations
- Organic growth patterns
- Level-up visual metaphors

#### Abstract Energy Elements
- Particle effects and flows
- Kinetic line work
- Light burst compositions
- Gradient energy representations

#### Health & Recovery Imagery
- Calming organic forms
- Balanced composition layouts
- Soothing color applications
- Wellness-inspired motifs

### Usage Guidelines
- **Small Icons**: 24x24px to 48x48px
- **Medium Illustrations**: 64x64px to 128x128px
- **Large Artwork**: 256x256px and above
- **Aspect Ratios**: 1:1, 4:3, 16:9 standard formats
- **File Formats**: SVG primary, PNG fallback

## Iconography System

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

### Color Application
- **Active States**: Primary accent color
- **Passive States**: Text secondary color
- **Disabled States**: Text tertiary color
- **Success States**: Success color
- **Warning States**: Highlight color

## Layout & Spacing

### Grid System
- **Base Unit**: 8px
- **Columns**: 4-column on mobile, 8-column on tablet, 12-column on desktop
- **Gutters**: 16px standard, 24px for content sections
- **Max Width**: 1200px for main content area

### Spacing Scale
- **XXS**: 4px
- **XS**: 8px
- **S**: 16px
- **M**: 24px
- **L**: 32px
- **XL**: 48px
- **XXL**: 64px

### Component Spacing
- **Buttons**: 16px height minimum, 24px padding
- **Cards**: 16px padding, 24px gap between
- **Form Fields**: 16px height minimum, 16px vertical spacing
- **Navigation**: 48px height for main nav, 32px for secondary

## Animation Principles

### Motion Philosophy
- **Purpose**: Enhance understanding, not decoration
- **Timing**: Quick (150ms) for micro-interactions, Moderate (300ms) for transitions
- **Easing**: Standard curves with personality
- **Feedback**: Immediate visual response to user actions

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

### Animation Guidelines
- **Performance**: 60fps target, SVG where possible
- **Accessibility**: Respect prefers-reduced-motion setting
- **Consistency**: Shared timing and easing across app
- **Meaning**: Every animation should serve a purpose

## Component Design Tokens

### Shadows
- **Elevation 1**: 0 1px 2px rgba(0,0,0,0.2)
- **Elevation 2**: 0 4px 8px rgba(0,0,0,0.2)
- **Elevation 3**: 0 8px 16px rgba(0,0,0,0.2)
- **Focus Ring**: 0 0 0 2px primary accent color

### Borders & Radii
- **Sharp**: 0px
- **Soft**: 4px
- **Rounded**: 8px
- **Pill**: 9999px

### Opacity Levels
- **Disabled**: 40%
- **Overlay**: 60%
- **Hover**: 80%
- **Focus**: 100%

## Brand Personality Expression

### Visual Voice
- **Confident**: Bold colors and clear hierarchy
- **Honest**: Realistic imagery and direct copy
- **Motivational**: Upbeat but grounded messaging
- **Distinctive**: Unique style that stands out

### Emotional Quality
- **Intensity**: Represented through dynamic compositions
- **Progress**: Shown through evolving visual elements
- **Strength**: Conveyed through powerful forms and bold colors
- **Growth**: Illustrated through organic, developing shapes

### Consistency Principles
- **Adaptability**: Style works across all screen sizes
- **Scalability**: System can grow with new features
- **Accessibility**: Meets WCAG standards for contrast and interaction
- **Performance**: Visual enhancements don't compromise speed

## Implementation Notes

### Technical Considerations
- Use CSS custom properties for theme switching
- SVG for all illustrations and icons
- Optimized PNG for complex raster graphics
- Lazy loading for non-critical visual elements
- Fallbacks for all personality enhancements

### File Organization
```
/src/assets/
  ├── illustrations/
  │   ├── strength/
  │   ├── growth/
  │   ├── energy/
  │   └── health/
  ├── icons/
  │   ├── actions/
  │   ├── equipment/
  │   ├── ui/
  │   └── achievements/
  └── themes/
      ├── toxic-energy.json
      ├── iron-forge.json
      ├── neon-glow.json
      └── cosmic-strength.json
```

### Performance Targets
- Core app load time: < 3 seconds
- Illustration load time: < 200ms (cached)
- Animation frame rate: 60fps minimum
- Color palette switch: < 100ms
- Theme system memory overhead: < 50KB

This style guide provides the foundation for implementing Forgerank's unique aesthetic while maintaining the functional efficiency users need for effective workout tracking.