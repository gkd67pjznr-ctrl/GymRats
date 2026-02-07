// src/lib/sharing/rankCardGenerator.ts
// Generate shareable rank cards using react-native-view-shot

import { Share, Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { getSettings } from '../stores/settingsStore';
import type { ExerciseRankSummary } from '../types/rankTypes';
import type { RankTier } from '../userStats/types';
import { RANK_TIER_DISPLAY } from '../userStats/types';

// Tier display names for sharing (imported from types)
const TIER_NAMES = RANK_TIER_DISPLAY;

// Tier emojis for text sharing
const TIER_EMOJIS: Record<RankTier, string> = {
  copper: '🥉',
  bronze: '🥉',
  iron: '⚙️',
  silver: '🥈',
  gold: '🥇',
  master: '👑',
  legendary: '🏆',
  mythic: '✨',
  supreme_being: '🌟',
  goat: '🐐',
};

/**
 * Format weight for sharing
 */
function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${Math.round(kg * 2.20462)} lb`;
  }
  return `${Math.round(kg)} kg`;
}

/**
 * Generate shareable text for a rank
 * Used as fallback when image sharing isn't available
 */
export function generateShareText(summary: ExerciseRankSummary): string {
  const settings = getSettings();
  const tierName = TIER_NAMES[summary.currentTier];
  const tierEmoji = TIER_EMOJIS[summary.currentTier];

  const lines = [
    `${tierEmoji} ${summary.exerciseName} - Rank ${summary.currentRank} (${tierName})`,
    ``,
    `Best: ${formatWeight(summary.bestWeightKg, settings.unitSystem)} x ${summary.bestReps}`,
    `e1RM: ${formatWeight(summary.bestE1rm, settings.unitSystem)}`,
    ``,
    `#GymRats #FitnessGoals`,
  ];

  return lines.join('\n');
}

/**
 * Share rank as text (works without additional dependencies)
 */
export async function shareRankAsText(summary: ExerciseRankSummary): Promise<void> {
  const settings = getSettings();

  // Check if sharing is allowed
  if (!settings.rankSettings.allowRankSharing) {
    Alert.alert(
      'Sharing Disabled',
      'Enable rank sharing in Settings to share your achievements.'
    );
    return;
  }

  const shareText = generateShareText(summary);

  try {
    const result = await Share.share({
      message: shareText,
      title: `My ${summary.exerciseName} Rank`,
    });

    if (result.action === Share.sharedAction) {
      console.log('[rankCardGenerator] Rank shared successfully');
    }
  } catch (error) {
    console.error('[rankCardGenerator] Share failed:', error);
    Alert.alert('Share Failed', 'Unable to share your rank. Please try again.');
  }
}

/**
 * Capture a view as an image and return the URI
 */
export async function captureViewAsImage(
  viewRef: RefObject<View>
): Promise<string | null> {
  if (!viewRef.current) {
    console.warn('[rankCardGenerator] No view ref provided');
    return null;
  }

  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    return uri;
  } catch (error) {
    console.error('[rankCardGenerator] Failed to capture view:', error);
    return null;
  }
}

/**
 * Share rank card as image
 * Requires a ref to the rendered card view
 */
export async function shareRankAsImage(
  summary: ExerciseRankSummary,
  viewRef: RefObject<View>
): Promise<boolean> {
  const settings = getSettings();

  if (!settings.rankSettings.allowRankSharing) {
    Alert.alert(
      'Sharing Disabled',
      'Enable rank sharing in Settings to share your achievements.'
    );
    return false;
  }

  // Capture the view as an image
  const imageUri = await captureViewAsImage(viewRef);

  if (!imageUri) {
    // Fall back to text sharing
    console.warn('[rankCardGenerator] Image capture failed, falling back to text');
    await shareRankAsText(summary);
    return false;
  }

  const shareText = generateShareText(summary);

  try {
    // Share with image
    if (Platform.OS === 'ios') {
      await Share.share({
        url: imageUri,
        message: shareText,
        title: `My ${summary.exerciseName} Rank`,
      });
    } else {
      // Android needs file:// prefix
      const androidUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
      await Share.share({
        message: `${shareText}\n\n${androidUri}`,
        title: `My ${summary.exerciseName} Rank`,
      });
    }

    console.log('[rankCardGenerator] Rank image shared successfully');
    return true;
  } catch (error) {
    console.error('[rankCardGenerator] Image share failed:', error);
    // Fall back to text sharing
    await shareRankAsText(summary);
    return false;
  }
}

/**
 * Quick share function - uses text sharing
 * For image sharing, use shareRankAsImage with a view ref
 */
export async function shareRank(summary: ExerciseRankSummary): Promise<void> {
  await shareRankAsText(summary);
}

/**
 * Generate OG-style card data for potential web sharing
 */
export function generateCardData(summary: ExerciseRankSummary) {
  const settings = getSettings();

  return {
    exerciseId: summary.exerciseId,
    exerciseName: summary.exerciseName,
    userName: settings.displayName,
    userRank: summary.currentRank,
    userTier: summary.currentTier,
    tierName: TIER_NAMES[summary.currentTier],
    bestE1rm: summary.bestE1rm,
    bestWeight: summary.bestWeightKg,
    bestReps: summary.bestReps,
    unitSystem: settings.unitSystem,
    generatedAt: Date.now(),
  };
}

// Export tier helpers for use in share card components
export { TIER_NAMES, TIER_EMOJIS, formatWeight };
