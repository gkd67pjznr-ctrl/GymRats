// src/lib/stores/storage/createQueuedAsyncStorage.ts
// Custom Zustand storage adapter that uses PersistQueue for sequential AsyncStorage writes

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import { getGlobalPersistQueue } from '../../utils/PersistQueue';

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean | undefined;

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
        if (__DEV__) console.error('[createQueuedAsyncStorage] Failed to get item:', {
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
          const valueStr = String(value ?? '');
          const errorDetails = {
            key: name,
            valueLength: valueStr.length,
            valuePreview: valueStr.substring(0, 100),
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          };
          if (__DEV__) console.error('[createQueuedAsyncStorage] Failed to set item:', errorDetails);
          // Don't re-throw to prevent unhandled promise rejections
          // The error is logged, and we return normally to allow the queue to continue
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
          if (__DEV__) console.error('[createQueuedAsyncStorage] Failed to remove item:', {
            key: name,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          });
          // Don't re-throw to prevent unhandled promise rejections
        }
      });
    },
  };
}

/**
 * Create a JSON storage adapter with queued AsyncStorage writes.
 * This is the drop-in replacement for zustand/middleware's createJSONStorage.
 *
 * Wraps the queued AsyncStorage with JSON serialization/deserialization.
 */
export function createQueuedJSONStorage() {
  return createJSONStorage(() => createQueuedAsyncStorage());
}
