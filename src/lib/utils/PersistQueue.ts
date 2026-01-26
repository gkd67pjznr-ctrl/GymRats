// src/lib/utils/PersistQueue.ts
// Queue for sequential AsyncStorage writes to prevent race conditions

/**
 * PersistQueue ensures AsyncStorage writes happen sequentially.
 * This prevents race conditions when state updates occur rapidly.
 *
 * Pattern: Chain each write after the previous one completes.
 * Based on the implementation from the old currentSessionStore.
 */
export class PersistQueue {
  private queue: Promise<void> = Promise.resolve();

  /**
   * Enqueue an async operation to run sequentially.
   * Returns a promise that resolves when the operation completes.
   */
  enqueue<T>(operation: () => Promise<T>): Promise<T> {
    // Chain this operation after the previous one completes.
    // Store the promise so we can await it and return its result.
    let resultPromise: Promise<T>;
    this.queue = this.queue.then(
      async () => {
        // Execute the operation once and store the result
        resultPromise = operation();
        return await resultPromise;
      },
      // If previous operation failed, still continue with next operation
      () => {
        // Silently ignore previous failures to prevent queue stall
        resultPromise = operation();
        return resultPromise.catch(() => {
          // Swallow the error since we're in the recovery branch
        });
      }
    );

    // Return the result of the operation
    return this.queue.then(() => resultPromise);
  }

  /**
   * Wait for all queued operations to complete.
   * Useful for testing or cleanup.
   */
  async flush(): Promise<void> {
    await this.queue;
  }

  /**
   * Clear the queue (for testing purposes).
   */
  reset(): void {
    this.queue = Promise.resolve();
  }
}

// Singleton instance for use across the app
let globalQueue: PersistQueue | null = null;

/**
 * Get or create the global PersistQueue instance.
 * Using a singleton ensures all AsyncStorage writes are serialized globally.
 */
export function getGlobalPersistQueue(): PersistQueue {
  if (!globalQueue) {
    globalQueue = new PersistQueue();
  }
  return globalQueue;
}

/**
 * Reset the global queue (for testing purposes).
 */
export function resetGlobalPersistQueue(): void {
  globalQueue = null;
}
