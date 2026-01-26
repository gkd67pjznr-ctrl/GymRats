# docs/EXECUTION_PLAN_NOW_NEXT_LATER.md

> Forgerank execution plan (keeps us out of “random refactors” and focused on shipping).
> Last updated: 2026-01-16

## Ground rules (so we stop getting lost)
- **If it doesn’t help v1 ship, it goes to Later.**
- **No “perfect” design.** We standardize (tokens + components), then improve after v1.
- **One vertical slice at a time:** Plan -> Live -> Save -> History -> Share.

---

# NOW (ship-critical, unblock v1)

## A) App must “work end-to-end”
1. **Plan selection**
   - User can start either: *Free Workout* or *Planned Workout*.
   - Planned workout shows an exercise list (blocks) + current focus.

2. **Live workout logging**
   - Add sets for selected exercise
   - Add sets for any block exercise
   - Mark sets done (toggle)
   - Rest timer works
   - Session persistence (resume after app close)

3. **Finish workout**
   - Creates `WorkoutSession` with valid `WorkoutSet.timestampMs`
   - Stores in `workoutStore`
   - Clears current session + clears current plan
   - Generates recap cues

4. **History view**
   - List sessions
   - Tap session -> view sets by exercise (read-only is fine for v1)

## B) Minimal “Forgerank” scoring wiring (not final tuning)
- Compute a score/rank per exercise using:
  - user best e1RM (or best session)
  - a “top standard” per exercise (from verified tops / constants)
- Display rank badge somewhere visible:
  - history detail screen + a debug screen is fine for now

## C) Design consistency baseline (don’t overdo it)
- Use FR tokens for spacing/radii/type on:
  - Feed cards
  - Live workout
  - History list items
- RN-safe font weights only (<= 900)

---

# NEXT (v1 polish + social v1)

## A) Forgerank scoring (real tuning)
- Decide:
  - How many ranks? (default 20)
  - Curve behavior (early ranks easier; late ranks harder)
  - Per-exercise ladders (bench vs curls shouldn’t rank the same way)
- Add “PR summary” aggregator:
  - best e1RM per exercise
  - last updated
  - rep-at-weight map (optional)
- Show:
  - rank + progress bar to next
  - “what changed” delta after sets (rep/weight/e1rm)

## B) Social v1 (controlled scope)
- Feed shows:
  - user posts: finished workout summary
- Reactions:
  - a few default emotes
- Comments:
  - basic list + add comment
- Notifications:
  - local-only mock for now (or in-store)
- Friends:
  - minimal friend list + filter feed (public vs friends)

## C) UX improvements
- Quick-add quality:
  - weight/reps stepper feels great
  - “repeat last set” shortcut
- Better empty states everywhere

---

# LATER (big features, do not touch until v1 is stable)

## A) Chat system
- Mutual/friends-only gates
- Anti-spam limits (cooldowns / mutual follow)
- Message requests + blocking/report

## B) Store / cosmetics
- Emote bundles
- Card skins / themes

## C) Health integrations
- Apple Health
- Music / audio reactive effects

## D) Full exercise DB expansion
- Body heatmap
- Muscle subdivisions
- Smart recommendations

---

# Definition of Done for v1
- A user can:
  1) start a workout
  2) log sets
  3) finish and save
  4) see it in history
  5) see a simple rank/score signal
- No crashes, no TypeScript errors, no broken navigation.
