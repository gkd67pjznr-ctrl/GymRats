# FORGERANK TODO LIST
**Actionable Development Tasks**

---

## Document Info
- **Created:** 2026-01-23
- **Last Updated:** 2026-01-25 (Post-Interview Restructure)
- **Status:** Active
- **Timeline:** 3+ months to v1

---

## Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked
- ~~Strikethrough~~ = Abandoned (date + reason)
- **[NEW YYYY-MM-DD]** = Added after initial plan

---

# PHASE 0: STABILIZATION (Current)

## 0.1 Code Audit
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Run app and document all crashes | [ ] | Claude | |
| Document all broken buttons/features | [ ] | Claude | |
| List all TypeScript errors/warnings | [ ] | Claude | |
| Identify inconsistent code patterns | [ ] | Claude | |
| Find duplicated logic across files | [ ] | Claude | |
| Audit `any` types usage | [ ] | Claude | |
| Test iOS thoroughly | [ ] | User | Expo Go |
| Test Android | [ ] | User | Expo Go |

## 0.2 Critical Bug Fixes
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Fix app crashes | [ ] | Claude | After audit |
| Fix broken navigation | [ ] | Claude | |
| Fix broken buttons | [ ] | Claude | |
| Fix data persistence issues | [ ] | Claude | |
| Fix workout logging flow | [ ] | Claude | |

## 0.3 Code Cleanup
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Remove dead/unused code | [ ] | Claude | |
| Consolidate duplicated logic | [ ] | Claude | |
| Fix TypeScript strict violations | [ ] | Claude | |
| Add missing error handling | [ ] | Claude | |
| Standardize code patterns | [ ] | Claude | |

## 0.4 Zustand Migration Complete
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Migrate currentSessionStore | [x] | Claude | SPEC-002 complete |
| Migrate workoutStore | [ ] | Claude | |
| Migrate routinesStore | [ ] | Claude | |
| Migrate socialStore | [ ] | Claude | |
| Migrate friendsStore | [ ] | Claude | |
| Migrate feedStore | [ ] | Claude | |
| Migrate chatStore | [ ] | Claude | |
| Set up proper hydration flags | [ ] | Claude | |
| Remove old module-level stores | [ ] | Claude | |
| Update components to use new stores | [ ] | Claude | |

## 0.5 Error Handling
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Add error boundary to root | [ ] | Claude | SPEC-001 |
| Add per-tab error boundaries | [ ] | Claude | |
| Add loading states everywhere | [ ] | Claude | |
| Add empty states everywhere | [ ] | Claude | |
| Add error states everywhere | [ ] | Claude | |

---

# PHASE 1: CORE WORKOUT EXPERIENCE (Month 1-2)

## 1.1 Set Input Polish
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Implement quick number pad | [ ] | Claude | Calculator-style |
| Implement stepper +/- buttons | [ ] | Claude | |
| Implement auto-fill from last workout | [ ] | Claude | Smart defaults |
| Add input validation | [ ] | Claude | SPEC-003 |
| Add toast feedback for validation | [ ] | Claude | |

## 1.2 Routine-Based Workflow
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Design routine selection UI | [ ] | Claude | |
| Implement routine list screen | [ ] | Claude | |
| Add "Start Workout" from routine | [ ] | Claude | SPEC-010 |
| Workout screen shows routine exercises | [ ] | Claude | |
| Set completion tracking per exercise | [ ] | Claude | |
| Exercise completion tracking | [ ] | Claude | |
| Finish workout summary | [ ] | Claude | |
| Save completed workout | [ ] | Claude | |

## 1.3 Rest Timer Enhancement
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Auto-start timer after set | [ ] | Claude | |
| Push notification when timer done | [ ] | Claude | Even when backgrounded |
| Add sound effects | [ ] | Claude | Audio cues |
| Add skip timer button | [ ] | Claude | |
| Add +30s button | [ ] | Claude | |
| Circular progress UI | [ ] | Claude | |

## 1.4 PR Detection & Celebration
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Validate PR detection logic | [ ] | Claude | Test edge cases |
| Design subtle celebration toast | [ ] | Claude | Not full-screen |
| Add sound effects for PRs | [ ] | Claude | |
| Add haptic feedback | [ ] | Claude | |
| Add one-tap share to feed | [ ] | Claude | |
| Add personalized cue messages | [ ] | Claude | From personality |

## 1.5 Exercise Library
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Audit current exercise list | [ ] | Claude | |
| Add muscle group mappings | [ ] | Claude | Primary/secondary/tertiary |
| Add exercise search | [ ] | Claude | |
| Add exercise categories | [ ] | Claude | |
| Add exercise details view | [ ] | Claude | |

---

# PHASE 2: BACKEND & AUTH (Month 2-3)

## 2.1 Supabase Setup
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Create Supabase project | [x] | User | SPEC-004 complete |
| Install Supabase client | [x] | Claude | |
| Configure environment variables | [x] | Claude | |
| Health check function | [x] | Claude | |

## 2.2 Database Schema
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Design users table | [ ] | Claude | SPEC-005 |
| Design workouts table | [ ] | Claude | |
| Design workout_sets table | [ ] | Claude | |
| Design routines table | [ ] | Claude | |
| Design friendships table | [ ] | Claude | |
| Design posts table | [ ] | Claude | |
| Design reactions table | [ ] | Claude | |
| Design comments table | [ ] | Claude | |
| Design user_levels table | [ ] | Claude | XP/currency |
| Design streak_data table | [ ] | Claude | |
| Write migration scripts | [ ] | Claude | |
| Set up Row Level Security | [x] | Claude | SPEC-008 complete |

## 2.3 Authentication
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Email/password signup screen | [ ] | Claude | SPEC-006 |
| Email/password login screen | [ ] | Claude | |
| Google OAuth integration | [ ] | Claude | SPEC-007 |
| Apple Sign In integration | [ ] | Claude | |
| Auth state management | [ ] | Claude | |
| Protected routes | [ ] | Claude | |
| Logout functionality | [ ] | Claude | |
| Password reset flow | [ ] | Claude | |

## 2.4 Data Sync
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Migrate workoutStore to Supabase | [ ] | Claude | |
| Migrate routinesStore to Supabase | [ ] | Claude | |
| Implement offline queue | [ ] | Claude | |
| Implement sync on reconnect | [ ] | Claude | |
| Handle sync conflicts | [ ] | Claude | |

---

# PHASE 3: SOCIAL FEATURES (Month 3-4)

## 3.1 Friends System
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Username search UI | [ ] | Claude | |
| Send friend request | [ ] | Claude | |
| Accept/decline requests UI | [ ] | Claude | |
| Friends list (from Supabase) | [ ] | Claude | |
| Unfriend functionality | [ ] | Claude | |
| Block user functionality | [ ] | Claude | |
| QR code friend add | [ ] | Claude | P1 |
| Suggested users algorithm | [ ] | Claude | P1 |

## 3.2 Social Feed
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Global feed tab | [ ] | Claude | |
| Friends feed tab | [ ] | Claude | |
| Post workout to Supabase | [ ] | Claude | |
| Post with caption/notes | [ ] | Claude | |
| Post with optional photo | [ ] | Claude | |
| Body model default image | [ ] | Claude | |
| Real-time feed updates | [ ] | Claude | |
| Reactions (from Supabase) | [ ] | Claude | |
| Comments on posts | [ ] | Claude | P1 |
| Privacy enforcement | [ ] | Claude | Public by default |

## 3.3 Leaderboards
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Friends leaderboard UI | [ ] | Claude | |
| Per-exercise rankings | [ ] | Claude | |
| Overall Forgerank ranking | [ ] | Claude | |
| Volume/consistency ranking | [ ] | Claude | P1 |
| User level ranking | [ ] | Claude | P1 |
| Time filters | [ ] | Claude | Week/month/all |

---

# PHASE 4: PERSONALITY & GAMIFICATION (Month 4-5)

## 4.1 Cue System / Gym Buddy
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Design personality data structure | [ ] | Claude | |
| Create default personality | [ ] | Claude | |
| Create 3-5 starter personalities | [ ] | Claude | |
| Personality picker in settings | [ ] | Claude | |
| Personality picker in onboarding | [ ] | Claude | |
| PR cue messages by personality | [ ] | Claude | |
| Rank-up cue messages | [ ] | Claude | |
| Streak milestone cues | [ ] | Claude | |
| Optional audio cues | [ ] | Claude | P1 |

## 4.2 User Level / XP System
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| XP calculation logic | [ ] | Claude | |
| Level thresholds | [ ] | Claude | |
| XP bar UI | [ ] | Claude | |
| Level-up celebration | [ ] | Claude | Animation |
| Currency earning logic | [ ] | Claude | |

## 4.3 Streak System
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Streak counter logic | [ ] | Claude | |
| 5-day break threshold | [ ] | Claude | |
| Visual streak calendar | [ ] | Claude | GitHub-style |
| Streak color progression | [ ] | Claude | Changes with length |
| Streak animation in summary | [ ] | Claude | |
| Streak milestone rewards | [ ] | Claude | Currency |

## 4.4 Body Model
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| 2D body illustration asset | [ ] | Design | Need to create/source |
| Male/female variants | [ ] | Design | |
| Muscle subdivision regions | [ ] | Claude | Upper chest, rear delts, etc. |
| Volume-based coloring logic | [ ] | Claude | |
| Integration with exercise data | [ ] | Claude | Primary/secondary muscles |

---

# PHASE 5: POLISH & LAUNCH (Month 5+)

## 5.1 Visual Design Overhaul
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Dark gradient backgrounds | [ ] | Claude | Pure-inspired |
| Bold typography refinement | [ ] | Claude | |
| Reduce UI chrome | [ ] | Claude | More negative space |
| Mysterious/exclusive vibe | [ ] | Claude | |
| Design system update | [ ] | Claude | |

## 5.2 Animations
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| PR celebration animation | [ ] | Claude | Subtle but satisfying |
| Rank-up animation | [ ] | Claude | |
| Streak animation | [ ] | Claude | |
| Level-up animation | [ ] | Claude | |
| Screen transition polish | [ ] | Claude | |

## 5.3 Onboarding
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Welcome screens | [ ] | Claude | |
| Name input | [ ] | Claude | |
| Bodyweight input | [ ] | Claude | |
| Experience level selection | [ ] | Claude | |
| Personality picker | [ ] | Claude | |

## 5.4 Notifications
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Configure expo-notifications | [ ] | Claude | |
| Rest timer notifications | [ ] | Claude | Local |
| Streak warning notifications | [ ] | Claude | |
| Rest day reminders | [ ] | Claude | |
| Notification settings screen | [ ] | Claude | |

## 5.5 Testing & QA
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Unit tests for scoring | [ ] | Claude | 100% coverage |
| Unit tests for PR detection | [ ] | Claude | 100% coverage |
| Integration tests for workout flow | [ ] | Claude | |
| E2E tests | [ ] | Claude | |
| Performance profiling | [ ] | Claude | |
| Beta testing | [ ] | User | 5-10 users |

---

# IMMEDIATE NEXT ACTIONS

## Right Now
1. [ ] Complete code audit
2. [ ] Fix critical bugs from audit
3. [ ] Complete Zustand migration
4. [ ] Add error boundaries

---

# TESTING CHECKPOINTS

## Checkpoint #1 - After Phase 0
- [ ] App launches without crash
- [ ] All navigation works
- [ ] Can log a workout
- [ ] Data persists after app close

## Checkpoint #2 - After Phase 1
- [ ] Can start workout from routine
- [ ] Set logging feels smooth
- [ ] PR detection works
- [ ] Rest timer works with notifications

## Checkpoint #3 - After Phase 2
- [ ] Can sign up and log in
- [ ] Data syncs to cloud
- [ ] Works offline, syncs when online

## Checkpoint #4 - After Phase 3
- [ ] Can add friends
- [ ] Feed shows friends' workouts
- [ ] Can react to posts
- [ ] Leaderboards work

## Checkpoint #5 - After Phase 4
- [ ] Personality system works
- [ ] XP/levels working
- [ ] Streaks tracking
- [ ] Currency earning

## Pre-Launch
- [ ] Full regression test
- [ ] Performance acceptable
- [ ] Both iOS and Android working
- [ ] Aesthetic meets vision
- [ ] Beta feedback incorporated

---

# SPEC MAPPING

| SPEC | Title | Status | Phase |
|------|-------|--------|-------|
| SPEC-001 | Error Boundary Enhancement | Pending | 0 |
| SPEC-002 | Session Persistence Fix | Complete | 0 |
| SPEC-003 | Input Validation with Toast | Pending | 1 |
| SPEC-004 | Supabase Project Setup | Complete | 2 |
| SPEC-005 | Database Schema Design | Pending | 2 |
| SPEC-006 | Auth Screens (Email/Password) | Pending | 2 |
| SPEC-007 | OAuth Integration | Pending | 2 |
| SPEC-008 | Row Level Security | Complete | 2 |
| SPEC-009 | Zustand Migration Complete | Pending | 0 |
| SPEC-010 | Routine-Based Workout Flow | Pending | 1 |

---

# DEPENDENCIES

## Technical Dependencies
- Supabase project (Phase 2+)
- Body model illustration asset (Phase 4)
- Sound effects assets (Phase 1, 4)

## Design Dependencies
- Pure-inspired design direction approval
- Personality voice scripts/content
- Body model artwork

---

**End of TODO List v2.0**
*Updated as tasks are completed or added.*
