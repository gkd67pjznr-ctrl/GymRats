import type { PremadePlan } from './types';

/**
 * Curated sample plans for each category
 * These serve as templates and examples
 */
export const SAMPLE_PLANS: PremadePlan[] = [
  // ============= BODYBUILDING =============
  {
    id: 'bb-push-pull-legs',
    name: 'Push Pull Legs (PPL)',
    category: 'bodybuilding',
    description: 'Classic 6-day split for balanced muscle development. Push days focus on chest, shoulders, triceps. Pull days target back and biceps. Leg days build lower body mass.',
    difficulty: 'intermediate',
    durationWeeks: 12,
    daysPerWeek: 6,
    exercises: [
      // Push Day
      { exerciseId: 'bench-press', targetSets: 4, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90 },
      { exerciseId: 'incline-dumbbell-press', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 },
      { exerciseId: 'overhead-press', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 },
      { exerciseId: 'lateral-raise', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 },
      { exerciseId: 'tricep-pushdown', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 },
    ],
    tags: ['hypertrophy', 'intermediate', '6-day', 'split'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  {
    id: 'bb-upper-lower',
    name: 'Upper Lower 4-Day',
    category: 'bodybuilding',
    description: 'Efficient 4-day split alternating upper and lower body. Perfect for building muscle with adequate recovery time.',
    difficulty: 'beginner',
    durationWeeks: 8,
    daysPerWeek: 4,
    exercises: [
      // Upper Day
      { exerciseId: 'bench-press', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 },
      { exerciseId: 'bent-over-row', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 },
      { exerciseId: 'overhead-press', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 75 },
      { exerciseId: 'lat-pulldown', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 },
      { exerciseId: 'bicep-curl', targetSets: 3, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60 },
    ],
    tags: ['hypertrophy', 'beginner', '4-day', 'balanced'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  // ============= CALISTHENICS =============
  {
    id: 'cali-basics',
    name: 'Calisthenics Fundamentals',
    category: 'calisthenics',
    description: 'Master the fundamental bodyweight movements. Build a strong foundation with push-ups, pull-ups, dips, and core work.',
    difficulty: 'beginner',
    durationWeeks: 8,
    daysPerWeek: 3,
    exercises: [
      { exerciseId: 'push-up', targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 90, notes: 'Focus on full ROM' },
      { exerciseId: 'pull-up', targetSets: 4, targetRepsMin: 5, targetRepsMax: 10, restSeconds: 120, notes: 'Use band if needed' },
      { exerciseId: 'dip', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90 },
      { exerciseId: 'squat', targetSets: 4, targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60, notes: 'Bodyweight only' },
      { exerciseId: 'plank', targetSets: 3, targetRepsMin: 30, targetRepsMax: 60, restSeconds: 60, notes: 'Hold for time (seconds)' },
    ],
    tags: ['bodyweight', 'beginner', 'fundamentals'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  {
    id: 'cali-skills',
    name: 'Skill Development Program',
    category: 'calisthenics',
    description: 'Progress toward advanced calisthenics skills: handstand, muscle-up, front lever progressions.',
    difficulty: 'advanced',
    durationWeeks: 16,
    daysPerWeek: 4,
    exercises: [
      { exerciseId: 'handstand-push-up', targetSets: 5, targetRepsMin: 3, targetRepsMax: 8, restSeconds: 120, notes: 'Wall-assisted if needed' },
      { exerciseId: 'muscle-up', targetSets: 5, targetRepsMin: 1, targetRepsMax: 5, restSeconds: 180, notes: 'Negatives if not yet achieved' },
      { exerciseId: 'front-lever-hold', targetSets: 4, targetRepsMin: 5, targetRepsMax: 15, restSeconds: 120, notes: 'Tuck/straddle progression' },
      { exerciseId: 'l-sit', targetSets: 4, targetRepsMin: 10, targetRepsMax: 30, restSeconds: 90, notes: 'Hold for time' },
      { exerciseId: 'pistol-squat', targetSets: 3, targetRepsMin: 5, targetRepsMax: 10, restSeconds: 90, notes: 'Each leg' },
    ],
    tags: ['bodyweight', 'advanced', 'skills', 'gymnastics'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  // ============= CARDIO =============
  {
    id: 'cardio-beginner-conditioning',
    name: 'Beginner Conditioning',
    category: 'cardio',
    description: 'Build your aerobic base with progressive running and rowing. Perfect for beginners looking to improve endurance.',
    difficulty: 'beginner',
    durationWeeks: 6,
    daysPerWeek: 3,
    exercises: [
      { exerciseId: 'treadmill-run', targetSets: 1, targetRepsMin: 20, targetRepsMax: 30, restSeconds: 0, notes: 'Minutes at easy pace' },
      { exerciseId: 'rowing-machine', targetSets: 3, targetRepsMin: 5, targetRepsMax: 8, restSeconds: 120, notes: 'Minutes per interval' },
      { exerciseId: 'jump-rope', targetSets: 5, targetRepsMin: 1, targetRepsMax: 2, restSeconds: 60, notes: 'Minutes per set' },
      { exerciseId: 'burpee', targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60 },
    ],
    tags: ['conditioning', 'beginner', 'endurance'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  {
    id: 'cardio-hiit',
    name: 'HIIT Fat Burner',
    category: 'cardio',
    description: 'High-intensity interval training for maximum calorie burn and metabolic conditioning. Short, intense bursts with active recovery.',
    difficulty: 'intermediate',
    durationWeeks: 8,
    daysPerWeek: 4,
    exercises: [
      { exerciseId: 'assault-bike', targetSets: 8, targetRepsMin: 20, targetRepsMax: 30, restSeconds: 60, notes: 'Seconds all-out effort' },
      { exerciseId: 'battle-ropes', targetSets: 6, targetRepsMin: 30, targetRepsMax: 45, restSeconds: 45, notes: 'Seconds max effort' },
      { exerciseId: 'box-jump', targetSets: 5, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60 },
      { exerciseId: 'kettlebell-swing', targetSets: 5, targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 },
      { exerciseId: 'mountain-climber', targetSets: 4, targetRepsMin: 20, targetRepsMax: 30, restSeconds: 45, notes: 'Each leg' },
    ],
    tags: ['hiit', 'intermediate', 'fat-loss', 'conditioning'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  // ============= CORE =============
  {
    id: 'core-six-pack',
    name: 'Six Pack Builder',
    category: 'core',
    description: 'Targeted ab training for definition and strength. Focuses on all areas: upper, lower, obliques, and deep core.',
    difficulty: 'beginner',
    durationWeeks: 8,
    daysPerWeek: 3,
    exercises: [
      { exerciseId: 'crunch', targetSets: 4, targetRepsMin: 15, targetRepsMax: 20, restSeconds: 45 },
      { exerciseId: 'leg-raise', targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60, notes: 'Hanging or lying' },
      { exerciseId: 'russian-twist', targetSets: 3, targetRepsMin: 20, targetRepsMax: 30, restSeconds: 45, notes: 'Total reps (both sides)' },
      { exerciseId: 'plank', targetSets: 3, targetRepsMin: 30, targetRepsMax: 60, restSeconds: 60, notes: 'Hold for time' },
      { exerciseId: 'bicycle-crunch', targetSets: 3, targetRepsMin: 20, targetRepsMax: 30, restSeconds: 45 },
    ],
    tags: ['abs', 'beginner', 'definition'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  {
    id: 'core-functional',
    name: 'Functional Core Strength',
    category: 'core',
    description: 'Build anti-rotation strength and stability for athletics and injury prevention. Dynamic movements and challenging holds.',
    difficulty: 'intermediate',
    durationWeeks: 10,
    daysPerWeek: 4,
    exercises: [
      { exerciseId: 'pallof-press', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60, notes: 'Each side' },
      { exerciseId: 'dead-bug', targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 45, notes: 'Each side' },
      { exerciseId: 'ab-wheel-rollout', targetSets: 4, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 75 },
      { exerciseId: 'side-plank', targetSets: 3, targetRepsMin: 30, targetRepsMax: 45, restSeconds: 60, notes: 'Each side, hold for time' },
      { exerciseId: 'bird-dog', targetSets: 3, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 45, notes: 'Each side' },
    ],
    tags: ['core', 'intermediate', 'functional', 'stability'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  // ============= STRENGTH =============
  {
    id: 'strength-531',
    name: '5/3/1 for Beginners',
    category: 'strength',
    description: 'Jim Wendler\'s proven strength program. Progressive overload on the big 4: squat, bench, deadlift, overhead press.',
    difficulty: 'beginner',
    durationWeeks: 12,
    daysPerWeek: 4,
    exercises: [
      { exerciseId: 'squat', targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180, notes: 'Main lift - work up to heavy sets' },
      { exerciseId: 'bench-press', targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180 },
      { exerciseId: 'deadlift', targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180 },
      { exerciseId: 'overhead-press', targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180 },
      { exerciseId: 'bent-over-row', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90, notes: 'Assistance work' },
    ],
    tags: ['strength', 'beginner', 'powerlifting', 'compound'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },

  {
    id: 'strength-peaking',
    name: 'Peaking Program (Competition)',
    category: 'strength',
    description: 'Advanced 8-week peaking cycle for powerlifting competition. Builds to max singles in final weeks.',
    difficulty: 'advanced',
    durationWeeks: 8,
    daysPerWeek: 4,
    exercises: [
      { exerciseId: 'squat', targetSets: 6, targetRepsMin: 1, targetRepsMax: 3, restSeconds: 240, notes: 'Heavy singles/doubles/triples' },
      { exerciseId: 'bench-press', targetSets: 6, targetRepsMin: 1, targetRepsMax: 3, restSeconds: 240 },
      { exerciseId: 'deadlift', targetSets: 5, targetRepsMin: 1, targetRepsMax: 3, restSeconds: 300 },
      { exerciseId: 'pause-squat', targetSets: 4, targetRepsMin: 3, targetRepsMax: 5, restSeconds: 180, notes: 'Variation work' },
      { exerciseId: 'close-grip-bench', targetSets: 4, targetRepsMin: 3, targetRepsMax: 5, restSeconds: 150 },
    ],
    tags: ['strength', 'advanced', 'powerlifting', 'competition'],
    source: 'curated',
    authorName: 'GymRats Team',
    createdAtMs: Date.now(),
  },
];

/**
 * Get all sample plans
 */
export function getAllSamplePlans(): PremadePlan[] {
  return SAMPLE_PLANS;
}

/**
 * Get plans by category
 */
export function getPlansByCategory(category: string): PremadePlan[] {
  return SAMPLE_PLANS.filter(p => p.category === category);
}

/**
 * Get plan by ID
 */
export function getPlanById(id: string): PremadePlan | undefined {
  return SAMPLE_PLANS.find(p => p.id === id);
}