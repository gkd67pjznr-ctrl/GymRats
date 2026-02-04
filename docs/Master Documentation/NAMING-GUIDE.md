# GymRats Naming Guide

Canonical naming conventions for all features and branding.

---

## App Name

**GymRats** (one word, capital G and R)

- App Store: "GymRats"
- Code references: `gymrats`, `GymRats`
- URLs: `gymrats.app` (preferred)

---

## Feature Names

| Feature | Canonical Name | NOT This |
|---------|----------------|----------|
| Analytics dashboard | **Gym Lab** | Forge Lab, GymR Lab, GymRats Lab |
| Training identity | **DNA** | Forge DNA, GymR DNA |
| In-game currency | **Juice** | Forge Tokens, Coins, GymR Coins |
| Seasonal content | **GymR Seasons** | Forge Seasons |
| Achievement system | **Milestones** | Forge Milestones (optional rename) |
| AI personalities | **Gym Buddies** | Buddies (acceptable short form) |
| User progression | **Ranks** | GymRats Ranks, GymR Ranks |
| Scoring system | **GymRats Score** | GR Score |

---

## Tab Names

| Tab | Name |
|-----|------|
| Home | Home |
| Workout | Workout |
| Feed | Feed |
| Analytics | Gym Lab |
| Profile | Profile |

---

## UI Labels

### Currency Display
```
Juice: 1,250
+50 Juice
```

### Subscription
```
Pro
GymRats Pro
```

### Ranks
```
Rank: Gold III
Your Bench Rank: Platinum I
```

---

## Code Naming Conventions

### Store Names
- `juiceStore` (not `forgeTokenStore`)
- `gymLabStore` (not `forgeLabStore`)
- `dnaStore` (if separate from gymLabStore)
- `milestonesStore` (acceptable as-is)

### File Names
- `GymLab.tsx`
- `DNA.tsx`
- `JuiceDisplay.tsx`

### Type Names
```typescript
type JuiceTransaction = { ... }
type GymLabData = { ... }
type DNAFingerprint = { ... }
```

---

## Documentation References

When writing docs, use:
- "Gym Lab" (two words, both capitalized)
- "DNA" (all caps)
- "Juice" (capitalized as proper noun)
- "GymR Seasons" (capital G, R, S)
- "Milestones" (capitalized)

---

## Marketing Copy

### Tagline Options (to finalize)
- "Track lifts. Earn ranks."
- "Your lifting companion"
- "Lift. Rank. Repeat."
- "Workout tracking with soul"

### Feature Descriptions
- "Gym Lab: Your complete analytics dashboard"
- "DNA: Your unique training fingerprint"
- "Earn Juice and unlock new gym buddies"
- "Compete in GymR Seasons for exclusive rewards"

---

## Emoji Usage

Approved emojis for UI/marketing:
- 💪 (strength)
- 🔥 (fire/intensity)
- 🏆 (achievement)
- ⚡ (energy/quick)
- 🧬 (DNA)
- 🧪 (Lab)
- 🥤 (Juice - optional)

---

## Migration Checklist

Files that may still have old naming:

### Code
- [ ] Search for "Forge Token" → "Juice"
- [ ] Search for "forgeLab" → "gymLab"
- [ ] Search for "forgeDNA" → "dna"
- [ ] Search for "Forge Season" → "GymR Season"

### Documentation
- [ ] 1-PROJECT-STATUS.md
- [ ] FEATURE-MASTER.md
- [ ] Feature files in docs/features/
- [ ] CLAUDE_WORKFLOW.md

### UI Strings
- [ ] Settings screen
- [ ] Shop/Store
- [ ] Profile display
- [ ] Achievement descriptions
