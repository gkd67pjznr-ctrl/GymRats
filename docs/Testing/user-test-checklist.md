# User Test Checklist

Manual testing checklist for verifying feature implementations.

---

## Day Log System (2026-02-05)

Pre-workout check-in that captures physical/mental state and correlates with performance.

### Basic Flow
- [ ] Start a workout → Day Log modal appears automatically
- [ ] Modal shows all fields: Hydration, Nutrition, Carbs, Energy, Sleep, Pain
- [ ] Each rating scale (1-5) is tappable and highlights selected value
- [ ] Nutrition buttons (None/Light/Moderate/Full) work correctly
- [ ] Carbs buttons (Low/Moderate/High) work correctly
- [ ] Pain toggle: selecting "Some Pain" reveals body part checkboxes
- [ ] Pain locations are multi-selectable
- [ ] Notes field accepts text input
- [ ] "Skip" button closes modal and starts workout without saving
- [ ] "Save & Start" button saves data and starts workout

### Data Persistence
- [ ] After saving, close and reopen app
- [ ] Complete a workout
- [ ] Check that Day Log data persisted (via Gym Lab analytics)

### Analytics Integration
- [ ] Complete at least 3 workouts with Day Log check-ins
- [ ] Open Gym Lab → Analytics tab
- [ ] Scroll to "Day Log Insights" card
- [ ] Card shows correlation insights (or "Not Enough Data" message if < 3 logs)
- [ ] Correlations display factor, metric, strength badge, and r-value
- [ ] Strong correlations highlighted in green, moderate in yellow

### Edge Cases
- [ ] Start workout, skip Day Log, complete workout → no errors
- [ ] Start workout, fill partial Day Log, tap Skip → modal closes, no data saved
- [ ] Rapid tapping on rating buttons → no UI glitches
- [ ] Long notes text → input scrolls properly

---

## Template for New Features

```markdown
## [Feature Name] (YYYY-MM-DD)

Brief description.

### Basic Flow
- [ ] Step 1
- [ ] Step 2

### Data Persistence
- [ ] Verification steps

### Edge Cases
- [ ] Edge case 1
```
