# Toxic Energy Palette - Visual Analysis

**Last Updated:** 2026-02-03

High-fidelity UI mockups showcasing a vibrant neon/cosmic aesthetic with toxic lime and magenta energy effects.

---

## Image Inventory

| File | Screen Type |
|------|-------------|
| `4d1a6abf-...` | Social Feed (compact) |
| `64c5d3dc-...` | Social Feed (detailed) |
| `8bfe1e0e-...` | Routines Screen |
| `cbf7bbca-...` | Social Feed with Level Up |
| `d698f8cc-...` | Live Workout Logging |
| `dd8bb05b-...` | Body Stats / Ranks |
| `f38f47f5-...` | Calendar / History |
| `Toxic Energy...ChatGPT...` | Illustrated Social Feed (alternate style) |

---

## Screen-by-Screen Analysis

### 1. Social Feed (Compact)
- **Layout:** Vertical feed with user workout cards
- **Features:**
  - User avatars with level badges (Lv.18, Lv.18)
  - Dual exercise entries per post with rank badges
  - XP rewards displayed (+198 PLATINUM XP)
  - Engagement metrics (hearts, comments, shares)
- **Style:** Deep space background, magenta/cyan gradients, golden coin indicators

### 2. Social Feed (Detailed)
- **Layout:** Expanded workout posts with more stats
- **Features:**
  - Platinum/Gold rank progression bars (2,120/25000 XP)
  - Detailed set info (300 x 3, 175 x 8)
  - User captions with motivational text
  - Higher engagement numbers (530, 210, 143)
- **Visual:** Realistic user photos, vibrant card borders

### 3. Routines Screen
- **Layout:** Recommendation + saved routines list
- **Features:**
  - "Recommended Workout Today" with motivational quote
  - Neon wireframe body illustration
  - "Build Routine" / "Freestyle Workout" CTAs
  - Routine cards with exercise icons and stats
- **Unique:** Glowing skeletal/wireframe avatar figure

### 4. Social Feed with Level Up
- **Layout:** Feed with prominent level-up celebration
- **Features:**
  - Large "LEVEL UP!" badge overlay (Lv.19)
  - Friends/Region/Global filter tabs
  - Shield/trophy iconography
  - XP reward callouts
- **Celebration:** Orange/gold level-up banner with chevron design

### 5. Live Workout Logging
- **Layout:** Active workout tracking interface
- **Features:**
  - Large timer display (00:00:04)
  - Exercise card with set table (SET, PREV, LBS, REPS)
  - Checkmark completion indicators
  - "TO NEXT RANK" progress indicator (85x10)
  - Rest timer toggle with duration
- **UX:** Clean data entry, prominent "+ ADD SET" buttons

### 6. Body Stats / Ranks
- **Layout:** Dual anatomical figures with rank overlays
- **Features:**
  - Front/back body views with muscle highlighting
  - Rank badges per muscle group (Platinum III, Gold I, Bronze II)
  - "Top Muscle Ranks" summary table
  - "Top Lifts & Ranks" with specific weights
- **Visual:** Glowing orange/yellow anatomical outline, cosmic background

### 7. Calendar / History
- **Layout:** Monthly calendar grid with workout indicators
- **Features:**
  - Calendar with workout thumbnails on specific days
  - Rank-up badges (BRONZE II, PLATINUM I) on achievement days
  - Date navigation (Monday, April 22)
  - Preview cards for selected workout
- **Style:** Purple/magenta calendar cells, neon highlights

### 8. Illustrated Social Feed (Alternate)
- **Branding:** "FLEX & CONNECT" header
- **Style:** Cartoon/illustrated characters (not photo-realistic)
- **Features:**
  - Mascot characters (demon/imp figures)
  - Stylized user avatars
  - "GYMBROS" tab navigation
  - +5 LP rewards, BRONZE rank badges
- **Aesthetic:** Mobile game style, playful and energetic

---

## Design System Extraction

### Color Palette

| Element | Color | Hex (approx) |
|---------|-------|--------------|
| Background | Deep purple/black | `#0a0510`, `#1a0a20` |
| Primary accent | Toxic lime/yellow | `#ccff00`, `#dfff00` |
| Secondary accent | Hot magenta | `#ff00ff`, `#ff1493` |
| Tertiary accent | Cyan/electric blue | `#00ffff`, `#00bfff` |
| Platinum rank | Silver/white | `#e5e5e5`, `#c0c0c0` |
| Gold rank | Golden yellow | `#ffd700`, `#ffcc00` |
| Bronze rank | Orange/copper | `#cd7f32`, `#b87333` |
| Card background | Dark purple glass | `rgba(30,10,40,0.85)` |
| Text primary | White | `#ffffff` |
| Text secondary | Light purple | `#b8a0c8` |

### Visual Effects

- **Cosmic particles:** Colorful star/energy particles throughout
- **Neon glow:** Strong bloom effects on accents
- **Gradient borders:** Cards have rainbow/spectrum edge glow
- **Energy trails:** Wispy light effects suggesting motion
- **Glass morphism:** Frosted glass card backgrounds

### Typography

- **Headers:** Bold sans-serif, often with glow effect
- **Stats:** Large, high-contrast numbers
- **Labels:** Uppercase for rank names

### UI Components

- **Rank badges:** Rounded rectangles with tier colors
- **Progress bars:** Gradient fill with glow
- **Cards:** Rounded corners, gradient glow borders
- **Buttons:** Pill-shaped with neon outline
- **Bottom nav:** 4-5 icons with glow indicator
- **Avatar frames:** Circular with colored ring indicating level
- **XP displays:** Prominent with "+XP" callouts

---

## Implementation Notes

This palette is the **current "Pure" aesthetic** referenced in the design system - dark, mysterious, high energy.

**Best suited for:**
- Default dark theme
- "Toxic" accent color scheme
- Core app identity

**Technical considerations:**
- Particle effects need performance optimization
- Glow effects via box-shadow and filter: blur
- Consider prefers-reduced-motion for accessibility
- Gradient borders via pseudo-elements or border-image

**Variations observed:**
- Photo-realistic user content (most screens)
- Illustrated/cartoon style (ChatGPT alternate)
- The illustrated style could be a "fun mode" or kids-friendly option

**Brand alignment:**
- High energy, motivating aesthetic
- Appeals to younger/gaming audience
- Differentiates from clinical fitness apps
- "Toxic" naming fits lime green accent perfectly
