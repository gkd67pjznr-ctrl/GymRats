// src/lib/utils/__tests__/PersistQueue.test.ts
// Unit tests for PersistQueue - verifies sequential execution of async operations

import { PersistQueue, getGlobalPersistQueue, resetGlobalPersistQueue } from '../PersistQueue';

describe('PersistQueue', () => {
  let queue: PersistQueue;
  let executionOrder: number[];

  beforeEach(() => {
    queue = new PersistQueue();
    executionOrder = [];
    resetGlobalPersistQueue();
  });

  describe('enqueue', () => {
    it('should execute operations sequentially', async () => {
      const operation1 = jest.fn(async () => {
        executionOrder.push(1);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'result1';
      });

      const operation2 = jest.fn(async () => {
        executionOrder.push(2);
        await new Promise((resolve) => setTimeout(resolve, 5));
        return 'result2';
      });

      const operation3 = jest.fn(async () => {
        executionOrder.push(3);
        return 'result3';
      });

      // Enqueue all operations concurrently
      const promise1 = queue.enqueue(operation1);
      const promise2 = queue.enqueue(operation2);
      const promise3 = queue.enqueue(operation3);

      // Wait for all to complete
      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

      // Verify all operations completed
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(result3).toBe('result3');

      // Verify operations were called
      expect(operation1).toHaveBeenCalledTimes(1);
      expect(operation2).toHaveBeenCalledTimes(1);
      expect(operation3).toHaveBeenCalledTimes(1);

      // Verify sequential execution order (even though operation2 was shorter)
      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should handle errors without stalling the queue', async () => {
      const failingOperation = jest.fn(async () => {
        executionOrder.push(1);
        throw new Error('Operation failed');
      });

      const successOperation = jest.fn(async () => {
        executionOrder.push(2);
        return 'success';
      });

      // First operation fails
      const failingPromise = queue.enqueue(failingOperation).catch(() => 'caught');
      // Second operation should still run
      const successPromise = queue.enqueue(successOperation);

      const [caughtResult, successResult] = await Promise.all([failingPromise, successPromise]);

      expect(caughtResult).toBe('caught');
      expect(successResult).toBe('success');
      expect(executionOrder).toEqual([1, 2]);
    });

    it('should handle rapid concurrent enqueues', async () => {
      const results: string[] = [];

      // Enqueue 10 operations rapidly
      const promises = Array.from({ length: 10 }, (_, i) =>
        queue.enqueue(async () => {
          const value = `operation-${i}`;
          results.push(value);
          // Simulate async work
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
          return value;
        })
      );

      await Promise.all(promises);

      // Verify all operations completed in order
      expect(results).toEqual([
        'operation-0',
        'operation-1',
        'operation-2',
        'operation-3',
        'operation-4',
        'operation-5',
        'operation-6',
        'operation-7',
        'operation-8',
        'operation-9',
      ]);
    });
  });

  describe('flush', () => {
    it('should wait for all queued operations to complete', async () => {
      let operation1Completed = false;
      let operation2Completed = false;

      queue.enqueue(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        operation1Completed = true;
      });

      queue.enqueue(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        operation2Completed = true;
      });

      // Operations should not be complete yet
      expect(operation1Completed).toBe(false);
      expect(operation2Completed).toBe(false);

      // Flush should wait for all to complete
      await queue.flush();

      expect(operation1Completed).toBe(true);
      expect(operation2Completed).toBe(true);
    });

    it('should resolve immediately when queue is empty', async () => {
      const start = Date.now();
      await queue.flush();
      const end = Date.now();

      // Should complete very quickly (< 10ms)
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('reset', () => {
    it('should clear the queue state', async () => {
      let operationCompleted = false;

      queue.enqueue(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        operationCompleted = true;
      });

      // Reset before operation completes
      queue.reset();

      // Flush should resolve immediately after reset
      await queue.flush();

      // Operation may or may not have completed (timing dependent)
      // But reset should allow the queue to continue accepting new operations
      const newResult = await queue.enqueue(async () => 'new');
      expect(newResult).toBe('new');
    });
  });

  describe('global queue singleton', () => {
    it('should return the same instance across calls', () => {
      const instance1 = getGlobalPersistQueue();
      const instance2 = getGlobalPersistQueue();

      expect(instance1).toBe(instance2);
    });

    it('should reset to a new instance when resetGlobalPersistQueue is called', () => {
      const instance1 = getGlobalPersistQueue();
      resetGlobalPersistQueue();
      const instance2 = getGlobalPersistQueue();

      expect(instance1).not.toBe(instance2);
    });
  });
});
