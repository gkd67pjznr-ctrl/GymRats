# Feature: Templates Marketplace

## Overview
Community-driven workout template sharing. Users create and publish workout routines, popular ones rise to the top, creators get credit and attribution.

**Status:** Planned | **Progress:** 0/4 features
**Priority:** Post-launch
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### Planned - Create & Publish
- [ ] Create workout templates from routine builder
- [ ] Add description, goal tags, difficulty level
- [ ] Publish to marketplace (public)
- [ ] Edit or unpublish anytime
- [ ] Version history

---

### Planned - Browse & Search
- [ ] Browse by category (strength, hypertrophy, sport-specific, etc.)
- [ ] Search by name, exercise, or creator
- [ ] Filter by: difficulty, days/week, goal, popularity
- [ ] Preview template before importing

---

### Planned - Popularity Ranking
- [ ] Templates ranked by usage count
- [ ] Rating system (1-5 stars)
- [ ] "Trending" and "Top All Time" sections
- [ ] Featured templates (staff picks)

---

### Planned - Creator Attribution
- [ ] Creator name and profile link on template
- [ ] "Created by" badge on routines
- [ ] Creator profile shows published templates
- [ ] Top creators become "Community Coaches" (future)
- [ ] Could tie into coaching feature

---

## Technical Notes

**Data Model:**
```typescript
type PublishedTemplate = {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  exercises: TemplateExercise[];
  usageCount: number;
  rating: number;
  publishedAt: number;
};
```

---

## Dependencies

- Routine builder (existing)
- Backend (template storage, ratings)
- User profiles (creator attribution)

---

## Priority

**P3 (Post-Launch):**
- Basic create, publish, browse
- Popularity ranking
