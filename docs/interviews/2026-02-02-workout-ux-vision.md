# Workout UX Vision Interview
**Date:** 2026-02-02
**Topic:** Complete redesign of workout logging experience

---

## Questions & Answers

### Q1: What should the PRIMARY entry point be?

**Answer:** The current "Workout" tab (dumbbell icon in bottom navigation) will become a **"hub" page** with:

- Fun info/stats at the top
- Entry point buttons/icons below:
  - **Routines** icon
  - **Find Routines** icon
  - **Your Routines** icon (folder listing created + started pre-made routines)
  - No "Resume" button needed (collapsible drawer handles this)

**The BIG change:** Once a workout starts, a **dynamic collapsible page** slides in from the right. This page:

- **IS the workout** - when active, denotes an active workout in progress
- **Collapsible** via swipe gesture (right swipe to collapse)
- **Expandable** via swipe from right edge of screen (left swipe to expand)
- When collapsed, a **thin edge remains visible** on right side for easy re-expansion
- Contains **everything**: sets, logging, finish button, share to social
- Data **only saves on "Complete Workout"** (not every keystroke)
- Complete button: arrow or icon in top-right corner

**Purpose:** Creates dynamic UX, feels modern, gives user feeling of control, uses swipe gestures, and makes using rest of app features while having active workout much more seamless. Frees up the Workout tab for hub content.

---

### Q2: How prominent should the RANK/SCORE be during the workout?

**Answer:** Show when user PRs, plus each exercise card needs small useful data:

- **User's rank** for that exercise (small tier icon)
- **User's last PR** (small text)
- **"Rank up at..."** hint showing what e1RM or weight+reps needed for next rank

All info should be quite small on each exercise card to avoid clunkiness. May need to dial back if too much.

---

### Q3: What's your vision for the set logging UX?

**Answer:** Manual entry with one small feature:

- **Small text above weight/reps inputs** showing current personal best
- **Tappable** - pressing that text populates current set with that data
- Makes it seamless to see previous performance and quickly match/beat it

---

### Q4: What apps inspire the feel you're going for?

**Answer:**
- **Liftoff** - primary inspiration
- **JEfit** - secondary inspiration
- **Fitbod** - minimal inspiration

Most workout apps are similar in their logging experience, but want to differentiate with:
- Collapsible drawer system
- Rank/scoring integration
- Modern gesture-based UX

---

## Implementation Phases

### Phase 1: Collapsible Workout Drawer (Foundation)
- Create swipe gesture system (react-native-gesture-handler + reanimated)
- Thin "peek" edge when collapsed
- Persists across navigation (lives outside Stack navigator)
- State tracks drawer visibility globally
- Drawer renders the workout session when active

### Phase 2: Workout Hub Redesign
- Redesign workout tab as hub with stats and entry points
- Routines folder navigation
- Remove separate "Resume" flow (drawer handles it)

### Phase 3: Exercise Card Enhancements
- Add rank icon per exercise
- Add last PR text
- Add "rank up at..." hint
- Keep compact, not clunky

### Phase 4: Set Logging UX Polish
- Personal best text above inputs
- Tap-to-fill functionality
- Clean, minimal design

---

## Technical Considerations

### Drawer System
- Must persist independently of navigation
- Needs global state (Zustand) for open/closed/active status
- Should work with existing PersistentTabBar
- Needs to coexist with other modals/overlays

### Data Persistence Change
- Currently: saves to AsyncStorage on every change
- New: only saves on "Complete Workout"
- Need to handle app crash/force quit (still save periodically?)
- Consider: save on collapse? save on background?

### Gesture Handling
- Right swipe to collapse
- Left swipe from right edge to expand
- Needs careful tuning to not conflict with other gestures
- Consider: should tab bar be visible when drawer is open?
