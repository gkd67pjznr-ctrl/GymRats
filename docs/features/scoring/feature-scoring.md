# Feature: Scoring & Ranks (Forgerank System)

## Overview
The core differentiator of Forgerank - a scoring system that rates your strength against verified, real-world standards. No user-submitted data inflation. Static, honest, meaningful ranks.

---

## Sub-Features

### Done - Score Calculation
- [x] 0-1000 score per set
- [x] e1RM-based calculation (Epley formula)
- [x] Bodyweight ratio adjustment
- [x] Rep quality bonus
- [x] Volume bonus
- [x] Consistency bonus

**Implementation:** `src/lib/forgerankScoring.ts`

### Done - Tier System
- [x] 7 tiers defined
- [x] Iron (0), Bronze (180), Silver (320)
- [x] Gold (470), Platinum (620), Diamond (770), Mythic (900)
- [x] Tier colors for UI

**Implementation:** `src/lib/forgerankScoring.ts`

### Done - Rank Ladder
- [x] 20 ranks per exercise
- [x] Curve-based distribution
- [x] Rank thresholds from verified tops
- [x] Rank lookup utilities

**Implementation:** `src/lib/ranks.ts`

### Done - Verified Standards
- [x] Top e1RM from world-class lifters
- [x] Video-verified lifts only
- [x] Cannot be inflated by users

**Implementation:** `src/data/rankTops.ts`

### Done - Anti-Cheat Heuristics
- [x] Implausible jump detection (>12% e1RM gain)
- [x] Implausible set detection (20+ reps at max)
- [x] Too-light weight detection (<10kg e1RM)
- [x] Flag output (doesn't block, just warns)

**Implementation:** `src/lib/forgerankScoring.ts`

---

### Planned - Score Breakdown Display
- [ ] Show "why" for each score
- [ ] Component breakdown UI
- [ ] Educational tooltips

### Planned - Rank Progress
- [ ] Progress bar to next rank
- [ ] Points needed display
- [ ] Rank history

### Planned - Rank-Up Celebration
- [ ] Animation on rank increase
- [ ] Sound effect
- [ ] Share to feed

---

## Technical Notes

**Key Files:**
- `src/lib/forgerankScoring.ts` - Main scoring algorithm
- `src/lib/ranks.ts` - Rank ladder utilities
- `src/lib/e1rm.ts` - e1RM calculation (Epley formula)
- `src/data/rankTops.ts` - Verified top standards

**Scoring Algorithm:**
```
Base Strength (dominant): e1RM / bodyweight ratio on nonlinear curve
+ Rep Quality: Bonus for high-load reps (diminishing after 12)
+ Volume Bonus: Small reward for actual work
+ Consistency: Sessions in last 14 days
+ PR Bonus: Beating previous best
= Total Score (0-1000)
```

**e1RM Formula (Epley):**
```
e1RM = weight × (1 + reps / 30)
```

**Rank Thresholds:**
- Built from `rankTops.ts` verified standards
- Curve gives more ranks at lower levels (beginner-friendly)
- Top ranks require elite performance

---

## Philosophy

1. **Static Standards**: Top-end numbers never change based on user data
2. **Honest Feedback**: You compare against real, verified lifts
3. **Playful Anti-Cheat**: We flag anomalies, not punish them
4. **Accessible Progress**: Early ranks are achievable, elite ranks are earned
