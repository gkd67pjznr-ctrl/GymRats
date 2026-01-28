// src/lib/celebration/selector.ts
// Celebration selection logic

import type {
  Celebration,
  CelebrationSelectorParams,
  SelectedCelebration,
  CelebrationVariant,
} from './types';
import { CELEBRATIONS } from './content';

/**
 * Determine tier from delta (lb)
 *
 * Tier 1: 0-5 lb    - Small PR, modest celebration
 * Tier 2: 5-10 lb   - Medium PR, nice celebration
 * Tier 3: 10-20 lb  - Big PR, exciting celebration
 * Tier 4: 20+ lb    - MASSIVE PR, epic celebration
 */
export function deltaToTier(deltaLb: number): 1 | 2 | 3 | 4 {
  if (deltaLb < 5) return 1;
  if (deltaLb < 10) return 2;
  if (deltaLb < 20) return 3;
  return 4;
}

/**
 * Select a random variant for variety
 *
 * Cycles through variants to avoid repetition.
 */
function selectVariant(preferred?: CelebrationVariant): CelebrationVariant {
  const variants: CelebrationVariant[] = ['a', 'b', 'c', 'd', 'e'];
  if (preferred && variants.includes(preferred)) {
    return preferred;
  }
  return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Resolve text template with actual values
 *
 * Replaces placeholders in text templates:
 * {exercise} - Exercise name
 * {weight} - Weight label (e.g., "225 lb")
 * {reps} - Number of reps
 * {delta} - Delta (lb)
 */
function resolveText(
  template: string,
  params: CelebrationSelectorParams
): string {
  return template
    .replace('{exercise}', params.exerciseName)
    .replace('{weight}', params.weightLabel)
    .replace('{reps}', String(params.reps))
    .replace('{delta}', String(params.deltaLb));
}

/**
 * Select celebration for PR
 *
 * Main entry point for celebration selection.
 * Returns a celebration with text resolved for the specific PR.
 */
export function selectCelebration(
  params: CelebrationSelectorParams
): SelectedCelebration | null {
  const { prType, deltaLb, preferredVariant } = params;

  // Map PR type to celebration type
  const celebrationType = prType === 'cardio' ? null : prType;
  if (!celebrationType) return null;

  // Determine tier from delta
  const tier = deltaToTier(deltaLb);

  // Select variant
  const variant = selectVariant(preferredVariant);

  // Find matching celebration
  const celebration = CELEBRATIONS.find(
    (c) =>
      c.prType === celebrationType &&
      c.tier === tier &&
      c.variant === variant
  );

  if (!celebration) {
    // Fallback to tier 1 variant a
    const fallback = CELEBRATIONS.find(
      (c) => c.prType === celebrationType && c.tier === 1 && c.variant === 'a'
    );
    if (!fallback) return null;

    return {
      celebration: fallback,
      headline: resolveText(fallback.text.headline, params),
      subheadline: fallback.text.subheadline
        ? resolveText(fallback.text.subheadline, params)
        : undefined,
      detail: fallback.text.detail
        ? resolveText(fallback.text.detail, params)
        : undefined,
    };
  }

  return {
    celebration,
    headline: resolveText(celebration.text.headline, params),
    subheadline: celebration.text.subheadline
      ? resolveText(celebration.text.subheadline, params)
      : undefined,
    detail: celebration.text.detail
      ? resolveText(celebration.text.detail, params)
      : undefined,
  };
}

/**
 * Get tier label for display
 */
export function getTierLabel(tier: 1 | 2 | 3 | 4): string {
  switch (tier) {
    case 1:
      return 'Solid';
    case 2:
      return 'Big';
    case 3:
      return 'Huge';
    case 4:
      return 'Mythic';
  }
}

/**
 * Get PR type label for display
 */
export function getPRTypeLabel(prType: 'weight' | 'rep' | 'e1rm'): string {
  switch (prType) {
    case 'weight':
      return 'Weight PR';
    case 'rep':
      return 'Rep PR';
    case 'e1rm':
      return 'e1RM PR';
  }
}
