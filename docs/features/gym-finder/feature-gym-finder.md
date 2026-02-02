# Feature: Gym Finder / Map

## Overview
Full gym ecosystem — discover gyms, read community reviews, see which friends go where, and access gym-level leaderboards. Potential B2B revenue through gym partnerships.

**Status:** Planned | **Progress:** 0/6 features
**Priority:** Post-launch (Phase 6)
**Source:** 2026-01-29 brainstorm interview

---

## Sub-Features

### Planned - Gym Discovery
- [ ] Map view with nearby gyms (Google Maps / Apple Maps)
- [ ] List view with distance sorting
- [ ] Basic info: name, address, hours, phone, website
- [ ] Photos from community uploads
- [ ] Filter by type (commercial, powerlifting, CrossFit, etc.)

---

### Planned - Community Gym Profiles
- [ ] User ratings and reviews
- [ ] Equipment lists (crowdsourced)
- [ ] Photo uploads
- [ ] Pros/cons tags
- [ ] Pricing info (if available)
- [ ] Verified profiles for partnered gyms

---

### Planned - Friend Gym Mapping
- [ ] See which gym your friends are tagged at
- [ ] "X friends work out here" on gym profiles
- [ ] Optional: share your gym on profile
- [ ] Find friends at the same gym

---

### Planned - Gym-Level Leaderboards
- [ ] Top lifters at your gym (by Forgerank)
- [ ] Volume leaders at your gym
- [ ] Gym vs gym comparisons (average ranks)
- [ ] Monthly gym champions

---

### Planned - Gym Partnerships
- [ ] Featured gym listings (promoted placement)
- [ ] Discount codes for Forgerank users
- [ ] Gym-branded challenges
- [ ] B2B revenue model (gyms pay for premium listing)
- [ ] Analytics dashboard for gym owners (anonymized member data)

---

### Planned - Check-In System
- [ ] Optional GPS-based gym detection (non-pushy)
- [ ] Manual "I'm at the gym" button
- [ ] Check-in history
- [ ] Smooth UX — don't require location permissions
- [ ] Auto-start workout prompt when checking in (optional)

---

## Technical Notes

**Data Model:**
```typescript
type Gym = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'commercial' | 'powerlifting' | 'crossfit' | 'home' | 'other';
  rating: number;         // 1-5 average
  reviewCount: number;
  photos: string[];
  equipment: string[];
  isPartner: boolean;
  memberCount: number;    // Forgerank users tagged here
};
```

**APIs:**
- Google Places API or Apple MapKit for gym discovery
- Supabase for community data (reviews, equipment, photos)
- Geolocation for proximity-based features

---

## Dependencies

- Geolocation permissions (optional)
- Maps SDK (Google Maps or Apple MapKit)
- Backend (gym profiles, reviews, check-ins)
- Social features (friend gym mapping)
- Leaderboards system

---

## Priority

**P3 (Post-Launch Phase 6):**
- Basic gym discovery + community profiles
- Friend gym mapping
- Check-in system

**P4 (Future):**
- Gym-level leaderboards
- Gym partnerships
- B2B revenue features
