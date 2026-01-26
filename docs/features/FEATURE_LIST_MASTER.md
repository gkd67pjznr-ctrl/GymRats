# FORGERANK FEATURE LIST
**Complete Feature Inventory with Priorities**

---

## Document Info
- **Created:** 2026-01-23
- **Last Updated:** 2026-01-25
- **Status:** Initial inventory from interview + SPEC-011 through SPEC-020 mapping

---

## Legend

### Priority Levels
- **P0** = Critical for v1.0 launch
- **P1** = Important, soon after v1.0
- **P2** = Nice-to-have, v1.x
- **P3** = Future consideration

### Status
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked
- ~~Strikethrough~~ = Abandoned (with date and reason)

---

# CORE FEATURES

## 1. Workout Logging (P0)

### 1.1 Routine-Based Workout Start (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| View saved routines list | [ ] | P0 | |
| Start workout from routine | [ ] | P0 | Primary workflow |
| Exercise sequence display | [ ] | P0 | Show planned exercises |
| Set logging (weight/reps) | [~] | P0 | Exists but buggy |
| Mark set complete | [~] | P0 | Exists but buggy |
| Skip exercise option | [ ] | P0 | |
| Add unplanned exercise | [ ] | P0 | |
| Finish workout flow | [~] | P0 | Exists but buggy |

### 1.2 Plan-Based Workout (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Browse available plans | [~] | P0 | Exists, needs work |
| Start plan/program | [ ] | P0 | |
| Track plan progress | [ ] | P0 | Week/day indicators |
| Select today's workout | [ ] | P0 | |
| Plan completion tracking | [ ] | P1 | |

### 1.3 Smart Workout Generation (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Track muscle group last-worked | [ ] | P1 | Foundation |
| Display "rested" muscle groups | [ ] | P1 | Simple v1 |
| Suggest workout based on rest | [ ] | P1 | |
| AI-powered optimization | [ ] | P2 | Future enhancement |

### 1.4 Free/Quick Workout (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Start empty workout | [~] | P1 | Current live-workout |
| Add exercises on the fly | [~] | P1 | Exists |
| Exercise search/picker | [~] | P1 | Exists |

### 1.5 Rest Timer (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Configurable rest duration | [~] | P0 | Exists |
| Auto-start after set | [ ] | P0 | |
| Haptic/audio notification | [~] | P0 | Exists |
| Skip timer option | [ ] | P0 | |

---

## 2. PR Detection & Feedback (P0)

### 2.1 PR Types (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Weight PR detection | [~] | P0 | Exists, needs validation |
| Rep PR detection | [~] | P0 | Exists, needs validation |
| E1RM PR detection | [~] | P0 | Exists, needs validation |
| PR notification toast | [~] | P0 | Exists |

### 2.2 PR Enhancements (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Celebration animations | [ ] | P1 | |
| PR history view | [ ] | P1 | See all PRs |
| PR sharing to feed | [ ] | P1 | |

---

## 3. Forgerank Scoring System (P0)

### 3.1 Core Scoring (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| 0-1000 score calculation | [~] | P0 | Exists, needs validation |
| Score breakdown/explanation | [ ] | P0 | Show why score is X |
| Per-exercise scores | [ ] | P0 | |
| Overall Forgerank | [ ] | P0 | Aggregate score |

### 3.2 Rank Tiers (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Tier display (Iron→Mythic) | [~] | P0 | Exists |
| Progress to next rank | [ ] | P0 | Visual progress bar |
| Rank up celebration | [ ] | P1 | Animation/sound |
| Rank history | [ ] | P2 | |

---

## 4. Routines & Plans (P0)

### 4.1 User Routines (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create routine | [~] | P0 | Exists |
| Add exercises to routine | [~] | P0 | Exists |
| Set target sets/reps | [ ] | P0 | |
| Edit routine | [ ] | P0 | |
| Delete routine | [ ] | P0 | |
| Duplicate routine | [ ] | P1 | |

### 4.2 Premade Plans (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| 5/3/1 template | [ ] | P1 | |
| nSuns template | [ ] | P2 | |
| PPL template | [ ] | P1 | |
| Starting Strength | [ ] | P2 | |
| Custom plan builder | [ ] | P2 | |

### 4.3 Progressive Overload (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Auto-increment weights | [ ] | P1 | Based on performance |
| Deload detection | [ ] | P2 | Suggest deload week |
| Progression rules config | [ ] | P2 | |

---

## 5. Backend & Accounts (P0)

### 5.1 Authentication (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Email/password signup | [ ] | P0 | |
| Email/password login | [ ] | P0 | |
| Google OAuth | [ ] | P0 | |
| Apple Sign In | [ ] | P0 | Required for iOS |
| Password reset | [ ] | P0 | |
| Logout | [ ] | P0 | |
| Delete account | [ ] | P1 | GDPR compliance |

### 5.2 Cloud Sync (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Workout history sync | [ ] | P0 | |
| Routines sync | [ ] | P0 | |
| Settings sync | [ ] | P1 | |
| Offline queue | [ ] | P0 | Sync when online |
| Conflict resolution | [ ] | P0 | |
| Multi-device support | [ ] | P0 | |

### 5.3 User Profile (P0) - 2026-01-23
| Feature | Status | Priority | Notes | SPEC |
|---------|--------|----------|-------|-----|
| Profile creation | [ ] | P0 | | SPEC-006 |
| Display name | [ ] | P0 | | SPEC-006 |
| Avatar upload | [ ] | P1 | | SPEC-006 |
| Bio | [ ] | P2 | | |
| Bodyweight tracking | [~] | P0 | Exists locally | SPEC-014 |
| Unit preference (lb/kg) | [~] | P0 | Exists locally | |
| Body measurements | [ ] | P2 | | SPEC-014 |
| Progress photos | [ ] | P2 | | SPEC-014 |

---

## 6. Social Features (P0 - Critical for v1.0)

### 6.1 Friends System (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Search users | [ ] | P0 | By username |
| Send friend request | [ ] | P0 | |
| Accept/decline request | [ ] | P0 | |
| Friends list | [~] | P0 | Exists locally |
| Unfriend | [ ] | P0 | |
| Block user | [ ] | P1 | |

### 6.2 Social Feed (P0) - 2026-01-23
| Feature | Status | Priority | Notes | SPEC |
|---------|--------|----------|-------|-----|
| Post workout to feed | [~] | P0 | Exists locally | SPEC-016 |
| View friends' workouts | [~] | P0 | Exists locally | SPEC-016 |
| Privacy (public/friends) | [~] | P0 | Exists locally | SPEC-016 |
| Like/react to posts | [~] | P0 | Exists locally | SPEC-016 |
| Comments | [ ] | P1 | | SPEC-016 |
| Share PR to feed | [ ] | P1 | | SPEC-016 |

### 6.3 Leaderboards (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Friends leaderboard | [ ] | P1 | |
| Global leaderboard | [ ] | P2 | |
| Per-exercise rankings | [ ] | P1 | |
| Time filters (week/month/all) | [ ] | P1 | |

---

## 7. Analytics & Insights (P1)

### 7.1 Volume Tracking (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Total tonnage per workout | [ ] | P1 | |
| Weekly volume | [ ] | P1 | |
| Monthly volume | [ ] | P1 | |
| Per-muscle-group volume | [ ] | P1 | |

### 7.2 Progress Graphs (P1) - 2026-01-23
| Feature | Status | Priority | Notes | SPEC |
|---------|--------|----------|-------|-----|
| Strength over time | [ ] | P1 | Per exercise | SPEC-011 |
| E1RM trend lines | [ ] | P1 | | SPEC-011 |
| Volume trends | [ ] | P2 | | SPEC-011 |
| Bodyweight chart | [ ] | P1 | | SPEC-011 |
| Workout frequency calendar | [ ] | P1 | Training streaks | SPEC-011 |
| PR dashboard | [ ] | P1 | All PRs by exercise | SPEC-011 |

### 7.3 Training Insights (P2) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Frequency heatmap | [ ] | P2 | Muscle groups |
| Rest day patterns | [ ] | P2 | |
| Optimal training times | [ ] | P3 | |
| Overtraining warnings | [ ] | P3 | |

---

## 8. Gamification (P1)

### 8.1 Streaks (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Workout streak counter | [ ] | P1 | |
| Streak milestones | [ ] | P1 | |
| Streak recovery (rest days) | [ ] | P2 | |

### 8.2 Achievements (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Badge system | [ ] | P1 | |
| First workout badge | [ ] | P1 | |
| PR badges | [ ] | P1 | |
| Consistency badges | [ ] | P1 | |
| Strength milestone badges | [ ] | P1 | |

### 8.3 Challenges (P2) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Monthly challenges | [ ] | P2 | |
| Friend challenges | [ ] | P2 | |
| Challenge leaderboards | [ ] | P2 | |

---

## 9. Programming Features (P1)

### 9.1 Set Types (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Warmup sets | [~] | P0 | Exists |
| Working sets | [~] | P0 | Exists |
| Drop sets | [ ] | P2 | |
| Supersets | [ ] | P2 | |
| AMRAP sets | [ ] | P1 | |

### 9.2 RPE/RIR Tracking (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| RPE input per set | [ ] | P1 | |
| RIR input per set | [ ] | P1 | |
| RPE-based suggestions | [ ] | P2 | |

---

## 10. Integrations (P1)

### 10.1 Health Platforms (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Apple Health sync | [ ] | P1 | |
| Google Fit sync | [ ] | P1 | |

### 10.2 Export (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| CSV export | [ ] | P1 | |
| PDF export | [ ] | P2 | |

---

## 11. Onboarding (P1)

### 11.1 New User Flow (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Welcome screens | [ ] | P1 | |
| Experience level selection | [ ] | P1 | |
| Goal selection | [ ] | P1 | |
| Bodyweight setup | [ ] | P1 | |
| Unit preference setup | [ ] | P1 | |
| First routine suggestion | [ ] | P1 | |

### 11.2 Feature Tutorials (P2) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Guided workout tutorial | [ ] | P2 | |
| PR system explanation | [ ] | P2 | |
| Forgerank explanation | [ ] | P2 | |
| Social features tour | [ ] | P2 | |

---

## 12. Settings & Preferences (P1)

### 12.1 App Settings (P1) - 2026-01-23
| Feature | Status | Priority | Notes | SPEC |
|---------|--------|----------|-------|-----|
| Unit preference (lb/kg) | [~] | P0 | Exists | |
| Default rest timer | [ ] | P1 | | SPEC-013 |
| Notification preferences | [ ] | P1 | | SPEC-012 |
| Haptic feedback toggle | [ ] | P1 | | |
| Theme selection | [ ] | P2 | | SPEC-018 |
| Dark mode toggle | [ ] | P2 | | SPEC-018 |
| Equipment filtering | [ ] | P1 | Gym/home toggle | SPEC-017 |

### 12.2 Privacy Settings (P1) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Default post privacy | [ ] | P1 | |
| Profile visibility | [ ] | P1 | |
| Activity visibility | [ ] | P1 | |

---

## 13. UI/UX Polish (P0)

### 13.1 Visual Design (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Consistent design system | [~] | P0 | Needs refinement |
| Dark mode (primary) | [~] | P0 | Exists |
| Light mode | [ ] | P2 | |
| Animations | [~] | P1 | Partial |
| Loading states | [ ] | P0 | |
| Error states | [ ] | P0 | |
| Empty states | [ ] | P0 | |

### 13.2 Navigation (P0) - 2026-01-23
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Tab navigation | [~] | P0 | Exists |
| Stack navigation | [~] | P0 | Exists |
| Deep linking | [ ] | P2 | |
| Back navigation consistency | [ ] | P0 | |

---

# FEATURE COUNT SUMMARY

| Priority | Total | Complete | In Progress | Not Started |
|----------|-------|----------|-------------|-------------|
| P0 | ~60 | 0 | ~20 | ~40 |
| P1 | ~50 | 0 | 0 | ~50 |
| P2 | ~30 | 0 | 0 | ~30 |
| P3 | ~5 | 0 | 0 | ~5 |

---

**End of Feature List v1.0**
*Updated as features are completed or priorities change.*
