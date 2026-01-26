# FORGERANK TODO LIST
**Actionable Development Tasks**

---

## Document Info
- **Created:** 2026-01-23
- **Last Updated:** 2026-01-25 (SPEC-008 RLS policies completed)
- **Status:** Active

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

## 0.1 Code Audit - 2026-01-23
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

## 0.2 Critical Bug Fixes - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Fix app crashes | [ ] | Claude | After audit |
| Fix broken navigation | [ ] | Claude | |
| Fix broken buttons | [ ] | Claude | |
| Fix data persistence issues | [ ] | Claude | |
| Fix workout logging flow | [ ] | Claude | |

## 0.3 Code Cleanup - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Remove dead/unused code | [ ] | Claude | |
| Consolidate duplicated logic | [ ] | Claude | |
| Fix TypeScript strict violations | [ ] | Claude | |
| Add missing error handling | [ ] | Claude | |
| Standardize code patterns | [ ] | Claude | |

## 0.4 Documentation - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Update CLAUDE.md with findings | [ ] | Claude | |
| Document current bugs | [x] | Claude | In this file |
| Create testing checklist | [ ] | Claude | |

## 0.5 Zustand Migration - **[NEW 2026-01-23 12:15]**
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Create Zustand store structure | [ ] | Claude | |
| Migrate workoutStore | [ ] | Claude | |
| Migrate currentSessionStore | [x] | Claude | SPEC-002 complete |
| Migrate routinesStore | [ ] | Claude | |
| Migrate socialStore | [ ] | Claude | |
| Migrate settings | [ ] | Claude | |
| Set up AsyncStorage persist | [ ] | Claude | |
| Remove old module-level stores | [ ] | Claude | |
| Update components to use new stores | [ ] | Claude | |
| Test all store functionality | [ ] | Claude | |

---

# PHASE 1: CORE WORKOUT EXPERIENCE

## 1.1 Routine Workflow - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Design routine selection UI | [ ] | Claude | |
| Implement routine list screen | [ ] | Claude | |
| Add "Start Workout" from routine | [ ] | Claude | |
| Workout screen shows routine exercises | [ ] | Claude | |
| Set completion tracking | [ ] | Claude | |
| Exercise completion tracking | [ ] | Claude | |
| Finish workout summary | [ ] | Claude | |
| Save completed workout | [ ] | Claude | |

## 1.2 Exercise/Set Logging - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Weight input (keyboard optimized) | [ ] | Claude | |
| Reps input | [ ] | Claude | |
| Set type selection (warmup/working) | [ ] | Claude | |
| Quick-log previous weight | [ ] | Claude | |
| Delete set | [ ] | Claude | |
| Edit logged set | [ ] | Claude | |

## 1.3 Rest Timer - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Timer auto-start after set | [ ] | Claude | |
| Configurable default duration | [ ] | Claude | |
| Visual countdown | [ ] | Claude | |
| Haptic notification | [ ] | Claude | |
| Audio notification (optional) | [ ] | Claude | |
| Skip timer button | [ ] | Claude | |
| Add time button | [ ] | Claude | |

---

# PHASE 2: BACKEND (SUPABASE)

## 2.1 Project Setup - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Create Supabase project | [ ] | User | Needs account |
| Install Supabase client | [ ] | Claude | |
| Configure environment variables | [ ] | Claude | |
| Set up development environment | [ ] | Claude | |

## 2.2 Database Schema - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Design users table | [ ] | Claude | |
| Design workouts table | [ ] | Claude | |
| Design workout_sets table | [ ] | Claude | |
| Design routines table | [ ] | Claude | |
| Design exercises table | [ ] | Claude | |
| Design friendships table | [ ] | Claude | |
| Design posts table | [ ] | Claude | |
| Design reactions table | [ ] | Claude | |
| Write migration scripts | [ ] | Claude | |
| Set up Row Level Security | [x] | Claude | SPEC-008 complete |

## 2.3 Authentication - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Email/password signup screen | [ ] | Claude | |
| Email/password login screen | [ ] | Claude | |
| Google OAuth integration | [ ] | Claude | |
| Apple Sign In integration | [ ] | Claude | |
| Auth state management | [ ] | Claude | |
| Protected routes | [ ] | Claude | |
| Logout functionality | [ ] | Claude | |
| Password reset flow | [ ] | Claude | |

## 2.4 Data Sync - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Migrate workoutStore to Supabase | [ ] | Claude | |
| Migrate routinesStore to Supabase | [ ] | Claude | |
| Implement offline queue | [ ] | Claude | |
| Implement sync on reconnect | [ ] | Claude | |
| Handle sync conflicts | [ ] | Claude | |

---

# PHASE 2.5: ENHANCED FEATURES

## 2.5 Analytics & Progress Tracking - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Progress dashboard design | [ ] | Claude | | SPEC-011 |
| Weight progression charts | [ ] | Claude | Line chart per exercise | SPEC-011 |
| Volume tracking charts | [ ] | Claude | Weekly/monthly | SPEC-011 |
| Personal records dashboard | [ ] | Claude | All PRs by exercise | SPEC-011 |
| Workout frequency calendar | [ ] | Claude | GitHub-style heatmap | SPEC-011 |
| Export data functionality | [ ] | Claude | CSV/JSON export | SPEC-011 |

## 2.6 Notifications System - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Configure expo-notifications | [ ] | Claude | | SPEC-012 |
| Supabase push integration | [ ] | Claude | | SPEC-012 |
| Rest timer notifications | [ ] | Claude | Local notifications | SPEC-012 |
| Workout reminders | [ ] | Claude | Scheduled notifications | SPEC-012 |
| PR celebration notifications | [ ] | Claude | Push notification | SPEC-012 |
| Notification settings screen | [ ] | Claude | Per-type toggles | SPEC-012 |
| Notification center/history | [ ] | Claude | | SPEC-012 |

## 2.7 Timer & Rest System - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Enhanced rest timer UI | [ ] | Claude | Circular progress | SPEC-013 |
| Interval timer mode | [ ] | Claude | Work/rest intervals | SPEC-013 |
| Interval presets | [ ] | Claude | Save/load configurations | SPEC-013 |
| Stopwatch mode | [ ] | Claude | Lap functionality | SPEC-013 |
| Background timer display | [ ] | Claude | Modal overlay | SPEC-013 |

## 2.8 Body Metrics Tracking - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Body weight logging | [ ] | Claude | With date/notes | SPEC-014 |
| Body measurements form | [ ] | Claude | Chest/waist/etc | SPEC-014 |
| Progress photo upload | [ ] | Claude | Supabase Storage | SPEC-014 |
| Photo gallery view | [ ] | Claude | Grid with filters | SPEC-014 |
| Photo comparison slider | [ ] | Claude | Before/after | SPEC-014 |
| Metrics timeline charts | [ ] | Claude | Weight/trends | SPEC-014 |

## 2.9 Deload & Peaking Cycles - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Training stress calculation | [ ] | Claude | Daily/weekly load | SPEC-015 |
| Fatigue score tracking | [ ] | Claude | Acute/chronic | SPEC-015 |
| Deload recommendations | [ ] | Claude | Auto-suggest | SPEC-015 |
| Deload week generator | [ ] | Claude | Modify routines | SPEC-015 |
| Peaking cycle builder | [ ] | Claude | Taper for competition | SPEC-015 |
| Cycle phase dashboard | [ ] | Claude | Current phase display | SPEC-015 |

## 2.10 Equipment Filtering - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Equipment type definitions | [ ] | Claude | Barbell/dumbbells/etc | SPEC-017 |
| Equipment inventory screen | [ ] | Claude | User's available gear | SPEC-017 |
| Gym/home mode toggle | [ ] | Claude | Filter exercises | SPEC-017 |
| Equipment filter presets | [ ] | Claude | Quick filters | SPEC-017 |
| Substitute exercise suggestions | [ ] | Claude | Similar movements | SPEC-017 |

## 2.11 Theming System - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Theme provider setup | [ ] | Claude | React Context | SPEC-018 |
| Dark mode implementation | [ ] | Claude | Full dark theme | SPEC-018 |
| Color theme variants | [ ] | Claude | Blue/green/purple | SPEC-018 |
| Theme settings screen | [ ] | Claude | Theme picker | SPEC-018 |
| High-contrast mode | [ ] | Claude | Accessibility | SPEC-018 |

## 2.12 Billing & Payments - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Stripe integration | [ ] | Claude | Web payments | SPEC-019 |
| iOS StoreKit IAP | [ ] | Claude | Native subscriptions | SPEC-019 |
| Android Play Billing IAP | [ ] | Claude | Native subscriptions | SPEC-019 |
| Subscription tier definition | [ ] | Claude | Free/Pro/Elite | SPEC-019 |
| Subscription management UI | [ ] | Claude | View/cancel plans | SPEC-019 |
| Free trial implementation | [ ] | Claude | 7-day trial | SPEC-019 |
| Receipt validation | [ ] | Claude | Apple/Google | SPEC-019 |

## 2.13 Social Feed - **[NEW 2026-01-25]**
| Task | Status | Assigned | Notes | SPEC |
|------|--------|----------|-------|-----|
| Friend system (Supabase) | [ ] | Claude | Requests/accept | SPEC-016 |
| Activity feed (real-time) | [ ] | Claude | Supabase real-time | SPEC-016 |
| Like/unlike activities | [ ] | Claude | | SPEC-016 |
| Comments on workouts | [ ] | Claude | | SPEC-016 |
| Workout sharing toggle | [ ] | Claude | Privacy controls | SPEC-016 |
| User search/discovery | [ ] | Claude | Find friends | SPEC-016 |

---

# PHASE 3: SOCIAL FEATURES

## 3.1 Friends - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| User search endpoint | [ ] | Claude | |
| User search UI | [ ] | Claude | |
| Send friend request | [ ] | Claude | |
| Friend request notifications | [ ] | Claude | |
| Accept/decline requests | [ ] | Claude | |
| Friends list (from Supabase) | [ ] | Claude | |
| Unfriend functionality | [ ] | Claude | |

## 3.2 Social Feed - 2026-01-23
| Task | Status | Assigned | Notes |
|------|--------|----------|-------|
| Post workout to Supabase | [ ] | Claude | |
| Fetch friends' posts | [ ] | Claude | |
| Real-time feed updates | [ ] | Claude | |
| Reactions (from Supabase) | [ ] | Claude | |
| Privacy enforcement | [ ] | Claude | |

---

# IMMEDIATE NEXT ACTIONS

## Right Now - 2026-01-23
1. [ ] Start code audit
2. [ ] Run app in Expo Go, document issues
3. [ ] Create bug report from findings

---

# TESTING CHECKPOINTS

## Expo Go Test #1 - After Phase 0
**When:** After stabilization complete
**Test:**
- [ ] App launches without crash
- [ ] All navigation works
- [ ] Can create routine
- [ ] Can start workout from routine
- [ ] Can log sets
- [ ] Can finish workout
- [ ] Data persists after app close

## Expo Go Test #2 - After Phase 1
**When:** After core workout experience
**Test:**
- [ ] Full workout flow (routine → log → finish)
- [ ] PR detection works
- [ ] Rest timer works
- [ ] All buttons functional

## Expo Go Test #3 - After Phase 2
**When:** After backend integration
**Test:**
- [ ] Can sign up
- [ ] Can log in
- [ ] Data syncs across sessions
- [ ] Offline workout saved
- [ ] Online sync works

---

**End of TODO List v1.0**
*Updated as tasks are completed or added.*
