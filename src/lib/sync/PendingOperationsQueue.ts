// src/lib/sync/PendingOperationsQueue.ts
// Queue for offline mutations pending sync to server

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PendingMutation } from './syncTypes';
import { networkMonitor } from './NetworkMonitor';

const STORAGE_KEY = 'sync.pending.v1';

const MAX_RETRY_COUNT = 5;
const STALE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * PendingOperationsQueue - Manages offline mutations waiting to sync
 *
 * Mutations are queued when:
 * - Device is offline
 * - Sync fails and needs retry
 *
 * Queue is processed when:
 * - Device comes online
 * - Manual sync is triggered
 * - App foregrounds
 */
class PendingOperationsQueueClass {
  private queue: PendingMutation[] = [];
  private isProcessing: boolean = false;
  private hydrated: boolean = false;

  /**
   * Initialize the queue from AsyncStorage
   */
  async initialize(): Promise<void> {
    if (this.hydrated) return;

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as PendingMutation[];
        // Filter out stale mutations
        this.queue = parsed.filter(m => Date.now() - m.timestamp < STALE_AGE_MS);
        await this.persist();
      }
      this.hydrated = true;
    } catch (error) {
      if (__DEV__) {
        console.error('[PendingOperationsQueue] Failed to initialize:', error);
      }
      this.queue = [];
      this.hydrated = true;
    }
  }

  /**
   * Enqueue a mutation for sync
   */
  async enqueue<T>(mutation: Omit<PendingMutation<T>, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    await this.ensureHydrated();

    const newMutation: PendingMutation<T> = {
      ...mutation,
      id: `${mutation.storeName}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(newMutation);
    await this.persist();

    // Auto-process if online
    if (networkMonitor.isOnline() && !this.isProcessing) {
      this.processNext().catch(err => {
        if (__DEV__) {
          console.error('[PendingOperationsQueue] Auto-process error:', err);
        }
      });
    }
  }

  /**
   * Process the next mutation in the queue
   * Returns true if queue is empty after processing
   */
  async processNext(handler?: (mutation: PendingMutation) => Promise<void>): Promise<boolean> {
    await this.ensureHydrated();

    if (this.queue.length === 0) {
      return true;
    }

    if (this.isProcessing) {
      return false;
    }

    // Check if online
    if (!networkMonitor.isOnline()) {
      return false;
    }

    this.isProcessing = true;

    try {
      const mutation = this.queue[0];

      try {
        // Call the handler if provided
        if (handler) {
          await handler(mutation);
        }

        // Remove successfully processed mutation
        this.queue.shift();
        await this.persist();

        // Process next if available
        if (this.queue.length > 0) {
          await this.processNext(handler);
        }

        return this.queue.length === 0;
      } catch (error) {
        // Handler failed - increment retry count
        mutation.retryCount++;

        if (mutation.retryCount >= MAX_RETRY_COUNT) {
          // Max retries reached - remove from queue
          if (__DEV__) {
            console.error('[PendingOperationsQueue] Max retries reached, dropping:', mutation);
          }
          this.queue.shift();
        } else {
          // Move to end of queue to try other mutations first
          this.queue.shift();
          this.queue.push(mutation);
        }

        await this.persist();
        return false;
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process all pending mutations
   */
  async processAll(handler: (mutation: PendingMutation) => Promise<void>): Promise<void> {
    await this.ensureHydrated();

    if (this.queue.length === 0) {
      return;
    }

    while (this.queue.length > 0 && networkMonitor.isOnline()) {
      const isEmpty = await this.processNext(handler);
      if (isEmpty || this.queue[0].retryCount > 0) {
        // Stop if queue is empty or hit a retry
        break;
      }
    }
  }

  /**
   * Retry failed mutations (those with retryCount > 0)
   */
  async retryFailed(handler: (mutation: PendingMutation) => Promise<void>): Promise<void> {
    await this.ensureHydrated();

    // Move failed mutations to front of queue
    const failed = this.queue.filter(m => m.retryCount > 0);
    const pending = this.queue.filter(m => m.retryCount === 0);

    // Reset retry counts
    failed.forEach(m => {
      m.retryCount = 0;
      m.timestamp = Date.now();
    });

    this.queue = [...failed, ...pending];
    await this.persist();

    await this.processAll(handler);
  }

  /**
   * Remove mutations for a specific store
   */
  async clearStore(storeName: string): Promise<void> {
    await this.ensureHydrated();
    this.queue = this.queue.filter(m => m.storeName !== storeName);
    await this.persist();
  }

  /**
   * Clear all pending mutations
   */
  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get count of pending mutations
   */
  async getCount(): Promise<number> {
    await this.ensureHydrated();
    return this.queue.length;
  }

  /**
   * Get count of pending mutations for a store
   */
  async getStoreCount(storeName: string): Promise<number> {
    await this.ensureHydrated();
    return this.queue.filter(m => m.storeName === storeName).length;
  }

  /**
   * Get all pending mutations (read-only)
   */
  async getAll(): Promise<PendingMutation[]> {
    await this.ensureHydrated();
    return [...this.queue];
  }

  /**
   * Get pending mutations for a store
   */
  async getForStore(storeName: string): Promise<PendingMutation[]> {
    await this.ensureHydrated();
    return this.queue.filter(m => m.storeName === storeName);
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      if (__DEV__) {
        console.error('[PendingOperationsQueue] Failed to persist:', error);
      }
    }
  }

  private async ensureHydrated(): Promise<void> {
    if (!this.hydrated) {
      await this.initialize();
    }
  }
}

// Singleton instance
export const pendingOperationsQueue = new PendingOperationsQueueClass();

/**
 * Hook to get pending mutation counts
 */
export async function getPendingCounts(): Promise<Record<string, number>> {
  const all = await pendingOperationsQueue.getAll();
  const counts: Record<string, number> = {};

  for (const mutation of all) {
    counts[mutation.storeName] = (counts[mutation.storeName] ?? 0) + 1;
  }

  return counts;
}
