# Iron Forge Palette - Visual Analysis

**Last Updated:** 2026-02-03

High-fidelity UI mockups showcasing a medieval/fantasy blacksmith forge aesthetic for GymRats.

---

## Image Inventory

| File | Screen Type |
|------|-------------|
| `0d59bf67-...` | Body Stats / Rank Overview |
| `0db86727-...` | Social Feed |
| `37c23990-...` | Routines Screen |
| `c0efa81b-...` | History / Calendar View |
| `ed4384f4-...` | Routines with Stats Ring |

---

## Screen-by-Screen Analysis

### 1. Body Stats / Rank Overview
- **Layout:** Armored warrior figure with muscle group callouts
- **Features:**
  - Rank badges per muscle (Steel II, Iron II, Emerald II)
  - Body diagram with rank indicators on each limb
  - "Next Rank Up" progression card
  - Horizontal rank ladder visualization
- **Visual style:** Medieval armor aesthetic, orange/gold accents, dark metallic background

### 2. Social Feed
- **Layout:** Vertical feed of user workout posts
- **Features:**
  - User avatars with realistic portraits
  - Dual rank badges per post (e.g., "Iron II" + "Steel II")
  - Engagement metrics (likes, comments)
  - Personal captions with emoji support
- **Style:** Dark cards with subtle metallic borders, warm lighting

### 3. Routines Screen
- **Layout:** Featured routine card + routine list
- **Features:**
  - "Today's Recommended Workout" hero card
  - "Build a Routine" / "Freestyle Workout" CTAs
  - Routine cards with duration, difficulty, last used date
  - Dumbbell/equipment icons per routine
- **Visual elements:** Forge/anvil imagery, orange glow effects

### 4. History / Calendar View
- **Layout:** Weekly calendar grid + achievement cards
- **Features:**
  - Calendar with workout thumbnails per day
  - Rank-up indicators on specific days
  - Achievement cards ("Iron Warrior - 100 Workouts", "Personal Best!")
  - Milestone celebrations with badge artwork
- **Style:** Gritty, textured backgrounds, warm amber tones

### 5. Routines with Stats Ring
- **Layout:** Circular stats display + routine list
- **Features:**
  - Large "123lbs" record display with circular progress
  - Category filters (Hypertrophy, Endurance, All)
  - Detailed routine cards with intermediate/advanced tags
  - Equipment icons and last-used timestamps
- **Design:** Ring/gauge aesthetic matches forge theme

---

## Design System Extraction

### Color Palette

| Element | Color | Hex (approx) |
|---------|-------|--------------|
| Background | Dark charcoal | `#1a1a1a`, `#0d0d0d` |
| Primary accent | Forge orange | `#ff6600`, `#ff8c00` |
| Secondary accent | Gold/Amber | `#ffd700`, `#daa520` |
| Iron rank | Gray steel | `#708090` |
| Steel rank | Blue steel | `#4682b4` |
| Emerald rank | Green | `#50c878` |
| Card background | Dark brown | `#2a2015` |
| Text primary | Warm white | `#f5f5dc` |
| Text secondary | Muted tan | `#a0906a` |

### Visual Effects

- **Metallic textures:** Brushed steel, hammered iron surfaces
- **Warm lighting:** Orange/amber glow from forge fire
- **Vignette:** Darker edges creating focus on center content
- **Embossed elements:** Raised metal appearance on badges

### Typography

- **Headers:** Medieval-inspired, possibly serif with weight
- **Body:** Clean sans-serif for readability
- **Rank labels:** All-caps with metallic styling

### UI Components

- **Rank badges:** Shield/banner shapes with metallic borders
- **Progress bars:** Horizontal with ember glow
- **Cards:** Dark with subtle gradient, metallic border accents
- **Buttons:** Rounded with orange glow, embossed appearance
- **Bottom nav:** Icon-based with warm highlight for active tab
- **Calendar cells:** Thumbnail images with rank overlay badges

---

## Implementation Notes

This palette represents a **thematic premium direction** - RPG/fantasy aesthetic that gamifies the workout experience.

**Best suited for:**
- Default/core theme option
- Appeals to gaming audience
- Reinforces "forging" brand identity

**Technical considerations:**
- Texture assets needed for backgrounds
- Metallic effects via gradients (no heavy filters)
- Warm color temperature throughout
- Consider light theme variant with parchment/stone textures

**Brand alignment:**
- Directly supports "GymRats" naming
- Blacksmith metaphor: forging your body like metal
- Rank tiers feel like crafting progression (Iron → Steel → Emerald → etc.)
