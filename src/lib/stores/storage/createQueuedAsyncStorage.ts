// src/lib/stores/storage/createQueuedAsyncStorage.ts
// Custom Zustand storage adapter that uses PersistQueue for sequential AsyncStorage writes

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';
import { getGlobalPersistQueue } from '../../utils/PersistQueue';

/**
 * Create a Zustand storage adapter that queues AsyncStorage writes.
 * This prevents race conditions when state updates occur rapidly.
 *
 * @returns A StateStorage compatible with Zustand's persist middleware
 */
export function createQueuedAsyncStorage(): StateStorage {
  const queue = getGlobalPersistQueue();

  return {
    /**
     * Get an item from AsyncStorage.
     * Reads are not queued (only writes need serialization).
     */
    getItem: async (name: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(name);
      } catch (error) {
        // Enhanced error boundary with detailed logging
        console.error('[createQueuedAsyncStorage] Failed to get item:', {
          key: name,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        return null;
      }
    },

    /**
     * Set an item in AsyncStorage.
     * Writes are queued to prevent race conditions.
     */
    setItem: async (name: string, value: string): Promise<void> => {
      return queue.enqueue(async () => {
        try {
          await AsyncStorage.setItem(name, value);
        } catch (error) {
          // Enhanced error boundary with detailed logging for debugging
          const errorDetails = {
            key: name,
            valueLength: value?.length ?? 0,
            valuePreview: value?.substring(0, 100) ?? '',
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          };
          console.error('[createQueuedAsyncStorage] Failed to set item:', errorDetails);
          throw error; // Re-throw to allow caller to handle
        }
      });
    },

    /**
     * Remove an item from AsyncStorage.
     * Removals are also queued to maintain ordering with writes.
     */
    removeItem: async (name: string): Promise<void> => {
      return queue.enqueue(async () => {
        try {
          await AsyncStorage.removeItem(name);
        } catch (error) {
          // Enhanced error boundary with detailed logging
          console.error('[createQueuedAsyncStorage] Failed to remove item:', {
            key: name,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      });
    },
  };
}

/**
 * Create a JSON storage adapter with queued AsyncStorage writes.
 * This is the drop-in replacement for zustand/middleware's createJSONStorage.
 *
 * Usage:
 * ```ts
 * import { persist, createJSONStorage } from 'zustand/middleware';
 * import { createQueuedAsyncStorage } from './storage/createQueuedAsyncStorage';
 *
 * persist(
 *   (set, get) => ({ ... }),
 *   {
 *     name: 'my-storage',
 *     storage: createJSONStorage(() => createQueuedAsyncStorage()),
 *   }
 * )
 * ```
 */
export function createQueuedJSONStorage() {
  return createQueuedAsyncStorage();
}
