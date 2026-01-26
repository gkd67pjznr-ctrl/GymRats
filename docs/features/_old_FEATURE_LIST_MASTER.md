# FORGERANK FEATURE LIST
**Complete Feature Inventory with Priorities**

---

## Document Info
- **Created:** 2026-01-23
- **Last Updated:** 2026-01-25 (Post-Interview Update)
- **Status:** Comprehensive inventory from deep interview session

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

# CORE WORKOUT FEATURES

## 1. Workout Logging (P0)

### 1.1 Set Input Methods (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Quick number pad | [ ] | P0 | Calculator-style fast input |
| Stepper +/- buttons | [ ] | P0 | Increment weight/reps easily |
| Auto-fill from last workout | [ ] | P0 | Smart defaults, minimal typing |
| Voice input | [ ] | P3 | "225 for 5" hands-free (future) |

### 1.2 Routine-Based Workout (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| View saved routines list | [ ] | P0 | |
| Start workout from routine | [ ] | P0 | Primary workflow |
| Exercise sequence display | [ ] | P0 | Show planned exercises |
| Set logging (weight/reps) | [~] | P0 | Exists but needs polish |
| Mark set complete | [~] | P0 | Exists |
| Skip exercise option | [ ] | P0 | |
| Add unplanned exercise | [ ] | P0 | |
| Finish workout flow | [~] | P0 | Exists |

### 1.3 Plan-Based Workout (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Browse available plans | [~] | P0 | Exists, needs work |
| Start plan/program | [ ] | P0 | |
| Track plan progress | [ ] | P0 | Week/day indicators |
| Select today's workout | [ ] | P0 | |
| Plan completion tracking | [ ] | P1 | |

### 1.4 Free/Quick Workout (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Start empty workout | [~] | P1 | Current live-workout |
| Add exercises on the fly | [~] | P1 | Exists |
| Exercise search/picker | [~] | P1 | Exists |

### 1.5 Rest Timer (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Configurable rest duration | [~] | P0 | Exists |
| Auto-start after set | [ ] | P0 | |
| Haptic notification | [~] | P0 | Exists |
| Audio notification | [ ] | P0 | Sound effects matter |
| Push notification when done | [ ] | P0 | Even when app backgrounded |
| Skip timer option | [ ] | P0 | |
| Add time button | [ ] | P1 | |
| iOS Live Activities widget | [ ] | P2 | Dynamic island support |

---

## 2. PR Detection & Celebration (P0)

### 2.1 PR Types (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Weight PR detection | [~] | P0 | Exists, needs validation |
| Rep PR detection | [~] | P0 | Exists, needs validation |
| E1RM PR detection | [~] | P0 | Exists, needs validation |

### 2.2 PR Celebration Experience (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Subtle but satisfying toast | [ ] | P0 | Not full-screen takeover |
| Sound effects | [ ] | P0 | Audio cues are important |
| Haptic feedback | [~] | P0 | Exists |
| One-tap share to feed | [ ] | P0 | Instant share |
| Personalized cue message | [ ] | P0 | From selected personality |

### 2.3 PR Enhancements (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| PR history view | [ ] | P1 | See all PRs |
| PR dashboard by exercise | [ ] | P1 | All PRs organized |

---

## 3. Forgerank Scoring System (P0)

### 3.1 Core Scoring (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| 0-1000 score calculation | [~] | P0 | Exists, needs validation |
| Score breakdown/explanation | [ ] | P0 | Show why score is X |
| Per-exercise scores | [ ] | P0 | |
| Overall Forgerank | [ ] | P0 | Aggregate score |
| Static verified standards | [~] | P0 | Exists in rankTops.ts |

### 3.2 Rank Tiers (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| 20-rank display (Iron to Mythic) | [~] | P0 | Exists |
| Progress to next rank | [ ] | P0 | Visual progress bar |
| Rank up celebration | [ ] | P0 | Animation + sound |
| Rank badges on profile | [ ] | P1 | Show highest ranks |
| Rank history | [ ] | P2 | |

### 3.3 Anti-Cheat System (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Anomaly detection (10%+ e1RM jump) | [ ] | P1 | For top 3 ranks |
| Playful anomaly cue | [ ] | P1 | "DAAAAMN did you really do that??" |
| Cross-exercise validation | [ ] | P2 | Predict strength across exercises |

---

## 4. Cue System / Gym Buddy (P0)

### 4.1 Personality System (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Default personality | [ ] | P0 | Ships with app |
| 3-5 starter personalities | [ ] | P0 | Variety at launch |
| Personality picker in settings | [ ] | P0 | Easy to change |
| Personality picker in onboarding | [ ] | P0 | Choose during setup |

### 4.2 Cue Types (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| PR celebration cues | [~] | P0 | Exists |
| Rank-up cues | [ ] | P0 | |
| Streak milestone cues | [ ] | P1 | |
| Contextual encouragement | [ ] | P1 | Knows your state |
| Random/timed motivation | [ ] | P2 | Sometimes on app open |

### 4.3 Voice/Audio (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Text cues | [~] | P0 | Exists |
| Audio cues (optional) | [ ] | P1 | User can enable |
| Voice pack purchase | [ ] | P2 | Cosmetic store |
| AI-generated voices | [ ] | P3 | Arnold, influencers, etc. |

---

## 5. Body Model & Muscle Tracking (P1)

### 5.1 Body Model Display (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| 2D body illustration | [ ] | P1 | Clean and readable |
| Male/female toggle | [ ] | P1 | User customizable |
| Detailed muscle subdivisions | [ ] | P1 | Upper chest, rear delts, etc. |
| Volume-based gradient coloring | [ ] | P1 | Based on sets per muscle |

### 5.2 Exercise-Muscle Mapping (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Primary muscle per exercise | [ ] | P1 | Main muscle worked |
| Secondary muscle per exercise | [ ] | P1 | Supporting muscle |
| Tertiary muscle per exercise | [ ] | P2 | Minor involvement |
| Muscle group aggregation | [ ] | P1 | For workout summary |

### 5.3 Post Default Image (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Body model as default post image | [ ] | P1 | If no photo uploaded |
| Muscles colored by workout | [ ] | P1 | Visual workout summary |

---

## 6. Routines & Plans (P0)

### 6.1 User Routines (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Create routine | [~] | P0 | Exists |
| Add exercises to routine | [~] | P0 | Exists |
| Set target sets/reps | [ ] | P0 | |
| Edit routine | [ ] | P0 | |
| Delete routine | [ ] | P0 | |
| Duplicate routine | [ ] | P1 | |

### 6.2 Premade Plans (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| 5/3/1 template | [ ] | P1 | |
| PPL template | [ ] | P1 | |
| nSuns template | [ ] | P2 | |
| Starting Strength | [ ] | P2 | |
| Custom plan builder | [ ] | P2 | |

### 6.3 Progressive Overload (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Auto-increment weights | [ ] | P2 | Based on performance |
| Deload detection | [ ] | P2 | Suggest deload week |
| Progression rules config | [ ] | P2 | |

---

## 7. Backend & Accounts (P0)

### 7.1 Authentication (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Email/password signup | [ ] | P0 | |
| Email/password login | [ ] | P0 | |
| Google OAuth | [ ] | P0 | |
| Apple Sign In | [ ] | P0 | Required for iOS |
| Password reset | [ ] | P0 | |
| Logout | [ ] | P0 | |
| Delete account | [ ] | P1 | GDPR compliance |

### 7.2 Cloud Sync (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Workout history sync | [ ] | P0 | |
| Routines sync | [ ] | P0 | |
| Settings sync | [ ] | P1 | |
| Offline queue | [ ] | P0 | Sync when online |
| Conflict resolution | [ ] | P0 | |
| Multi-device support | [ ] | P0 | |

### 7.3 User Profile (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Profile creation | [ ] | P0 | |
| Display name | [ ] | P0 | |
| Avatar upload | [ ] | P1 | |
| Bio | [ ] | P2 | |
| Bodyweight tracking | [~] | P0 | Exists locally |
| Unit preference (lb/kg) | [~] | P0 | Exists locally |
| Experience level | [ ] | P0 | Beginner/intermediate/advanced |

---

## 8. Social Features (P0)

### 8.1 Friends System (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Username search | [ ] | P0 | |
| QR code sharing | [ ] | P1 | Gym-friendly |
| Algorithm-suggested users | [ ] | P1 | Based on activity/similarity |
| Send friend request | [ ] | P0 | |
| Accept/decline request | [ ] | P0 | |
| Friends list | [~] | P0 | Exists locally |
| Unfriend | [ ] | P0 | |
| Block user | [ ] | P1 | |

### 8.2 Social Feed (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Global feed tab | [ ] | P0 | Public workouts from everyone |
| Friends feed tab | [ ] | P0 | Workouts from friends only |
| Post workout to feed | [~] | P0 | Exists locally |
| Privacy (public/friends) | [~] | P0 | Public by default |
| User caption/notes | [ ] | P0 | Add context |
| Optional photo upload | [ ] | P0 | |
| Body model default image | [ ] | P1 | If no photo |
| Show workout stats | [ ] | P0 | Exercises, sets, PRs |
| Show duration | [ ] | P1 | |
| Show completion % | [ ] | P1 | For planned workouts |
| Show rank badges earned | [ ] | P0 | |
| Like/react to posts | [~] | P0 | Exists locally |
| Comments | [ ] | P1 | |

### 8.3 Leaderboards (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Friends leaderboard | [ ] | P0 | |
| Per-exercise rankings | [ ] | P0 | Highest rank among friends |
| Overall Forgerank ranking | [ ] | P0 | Average/total across exercises |
| Volume/consistency ranking | [ ] | P1 | Who works out most |
| User level ranking | [ ] | P1 | Who's grinding XP |
| Global leaderboard | [ ] | P2 | |
| Time filters (week/month/all) | [ ] | P1 | |

---

## 9. Gamification (P0)

### 9.1 User Level / XP System (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| XP earned from workouts | [ ] | P0 | Main XP source |
| XP bar / level display | [ ] | P0 | Visual progression |
| Level-up celebration | [ ] | P0 | Animation in post-workout |
| Currency earned from leveling | [ ] | P0 | For cosmetic store |

### 9.2 Currency System (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Currency balance display | [ ] | P1 | |
| Earn from PR achievements | [ ] | P1 | |
| Earn from daily login | [ ] | P1 | |
| Earn from streak milestones | [ ] | P1 | 7-day, 30-day, etc. |
| Earn from referrals | [ ] | P2 | Invite friends |

### 9.3 Streaks (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Workout streak counter | [ ] | P0 | Simple day count |
| Visual streak calendar | [ ] | P0 | GitHub-style contribution graph |
| Streak breaks after 5 days | [ ] | P0 | Defined threshold |
| Streak color progression | [ ] | P0 | Changes based on length |
| Streak animation in summary | [ ] | P0 | Post-workout celebration |
| Streak milestones | [ ] | P1 | 7, 30, 100 days |

### 9.4 Achievements/Badges (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Badge system | [ ] | P2 | |
| First workout badge | [ ] | P2 | |
| PR badges | [ ] | P2 | |
| Consistency badges | [ ] | P2 | |
| Strength milestone badges | [ ] | P2 | |

---

## 10. Cosmetic Store (P1)

### 10.1 Theme Store (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Theme/color scheme options | [ ] | P1 | Change accent colors |
| Theme preview | [ ] | P1 | See before buying |
| Theme purchase with currency | [ ] | P1 | |
| Theme application | [ ] | P1 | |

### 10.2 Voice Pack Store (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Voice pack options | [ ] | P2 | Different personalities |
| Voice pack preview | [ ] | P2 | Hear samples |
| Voice pack purchase | [ ] | P2 | |
| AI-generated celebrity voices | [ ] | P3 | Arnold, influencers |

### 10.3 Card Skin Store (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Card skin options | [ ] | P2 | How posts look |
| Card skin preview | [ ] | P2 | |
| Card skin purchase | [ ] | P2 | |

### 10.4 Profile Customization Store (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Profile badges | [ ] | P2 | |
| Profile frames | [ ] | P2 | |
| Profile titles | [ ] | P2 | |

---

## 11. Analytics & Insights (P1 - PREMIUM)

### 11.1 Progress Charts (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Strength over time | [ ] | P1 | Per exercise |
| E1RM trend lines | [ ] | P1 | |
| Volume trends | [ ] | P1 | Weekly/monthly |
| Workout frequency heatmap | [ ] | P1 | Training consistency |

### 11.2 Body Composition (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Bodyweight chart | [ ] | P1 | Over time |
| Body measurements tracking | [ ] | P1 | Chest/waist/etc |
| Progress photos | [ ] | P1 | Upload and compare |
| Photo comparison slider | [ ] | P2 | Before/after view |

### 11.3 Export (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| CSV export | [ ] | P1 | FREE feature |
| JSON export | [ ] | P2 | |
| PDF report | [ ] | P2 | |

### 11.4 Web App (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Web dashboard | [ ] | P2 | View analytics on desktop |
| Web routine builder | [ ] | P2 | Build routines on desktop |
| Web workout history | [ ] | P2 | Read-only view |

---

## 12. Integrations (P1)

### 12.1 Health Platforms (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Apple Health sync | [ ] | P1 | Weight, BMI |
| Google Fit sync | [ ] | P2 | |
| Fitbit sync | [ ] | P2 | |

### 12.2 Music Integration (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Spotify controls | [ ] | P2 | Play/pause/skip |
| Apple Music controls | [ ] | P2 | |
| Now playing display | [ ] | P2 | |

---

## 13. Onboarding (P0)

### 13.1 New User Flow (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Welcome screens | [ ] | P0 | |
| Name input | [ ] | P0 | |
| Bodyweight input | [ ] | P0 | |
| Experience level selection | [ ] | P0 | |
| Personality picker | [ ] | P0 | Choose gym buddy |

### 13.2 Feature Tutorials (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Guided first workout | [ ] | P2 | Walk through logging |
| PR system explanation | [ ] | P2 | |
| Forgerank explanation | [ ] | P2 | |
| Social features tour | [ ] | P2 | |

---

## 14. Settings & Preferences (P1)

### 14.1 App Settings (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Unit preference (lb/kg) | [~] | P0 | Exists |
| Default rest timer duration | [ ] | P1 | |
| Notification preferences | [ ] | P1 | |
| Haptic feedback toggle | [ ] | P1 | |
| Sound effects toggle | [ ] | P1 | |
| Theme selection | [ ] | P2 | |

### 14.2 Privacy Settings (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Default post privacy | [ ] | P1 | Public by default |
| Profile visibility | [ ] | P1 | |
| Activity visibility | [ ] | P1 | |

### 14.3 Personality Settings (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Change gym buddy personality | [ ] | P0 | |
| Audio cue toggle | [ ] | P1 | |
| Cue frequency settings | [ ] | P2 | |

---

## 15. UI/UX Polish (P0)

### 15.1 Visual Design (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Dark gradient backgrounds | [ ] | P0 | Pure-inspired |
| Bold typography | [ ] | P0 | Confident, statement-making |
| Minimal UI chrome | [ ] | P0 | Lots of negative space |
| Accent color pops | [~] | P0 | Exists via design system |
| Mysterious/exclusive vibe | [ ] | P0 | Members-only feel |
| Loading states | [ ] | P0 | |
| Error states | [ ] | P0 | |
| Empty states | [ ] | P0 | |

### 15.2 Animations (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| PR celebration animation | [ ] | P0 | Subtle but satisfying |
| Rank-up animation | [ ] | P0 | |
| Streak animation | [ ] | P0 | In post-workout summary |
| Level-up animation | [ ] | P0 | |
| Smooth transitions | [ ] | P0 | |

### 15.3 Navigation (P0)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Tab navigation | [~] | P0 | Exists |
| Stack navigation | [~] | P0 | Exists |
| Deep linking | [ ] | P2 | |
| Back navigation consistency | [ ] | P0 | |

---

## 16. Content Moderation (P1)

### 16.1 Reporting (P1)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Report post | [ ] | P1 | |
| Report user | [ ] | P1 | |
| Block user | [ ] | P1 | |

### 16.2 Automated Moderation (P2)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| AI content pre-filtering | [ ] | P2 | |
| Inappropriate content detection | [ ] | P2 | |

---

# FEATURE COUNT SUMMARY

| Priority | Total | Complete | In Progress | Not Started |
|----------|-------|----------|-------------|-------------|
| P0 | ~85 | 0 | ~25 | ~60 |
| P1 | ~70 | 0 | ~5 | ~65 |
| P2 | ~45 | 0 | 0 | ~45 |
| P3 | ~5 | 0 | 0 | ~5 |

**Total Features:** ~205

---

# PREMIUM vs FREE

## Free Features
- Full workout logging
- Forgerank scoring and ranks
- Social feed + friends + reactions
- Basic history/calendar
- Streak tracking
- Starter personalities (3-5)
- Leaderboards
- CSV export
- Cosmetic store access (earn currency)

## Premium Features (Yearly Subscription)
- Advanced analytics/charts
- Body composition tracking (weight, measurements, photos)
- Cloud sync + multi-device
- Web app access
- Early access to new features

## Cosmetic Store (Currency-Based)
- Themes/color schemes
- Voice packs/personalities
- Card skins
- Profile customization

---

**End of Feature List v2.0**
*Updated as features are completed or priorities change.*
