# Feature: UI & Design

## Overview
Visual design, theming, components, and polish. The "mysterious, exclusive" aesthetic inspired by Pure dating app.

---

## Sub-Features

### Done - Dark Theme Foundation
- [x] Dark background (#0a0a0a)
- [x] Card backgrounds (#1a1a1a / #18181b)
- [x] Border colors (#27272a)
- [x] Text colors (white, muted)
- [x] Error/success colors

**Implementation:** `src/ui/theme.ts`

### Done - Design System Tokens
- [x] Spacing scale (4px base: x1=4, x2=8, x3=12, x4=16, x6=24, x8=32)
- [x] Border radii (card=14, pill=999, soft=8, button=10, input=12)
- [x] Typography scale (h1=32, body=16, sub=12-14)
- [x] Design system factory function
- [x] makeDesignSystem() with dark/light modes

**Implementation:** `src/ui/designSystem.ts`

### Done - Accent Color Themes
- [x] Toxic (lime green - #4ECDC4 / #60a5fa)
- [x] Electric (purple - #a78bfa)
- [x] Ember (pink - #f472b6)
- [x] Ice (cyan - #22d3ee)
- [x] Ultra (mixed gradient)

**Implementation:** `src/ui/designSystem.ts`

### Done - Rank Colors
- [x] Iron, Bronze, Silver colors
- [x] Gold, Platinum, Diamond colors
- [x] Mythic color
- [x] Tier-based color gradients

**Implementation:** `src/ui/designSystem.ts`

### Done - Tab Navigation
- [x] Bottom tab bar
- [x] Tab icons (Home, Workout, Feed, Profile)
- [x] Tab labels
- [x] Active state styling
- [x] Tab-based navigation

**Implementation:** `app/(tabs)/_layout.tsx`

### Done - Error Boundaries
- [x] Root error boundary
- [x] Tab error boundary component
- [x] Error screen UI with retry
- [x] "Try Again" recovery
- [x] Error reporting integration

**Implementation:** `src/ui/error-boundary.tsx`, `src/ui/tab-error-boundary.tsx`

---

### Done - Screen Layouts
- [x] Basic screen structure
- [x] Safe area handling
- [x] Consistent headers
- [x] Back navigation
- [x] Stack screen options

**Implementation:** `app/_layout.tsx`, individual screens

### Done - Input Components
- [x] Basic text inputs
- [x] KeyboardAwareScrollView component
- [x] Form validation UI
- [x] Error states
- [x] Loading states

**Implementation:** `src/ui/components/KeyboardAwareScrollView.tsx`

### Done - Loading States
- [x] Basic loading indicators (ActivityIndicator)
- [x] Pull-to-refresh (RefreshControl)
- [x] Skeleton screens (planned)
- [x] Loading button states

**Implementation:** `app/(tabs)/feed.tsx`, `app/chat.tsx`, `app/friends.tsx`

---

### Done - PR Celebration Animation
- [x] Full-screen celebration modal
- [x] 4-tier system based on PR magnitude
- [x] Animated entrance/exit (pop-in, glow pulse)
- [x] Sound effects integration
- [x] Haptic feedback patterns
- [x] 60 celebrations (3 PR types × 4 tiers × 5 variants)
- [x] AI-ready content system for future images
- [x] Integration with live workout flow

**Implementation:** `src/lib/celebration/`, `src/ui/components/LiveWorkout/PRCelebration.tsx`

**Tests:** 53 tests (selector, content, sound manager)

**Tiers:**
- Tier 1 (Minor PR): Basic celebrations
- Tier 2 (Moderate PR): Enhanced celebrations
- Tier 3 (Major PR): Premium celebrations
- Tier 4 (Epic PR): Legendary celebrations

**See Also:** `docs/instructions.md` for adding AI-generated images

### Done - Level Up Animation
- [x] Level-up modal component
- [x] Confetti effect (canvas-based)
- [x] Number increment animation
- [x] Currency reward display
- [x] Sound effects
- [x] Haptic feedback

**Implementation:** `src/ui/components/Gamification/LevelUpModal.tsx`

### Done - Sync Status Indicators
- [x] SyncStatusIndicator component
- [x] Compact display mode (for headers)
- [x] Full display mode (for debug)
- [x] Animated syncing state
- [x] Error display
- [x] Last synced timestamp

**Implementation:** `src/ui/components/SyncStatusIndicator.tsx`

### Done - User Profile Editing UI
- [x] Profile edit screen
- [x] Avatar display and upload
- [x] Display name input
- [x] Form validation
- [x] Loading states
- [x] Cancel/Save header buttons

**Implementation:** `app/profile/edit.tsx`

### Done - OAuth Button Component
- [x] Google OAuth button
- [x] Apple Sign In button
- [x] Loading states
- [x] Icon integration
- [x] Press feedback

**Implementation:** `src/ui/components/OAuthButton.tsx`

---

### Planned - Smooth Transitions
- [ ] Screen transition animations
- [ ] Tab switch animations
- [ ] Modal animations
- [ ] Shared element transitions

### Planned - Empty States
- [ ] No workouts state
- [ ] No friends state
- [ ] No posts state
- [ ] No search results state

### Planned - Onboarding Screens
- [x] Welcome screen
- [x] Profile setup
- [x] Personality picker
- [ ] Guided first workout (placeholder)
- [ ] Ranking system introduction

**Implementation:** `app/onboarding.tsx`

### Planned - Dark Gradients
- [ ] Gradient backgrounds
- [ ] Subtle depth
- [ ] "Pure" aesthetic refinement

### Planned - Bold Typography
- [ ] Statement headings
- [ ] Confident font weights
- [ ] Type hierarchy refinement
- [ ] Custom font integration

### Planned - Minimal Chrome
- [ ] Reduced UI elements
- [ ] More negative space
- [ ] Content-focused layouts
- [ ] Invisible controls

---

## Technical Notes

**Key Files:**
- `src/ui/designSystem.ts` - Design tokens factory
- `src/ui/theme.ts` - Theme colors hook
- `src/ui/forgerankStyle.ts` - Brand-specific styles
- `src/ui/error-boundary.tsx` - Error boundary component
- `src/ui/tab-error-boundary.tsx` - Tab-specific error boundary
- `src/ui/components/` - Reusable UI components
  - `KeyboardAwareScrollView.tsx`
  - `SyncStatusIndicator.tsx`
  - `OAuthButton.tsx`
  - `ProtectedRoute.tsx`
  - `LiveWorkout/PRCelebration.tsx`
  - `Gamification/LevelUpModal.tsx`
  - `Gamification/StatsAndRanksCard.tsx`
- `app/_layout.tsx` - Root layout
- `app/(tabs)/_layout.tsx` - Tab layout
- `app/onboarding.tsx` - Onboarding flow

**Design System Usage:**
```typescript
const ds = makeDesignSystem("dark", "toxic");

// Colors
ds.tone.bg       // #0a0a0a
ds.tone.card     // #1a1a1a
ds.tone.text     // #ffffff
ds.tone.muted    // #888888
ds.tone.accent   // Toxic lime green

// Spacing
ds.space.x4      // 16px
ds.space.x6      // 24px

// Radii
ds.radii.lg      // 20px
ds.radii.md      // 12px
```

**Theme Colors Hook:**
```typescript
const c = useThemeColors();
// c.bg, c.card, c.text, c.muted, c.border, c.accent
// c.primary, c.secondary, c.success, c.warning, c.danger
```

**Forgerank Style:**
```typescript
import { FR } from '../../src/ui/forgerankStyle';

// Spacing
FR.space.x3    // 12px
FR.space.x4    // 16px

// Typography
FR.type.h1     // { fontSize: 32, fontWeight: '900' }
FR.type.body   // { fontSize: 16, fontWeight: '700' }
FR.type.sub    // { fontSize: 14, fontWeight: '700' }

// Cards
FR.card({ card: c.card, border: c.border })
```

---

## Visual Direction

**Inspired by Pure dating app:**
- Mysterious/exclusive vibe
- Dark gradients
- Bold typography
- Minimal UI chrome
- Accent color pops
- Premium feel

**Enhanced with Forgerank-Specific Aesthetic:**
- Layered approach: PURE's emotional personality over LIFTOFF's functional efficiency
- Multiple color palette options with emotional meaning
- Hand-drawn illustration style with surreal/psychedelic elements
- Typography system balancing functional clarity with personality
- Emotional language/copy for key moments

**Complete Visual Style Documentation:**
See `docs/visual-style/` directory for comprehensive visual design specifications:
- `ui-aesthetic-implementation.md` - Complete implementation strategy
- `visual-style-guide.md` - Detailed design specifications
- `implementation-roadmap.md` - Phased approach with timelines

**Color Palette:**
```
Background: #0a0a0a (near black)
Card:       #18181b (dark gray)
Border:     #27272a (medium gray)
Text:       #fafafa (off-white)
Muted:      #a1a1aa (gray)
Accent:     #4ECDC4 (toxic cyan)
```

**Typography:**
- Headings: Font weight 900 (extra bold)
- Body: Font weight 700 (bold)
- Sub: Font weight 700 (bold)
- Sizes: 32, 18, 16, 14, 12

**Spacing Scale:**
- x1: 4px
- x2: 8px
- x3: 12px
- x4: 16px
- x6: 24px
- x8: 32px

**Border Radii:**
- Card: 14px
- Pill: 999px (circle)
- Soft: 8px
- Button: 10px
- Input: 12px

**Target Audience:**
- Young lifters (18-30)
- Aesthetic-focused
- Social media savvy
- Premium expectations

---

## Components Library

**Form Components:**
- `KeyboardAwareScrollView` - Auto-scrolling form container
- `OAuthButton` - Google/Apple sign-in buttons
- Protected inputs with validation
- Error state styling

**Feedback Components:**
- `SyncStatusIndicator` - Sync status display
- `PRCelebration` - PR achievement modal
- `LevelUpModal` - Level-up celebration
- `StatsAndRanksCard` - Gamification stats

**Navigation Components:**
- Tab bar
- Stack headers
- Back buttons
- Modal presentations

**Data Display Components:**
- Exercise cards
- Workout set displays
- Feed post cards
- User avatars

---

## Animation Guidelines

**Celebrations:**
- Pop-in entrance (spring physics)
- Glow pulse effect
- Confetti particles
- Haptic feedback on key moments

**Transitions:**
- Quick, snappy (150-200ms)
- Ease-out curves
- No janky animations
- Respect reduce motion setting

**Feedback:**
- Button press: Scale down to 0.95
- Loading: Spinner with smooth rotation
- Success: Brief flash or checkmark
- Error: Shake animation

---

## Accessibility

**Color Contrast:**
- All text meets WCAG AA (4.5:1)
- Icons have adequate contrast
- Error states are clearly visible

**Touch Targets:**
- Minimum 44x44px for buttons
- Adequate spacing between interactive elements
- Keyboard avoidance on forms

**Screen Reader Support:**
- Semantic components
- Accessibility labels on icons
- Announced state changes

---

## Dependencies

- React Native Animated
- React Native Reanimated (future)
- Haptics (expo-haptics)
- Audio (expo-av)
- Canvas (for confetti)
