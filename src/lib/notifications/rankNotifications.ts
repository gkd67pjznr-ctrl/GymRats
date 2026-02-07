// src/lib/notifications/rankNotifications.ts
// Service for rank-up notifications

import * as Notifications from 'expo-notifications';
import { getSettings } from '../stores/settingsStore';
import type { RankTier } from '../userStats/types';
import { RANK_TIER_DISPLAY } from '../userStats/types';

// Tier display names (imported from types)
const TIER_NAMES = RANK_TIER_DISPLAY;

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * Call this during onboarding or when enabling notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Send a local notification for a rank-up event
 */
export async function sendRankUpNotification(params: {
  exerciseName: string;
  oldRank: number;
  newRank: number;
  newTier: RankTier;
}): Promise<void> {
  const settings = getSettings();

  // Check if rank-up notifications are enabled
  if (!settings.rankSettings.enableRankUpNotifications) {
    return;
  }

  const { exerciseName, oldRank, newRank, newTier } = params;
  const tierName = TIER_NAMES[newTier];

  // Check permissions
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  // Schedule immediate notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Rank Up! ${exerciseName}`,
      body: `You've reached Rank ${newRank} (${tierName}) on ${exerciseName}!`,
      data: {
        type: 'rank_up',
        exerciseName,
        oldRank,
        newRank,
        newTier,
      },
      sound: 'default',
    },
    trigger: null, // Immediate
  });
}

/**
 * Send a notification when reaching a new tier
 * (more celebratory than regular rank-up)
 */
export async function sendTierUpNotification(params: {
  exerciseName: string;
  newTier: RankTier;
  newRank: number;
}): Promise<void> {
  const settings = getSettings();

  if (!settings.rankSettings.enableRankUpNotifications) {
    return;
  }

  const { exerciseName, newTier, newRank } = params;
  const tierName = TIER_NAMES[newTier];

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  // Tier-specific messages
  const tierMessages: Record<RankTier, string> = {
    copper: "Keep pushing! You're just getting started.",
    bronze: "You're building a solid foundation!",
    iron: "Forging strength! Great progress!",
    silver: "Impressive progress! Keep it up!",
    gold: "You're among the dedicated lifters!",
    master: "Elite status achieved! You're a Master!",
    legendary: "Incredible! Legendary strength unlocked!",
    mythic: "MYTHIC! You've transcended normal limits!",
    supreme_being: "SUPREME! You're among the gods!",
    goat: "G.O.A.T! THE GREATEST OF ALL TIME!",
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${tierName} Tier Unlocked!`,
      body: `${exerciseName}: Rank ${newRank}. ${tierMessages[newTier]}`,
      data: {
        type: 'tier_up',
        exerciseName,
        newTier,
        newRank,
      },
      sound: 'default',
    },
    trigger: null,
  });
}

/**
 * Check if a rank change crosses a tier boundary
 */
export function checkTierChange(oldRank: number, newRank: number): {
  tierChanged: boolean;
  newTier: RankTier;
} {
  const getTier = (rank: number): RankTier => {
    if (rank <= 3) return 'copper';
    if (rank <= 6) return 'bronze';
    if (rank <= 9) return 'iron';
    if (rank <= 12) return 'silver';
    if (rank <= 15) return 'gold';
    if (rank <= 18) return 'master';
    if (rank <= 21) return 'legendary';
    if (rank <= 24) return 'mythic';
    if (rank <= 27) return 'supreme_being';
    return 'goat';
  };

  const oldTier = getTier(oldRank);
  const newTier = getTier(newRank);

  return {
    tierChanged: oldTier !== newTier && newRank > oldRank,
    newTier,
  };
}

/**
 * Handle a rank-up event - sends appropriate notification
 */
export async function handleRankUp(params: {
  exerciseName: string;
  oldRank: number;
  newRank: number;
}): Promise<void> {
  const { exerciseName, oldRank, newRank } = params;

  // Check if tier changed
  const { tierChanged, newTier } = checkTierChange(oldRank, newRank);

  if (tierChanged) {
    // Send tier-up notification (more celebratory)
    await sendTierUpNotification({
      exerciseName,
      newTier,
      newRank,
    });
  } else if (newRank > oldRank) {
    // Send regular rank-up notification
    await sendRankUpNotification({
      exerciseName,
      oldRank,
      newRank,
      newTier,
    });
  }
}

/**
 * Add a notification listener
 * Returns a function to remove the listener
 */
export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}

/**
 * Add a response listener for when user taps a notification
 * Returns a function to remove the listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
}
