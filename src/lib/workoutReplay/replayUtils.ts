// src/lib/workoutReplay/replayUtils.ts
// Utility functions for workout replay

import type { WorkoutReplay } from './replayTypes';

// Format large numbers for display
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format weight for display
export function formatWeight(weightKg: number, unit: 'lb' | 'kg' = 'lb'): string {
  if (unit === 'lb') {
    const weightLb = weightKg * 2.20462;
    return `${Math.round(weightLb)} lb`;
  }
  return `${Math.round(weightKg)} kg`;
}

// Get tier color for UI
export function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'iron': return '#808080';
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'platinum': return '#E5E4E2';
    case 'diamond': return '#B9F2FF';
    case 'mythic': return '#9370DB';
    default: return '#808080';
  }
}

// Check if workout has significant activity for replay
export function isWorkoutSignificant(replay: WorkoutReplay): boolean {
  return replay.setCount > 0;
}

// Get replay highlight message
export function getReplayHighlight(replay: WorkoutReplay): string {
  if (replay.prsAchieved.length > 0) {
    return `🎉 ${replay.prsAchieved.length} PR${replay.prsAchieved.length > 1 ? 's' : ''} Achieved!`;
  }
  if (replay.rankChanges.length > 0) {
    return `⭐ ${replay.rankChanges.length} Rank Change${replay.rankChanges.length > 1 ? 's' : ''}!`;
  }
  if (replay.setCount > 10) {
    return `💪 ${replay.setCount} Sets Completed!`;
  }
  return 'Great workout!';
}