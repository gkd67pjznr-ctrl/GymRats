// src/lib/sync/SyncOrchestrator.ts
// Main sync coordinator for all stores

import type { SyncStatus, SyncOperation, SyncStats } from './syncTypes';
import { networkMonitor } from './NetworkMonitor';
import { pendingOperationsQueue } from './PendingOperationsQueue';
import type { Session } from '@supabase/supabase-js';
import type { WorkoutSession } from '../workoutModel';
import type { Routine } from '../routinesModel';
import type { FriendEdge } from '../socialModel';
import type { WorkoutPost } from '../socialModel';

/**
 * Store configuration for sync
 */
interface StoreConfig {
  name: string;
  enabled: boolean;
  requireAuth: boolean;
  syncOnSignIn: boolean;
  pull: () => Promise<void>;
  push: () => Promise<void>;
}

/**
 * SyncOrchestrator - Main coordinator for all sync operations
 *
 * Responsibilities:
 * - Manage sync lifecycle for all stores
 * - Handle auth state changes
 * - Handle network state changes
 * - Coordinate realtime subscriptions
 * - Track sync statistics
 */
class SyncOrchestratorClass {
  private initialized: boolean = false;
  private currentUserId: string | null = null;
  private stores: Map<string, StoreConfig> = new Map();
  private syncStatuses: Map<string, SyncStatus> = new Map();
  private realtimeUnsubscribers: Map<string, () => void> = new Map();
  private stats: SyncStats = {
    lastSyncAt: null,
    lastSyncDuration: null,
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    pendingMutations: 0,
  };

  /**
   * Initialize the sync orchestrator
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Start network monitoring
    await networkMonitor.startMonitoring();

    // Subscribe to network changes
    networkMonitor.subscribe((state) => {
      if (state.isOnline) {
        this.onNetworkOnline().catch(err => {
          console.error('[SyncOrchestrator] Network online sync error:', err);
        });
      }
    });

    // Initialize pending operations queue
    await pendingOperationsQueue.initialize();

    this.initialized = true;

    if (__DEV__) {
      console.log('[SyncOrchestrator] Initialized');
    }
  }

  /**
   * Register a store for sync
   */
  registerStore(config: StoreConfig): void {
    this.stores.set(config.name, config);
    this.syncStatuses.set(config.name, 'idle');
  }

  /**
   * Unregister a store from sync
   */
  unregisterStore(storeName: string): void {
    this.stores.delete(storeName);
    this.syncStatuses.delete(storeName);

    // Cleanup realtime subscription if exists
    const unsubscribe = this.realtimeUnsubscribers.get(storeName);
    if (unsubscribe) {
      unsubscribe();
      this.realtimeUnsubscribers.delete(storeName);
    }
  }

  /**
   * Get number of registered stores
   */
  getStoreCount(): number {
    return this.stores.size;
  }

  /**
   * Handle user sign in
   */
  async onSignIn(userId: string, session?: Session): Promise<void> {
    this.currentUserId = userId;

    // Check if online before syncing
    if (!networkMonitor.isOnline()) {
      if (__DEV__) {
        console.log('[SyncOrchestrator] User signed in but offline, skipping sync');
      }
      return;
    }

    // Sync all stores that sync on sign in
    const syncPromises: Promise<void>[] = [];

    for (const [name, config] of this.stores) {
      if (config.enabled && config.syncOnSignIn) {
        syncPromises.push(this.syncStore(name));
      }
    }

    await Promise.allSettled(syncPromises);
  }

  /**
   * Handle user sign out
   */
  onSignOut(): void {
    this.currentUserId = null;

    // Clear all realtime subscriptions
    for (const unsubscribe of this.realtimeUnsubscribers.values()) {
      unsubscribe();
    }
    this.realtimeUnsubscribers.clear();

    // Clear sync statuses
    for (const name of this.syncStatuses.keys()) {
      this.syncStatuses.set(name, 'idle');
    }

    // Clear pending operations
    pendingOperationsQueue.clear().catch(err => {
      console.error('[SyncOrchestrator] Failed to clear pending ops:', err);
    });

    if (__DEV__) {
      console.log('[SyncOrchestrator] Signed out, cleared sync state');
    }
  }

  /**
   * Handle network coming online
   */
  async onNetworkOnline(): Promise<void> {
    if (!this.currentUserId) {
      return;
    }

    if (__DEV__) {
      console.log('[SyncOrchestrator] Network online, processing pending operations');
    }

    // Process all pending operations
    await pendingOperationsQueue.processAll(async (mutation) => {
      await this.processPendingMutation(mutation);
    });

    // Sync all stores
    await this.syncAll();
  }

  /**
   * Sync all stores
   */
  async syncAll(): Promise<void> {
    if (!this.currentUserId) {
      console.warn('[SyncOrchestrator] Cannot sync: no user signed in');
      return;
    }

    if (!networkMonitor.isOnline()) {
      console.warn('[SyncOrchestrator] Cannot sync: offline');
      return;
    }

    const startTime = Date.now();

    // Sync all registered stores
    const syncPromises: Promise<void>[] = [];

    for (const name of this.stores.keys()) {
      syncPromises.push(this.syncStore(name));
    }

    const results = await Promise.allSettled(syncPromises);

    // Update stats
    const duration = Date.now() - startTime;
    this.stats.lastSyncAt = Date.now();
    this.stats.lastSyncDuration = duration;
    this.stats.totalSyncs++;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    this.stats.successfulSyncs += successful;
    this.stats.failedSyncs += failed;

    // Update pending mutations count
    this.stats.pendingMutations = await pendingOperationsQueue.getCount();

    if (__DEV__) {
      console.log(`[SyncOrchestrator] Sync complete: ${successful} succeeded, ${failed} failed in ${duration}ms`);
    }
  }

  /**
   * Sync a specific store
   */
  async syncStore(storeName: string): Promise<void> {
    const config = this.stores.get(storeName);

    if (!config) {
      console.warn(`[SyncOrchestrator] Store not registered: ${storeName}`);
      return;
    }

    if (!config.enabled) {
      return;
    }

    if (config.requireAuth && !this.currentUserId) {
      console.warn(`[SyncOrchestrator] Store ${storeName} requires auth but no user signed in`);
      return;
    }

    if (!networkMonitor.isOnline()) {
      console.warn(`[SyncOrchestrator] Cannot sync ${storeName}: offline`);
      return;
    }

    this.syncStatuses.set(storeName, 'syncing');

    try {
      // Pull from server first
      await config.pull();

      // Then push local changes
      await config.push();

      this.syncStatuses.set(storeName, 'success');
    } catch (error) {
      console.error(`[SyncOrchestrator] Sync failed for ${storeName}:`, error);
      this.syncStatuses.set(storeName, 'error');
      throw error;
    }
  }

  /**
   * Process a pending mutation
   */
  async processPendingMutation(mutation: import('./syncTypes').PendingMutation): Promise<void> {
    const config = this.stores.get(mutation.storeName);

    if (!config) {
      console.warn(`[SyncOrchestrator] Store not registered for mutation: ${mutation.storeName}`);
      return;
    }

    // Push the mutation to server
    await config.push();
  }

  /**
   * Get sync status for all stores
   */
  getSyncStatuses(): Record<string, SyncStatus> {
    return Object.fromEntries(this.syncStatuses);
  }

  /**
   * Get sync status for a specific store
   */
  getStoreSyncStatus(storeName: string): SyncStatus {
    return this.syncStatuses.get(storeName) ?? 'idle';
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    return { ...this.stats };
  }

  /**
   * Check if any store is currently syncing
   */
  isSyncing(): boolean {
    for (const status of this.syncStatuses.values()) {
      if (status === 'syncing') {
        return true;
      }
    }
    return false;
  }

  /**
   * Trigger manual sync for all stores
   */
  async triggerSync(): Promise<void> {
    if (this.isSyncing()) {
      console.warn('[SyncOrchestrator] Already syncing, ignoring request');
      return;
    }

    return this.syncAll();
  }

  /**
   * Trigger manual sync for a specific store
   */
  async triggerStoreSync(storeName: string): Promise<void> {
    return this.syncStore(storeName);
  }
}

// Singleton instance
export const syncOrchestrator = new SyncOrchestratorClass();

/**
 * Initialize sync system - call once on app start
 */
export async function initializeSync(): Promise<void> {
  await syncOrchestrator.initialize();
}

/**
 * Hook to get sync status for all stores
 */
export function useSyncStatus(): Record<string, SyncStatus> {
  // For now, return current state
  // In a real implementation, this would use React state
  return syncOrchestrator.getSyncStatuses();
}

/**
 * Hook to check if any store is syncing
 */
export function useIsSyncing(): boolean {
  return syncOrchestrator.isSyncing();
}

/**
 * Hook to get sync statistics
 */
export function useSyncStats(): SyncStats {
  return syncOrchestrator.getStats();
}
