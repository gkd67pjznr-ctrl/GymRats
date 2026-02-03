# Feature: AI Coaching

## Overview
Template-based programming with AI suggestions layered on top. Enhances the user's own judgment rather than replacing it. Not another "fully AI-generated" workout app.

**Status:** Planned | **Progress:** 0/4 features
**Priority:** Post-launch
**Source:** 2026-01-29 brainstorm interview

**Philosophy:** Too many AI workout apps are being churned out that are garbage or samey. GymRats's AI coaching should be subtle, helpful, and trust the user. Start with curated templates, add smart suggestions after usage.

---

## Sub-Features

### Planned - Template Library
- [ ] Curated program templates by experienced lifters
- [ ] Categorized by: goal (strength/hypertrophy/general), experience level, available days
- [ ] Programs include: exercises, sets, reps, progression scheme
- [ ] User picks a template and follows it through routines
- [ ] Templates are editable after selection

---

### Planned - AI Suggestions
- [ ] Activated after 1+ week of following a template
- [ ] Exercise swap recommendations (based on equipment, preferences)
- [ ] Auto-deload detection (performance decline → suggest deload week)
- [ ] Volume adjustment suggestions (too much/too little for a muscle group)
- [ ] Subtle, non-intrusive — presented as optional suggestions, not commands

---

### Planned - Goal-Based Recommendations
- [ ] Uses goal set during onboarding (strength, aesthetics, health, sport)
- [ ] Recommends templates that match user's goal
- [ ] Adjusts suggestions based on goal over time
- [ ] "You're training a lot of upper body but your goal is aesthetics — consider adding more leg volume"

---

### Planned - Premium Feature Gate
- [ ] Template browsing: free
- [ ] AI suggestions: premium (Pro subscription)
- [ ] Show "AI suggestion available" indicator for free users
- [ ] Premium users see full suggestion with explanation

---

## Technical Notes

**Suggestion Engine:**
```typescript
type AISuggestion = {
  type: 'exercise_swap' | 'deload' | 'volume_adjust' | 'goal_alignment';
  message: string;
  reason: string;
  action?: {
    type: 'swap_exercise' | 'adjust_sets' | 'take_deload';
    details: any;
  };
  dismissed: boolean;
};
```

**Not using LLM:** Suggestions are rule-based algorithms analyzing workout data, not LLM-generated. This keeps it fast, predictable, and cheap to run.

---

## Dependencies

- Workout history (patterns, volume, performance trends)
- Routine system (template structure)
- Onboarding (goal selection)
- Subscription status (premium gating)

---

## Priority

**P3 (Post-Launch):**
- Template library
- Basic AI suggestions (exercise swaps, deload detection)

**P4 (Future):**
- Goal-based recommendations
- Advanced volume optimization
