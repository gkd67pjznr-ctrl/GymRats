// src/lib/sync/registerStores.ts
// Register all Zustand stores with the sync orchestrator

import { syncOrchestrator } from './SyncOrchestrator';
import {
  useWorkoutStore,
  useRoutinesStore,
  useWorkoutPlanStore,
  useFriendsStore,
  useSocialStore,
  useFeedStore,
  useChatStore,
  useGamificationStore,
} from '../stores';

/**
 * Register all stores with sync orchestrator
 * This should be called after sync initialization and before any sync operations
 */
export function registerSyncStores(): void {
  // Workout store
  const workoutStore = useWorkoutStore.getState();
  syncOrchestrator.registerStore({
    name: 'workout',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: workoutStore.pullFromServer,
    push: workoutStore.pushToServer,
  });

  // Routines store
  const routinesStore = useRoutinesStore.getState();
  syncOrchestrator.registerStore({
    name: 'routines',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: routinesStore.pullFromServer,
    push: routinesStore.pushToServer,
  });

  // Workout plan store
  const workoutPlanStore = useWorkoutPlanStore.getState();
  syncOrchestrator.registerStore({
    name: 'workoutPlan',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: workoutPlanStore.pullFromServer,
    push: workoutPlanStore.pushToServer,
  });

  // Friends store
  const friendsStore = useFriendsStore.getState();
  syncOrchestrator.registerStore({
    name: 'friends',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: friendsStore.pullFromServer,
    push: friendsStore.pushToServer,
  });

  // Social store (posts, reactions, comments)
  const socialStore = useSocialStore.getState();
  syncOrchestrator.registerStore({
    name: 'social',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: socialStore.pullFromServer,
    push: socialStore.pushToServer,
  });

  // Feed store
  const feedStore = useFeedStore.getState();
  syncOrchestrator.registerStore({
    name: 'feed',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: feedStore.pullFromServer,
    push: feedStore.pushToServer,
  });

  // Chat store
  const chatStore = useChatStore.getState();
  syncOrchestrator.registerStore({
    name: 'chat',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: chatStore.pullFromServer,
    push: chatStore.pushToServer,
  });

  // Gamification store
  const gamificationStore = useGamificationStore.getState();
  syncOrchestrator.registerStore({
    name: 'gamification',
    enabled: true,
    requireAuth: true,
    syncOnSignIn: true,
    pull: gamificationStore.pullFromServer,
    push: gamificationStore.pushToServer,
  });

  // Note: milestonesStore is not included as it doesn't have pull/push methods yet
  // Note: authStore doesn't need sync registration (handled separately)

  if (__DEV__) {
    console.log('[registerSyncStores] Registered', syncOrchestrator.getStoreCount(), 'stores');
  }
}

/**
 * Unregister all stores (for testing or cleanup)
 */
export function unregisterSyncStores(): void {
  syncOrchestrator.unregisterStore('workout');
  syncOrchestrator.unregisterStore('routines');
  syncOrchestrator.unregisterStore('workoutPlan');
  syncOrchestrator.unregisterStore('friends');
  syncOrchestrator.unregisterStore('social');
  syncOrchestrator.unregisterStore('feed');
  syncOrchestrator.unregisterStore('chat');
  syncOrchestrator.unregisterStore('gamification');
}