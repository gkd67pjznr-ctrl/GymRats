# Feature: Forge Lab (Analytics)

## Overview
Premium analytics dashboard for serious lifters. Deep training insights, trends, and data visualization. Weight graph is free; everything else is behind Pro subscription.

**Status:** In Progress | **Progress:** 5/6 features
**Priority:** Launch (v1)
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### ✅ Done - Weight Graph (FREE)
- [x] Bodyweight trend over time
- [x] Manual entry via Settings screen with WeightEntryModal component
- [x] Support for current weight updates and historical entries
- [x] Unit conversion (kg/lb) with user preference
- [x] Line chart with date range selector (using victory-native)
- [x] Goal weight line (optional)
- [x] Available to all users — not behind paywall

---

### ✅ Done - Strength Curves (PREMIUM)
- [x] e1RM trend per exercise over time
- [x] Line chart with date selector
- [x] Compare multiple exercises on same chart
- [x] Highlight PR dates on the curve
- [x] Show rank tier thresholds as horizontal lines

---

### ✅ Done - Volume Trends (PREMIUM)
- [x] Weekly/monthly total volume graphs
- [x] Volume per muscle group breakdown
- [x] Volume per exercise trend
- [x] Compare periods (this week vs last week)
- [x] Identify volume peaks and valleys

---

### ✅ Done - Muscle Group Balance (PREMIUM)
- [x] Heatmap or radar chart of volume distribution
- [x] Identify undertrained muscle groups
- [x] Recommended adjustments based on imbalances
- [x] Tied to Forge DNA visualization
- [x] Historical balance shifts over time

---

### ✅ Done - Rank Progression Graphs (PREMIUM)
- [x] Rank history per exercise (rank number over time)
- [x] Score progression (0-1000 over time)
- [x] Tier breakthrough markers
- [x] Projected rank trajectory (based on recent trend)
- [x] Multi-exercise rank comparison

---

### In Progress - Integration Data Display (PREMIUM)
- [x] Apple Health data (weight, BMI) displayed inline
- [x] MyFitnessPal data (nutrition, macros) if integrated
- [x] Whoop data (recovery, strain) if integrated
- [ ] Correlation insights (sleep vs performance, nutrition vs volume)
- [ ] Data import status and last sync time

---

## Technical Notes

**Data Sources:**
```typescript
type ForgeLabData = {
  weightHistory: { date: string; weightKg: number }[];
  exerciseStats: {
    exerciseId: string;
    e1rmHistory: { date: string; e1rm: number }[];
    volumeHistory: { week: string; volume: number }[];
    rankHistory: { date: string; rank: number; score: number }[];
  }[];
  muscleGroupVolume: {
    period: string;   // "2026-W04"
    groups: Record<MuscleGroup, number>;
  }[];
  integrationData?: {
    appleHealth?: { weight: number[]; sleep: number[] };
    whoop?: { recovery: number[]; strain: number[] };
    mfp?: { calories: number[]; protein: number[] };
  };
};
```

**Charting Library:**
- ✅ `victory-native` implemented with VictoryLineChart and VictoryBarChart wrapper components
- Custom SVG for radar/heatmap visualizations
- Smooth animations on data load
- Dark theme support with GymRats design system integration

**Premium Gating:**
- Weight graph: always visible, fully functional
- All other charts: show placeholder with blur + "Upgrade to Pro" CTA
- Demo data preview (show what the chart looks like with sample data)

**Technical Implementation:**
- ✅ Data caching with hash-based invalidation (DJB2 algorithm)
- ✅ Weight tracking integrated into settingsStore with addWeightEntry/updateCurrentWeight actions
- ✅ WeightEntryModal component for user input with validation
- ✅ Unit conversion handled at display layer (kg stored internally)
- ✅ Integration with Forge Lab analytics for weight trend visualization

---

## UI Design

**Forge Lab Screen:**
- Dashboard layout with scrollable cards
- Weight graph at top (always visible)
- Premium charts below with lock icons for free users
- Date range picker (1W, 1M, 3M, 6M, 1Y, ALL)
- Tab sections: Strength | Volume | Balance | Integrations

**Chart Cards:**
- Clean, minimal chart design (dark background, accent color lines)
- Tap to expand to full-screen detail view
- Swipe between exercises on strength curves
- Interactive tooltips on data points

---

## Dependencies

- Workout history (workoutStore)
- Rank/score data (gymratsScoring.ts)
- Settings (bodyweight for weight graph)
- Subscription status (premium gating)
- Integration APIs (Apple Health, MFP, Whoop — post-launch)

---

## Priority

**P0 (Launch):**
- Weight graph (free)
- Basic e1RM trends (premium)

**P1 (Launch Polish):**
- Volume trends
- Muscle group balance
- Rank progression

**P2 (Post-Launch):**
- Integration data display
- Correlation insights
