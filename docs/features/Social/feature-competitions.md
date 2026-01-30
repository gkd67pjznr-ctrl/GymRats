# Feature: Online Competitions

## Overview
First-of-its-kind: online powerlifting meets and bodybuilding shows inside a workout app. Users submit video of their lifts or posing routines, judged by community or verified panels.

**Status:** Planned | **Progress:** 0/8 features
**Priority:** Post-launch v2
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### Planned - Powerlifting Meet: Video Submission
- [ ] Record or upload lift video (squat, bench, deadlift)
- [ ] Attach to specific exercise and weight/reps
- [ ] Video trimming and basic editing
- [ ] Submission deadline per meet
- [ ] Video stored in Supabase storage (scoped to competition context only)

---

### Planned - Powerlifting Meet: Tiered Judging
- [ ] **Casual meets:** Community judging — any verified user above certain rank can judge
- [ ] **Ranked meets:** Verified panel — 3-5 elected high-rank judges per meet
- [ ] **Championship:** AI form/depth analysis + human panel confirmation
- [ ] 3 white lights / 3 red lights system (like real powerlifting)
- [ ] Majority rules for pass/fail
- [ ] Judge must provide reason for red light

---

### Planned - Powerlifting Meet: Scoring & Results
- [ ] Wilks or DOTS score calculation
- [ ] Weight class divisions
- [ ] Placing and awards (1st, 2nd, 3rd per class)
- [ ] Meet results page with all lifts
- [ ] Badges/trophies for placing

---

### Planned - Bodybuilding Show: Video Submission
- [ ] Record or upload posing routine video (15-60 seconds)
- [ ] Multiple categories (Men's Physique, Classic, Women's Bikini, etc.)
- [ ] Submission deadline per show
- [ ] Video requirements (front/back/side poses)

---

### Planned - Bodybuilding Show: Judging
- [ ] Verified high-quality judges (verification process TBD)
- [ ] Scoring criteria: symmetry, conditioning, posing quality, overall impression
- [ ] 1-10 scoring per criteria
- [ ] Panel of 3-5 judges per show
- [ ] Anonymized judging (judges don't see other scores until all submitted)

---

### Planned - Bodybuilding Show: Events
- [ ] **Seasonal championship events** — quarterly/monthly with registration, submission period, judging period, results
- [ ] **Always-open practice stage** — submit posing videos anytime, community rates them on rolling basis
- [ ] Event calendar with upcoming shows
- [ ] Registration with entry requirements (minimum rank, minimum level, etc.)
- [ ] Eventually: championship events with prizes/badges

---

### Planned - Volume Challenges
- [ ] Weekly fun challenges: "Most calf volume this week", "Most rear delt volume"
- [ ] Opt-in participation
- [ ] Leaderboard per challenge
- [ ] Focus on less-hit muscle groups to make it fun
- [ ] No prizes beyond bragging rights and badges
- [ ] Anti-toxicity: no body comparison, just volume numbers

---

### Planned - Competition Infrastructure
- [ ] Event creation and management
- [ ] Registration system
- [ ] Submission tracking
- [ ] Judge assignment
- [ ] Results calculation and display
- [ ] Competition history on user profile

---

## Anti-Toxicity Considerations

- **No direct body comparison** — bodybuilding shows are about posing skill, not "who looks better"
- **Supportive community** — judges provide constructive feedback
- **No public body transformation voting** — avoid toxic comparison dynamics
- **Volume challenges** are about numbers, not appearance
- **Moderation** — report inappropriate content or judging behavior

---

## Technical Notes

**Video Storage:**
- Supabase Storage for competition videos only
- Not a general video platform — scoped to competition submissions
- Video compression and size limits
- Content moderation on uploads

**Competition Types:**
```typescript
type Competition = {
  id: string;
  type: 'powerlifting_meet' | 'bodybuilding_show' | 'volume_challenge';
  name: string;
  status: 'upcoming' | 'registration' | 'submission' | 'judging' | 'results';
  startDate: number;
  endDate: number;
  divisions: Division[];
};

type Submission = {
  competitionId: string;
  userId: string;
  videoUrl?: string;        // PL meets and BB shows
  exerciseData?: {          // Volume challenges
    exerciseId: string;
    totalVolume: number;
  };
  scores: JudgeScore[];
  placing?: number;
};
```

---

## Dependencies

- Video upload/storage (Supabase Storage)
- User verification system (for judges)
- Rank system (entry requirements)
- Social feed (results sharing)
- Notifications (competition results)

---

## Priority

**P2 (Post-Launch v2):**
- Volume challenges (simplest to implement)
- Casual powerlifting meets
- Basic bodybuilding show (seasonal)

**P3 (Future):**
- Ranked powerlifting meets with verified panel
- Championship events
- AI-assisted judging
