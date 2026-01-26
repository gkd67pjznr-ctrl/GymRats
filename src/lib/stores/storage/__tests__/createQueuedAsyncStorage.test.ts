// src/lib/stores/storage/__tests__/createQueuedAsyncStorage.test.ts
// Unit tests for queued AsyncStorage storage adapter

import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetGlobalPersistQueue } from '../../../utils/PersistQueue';
import { createQueuedAsyncStorage } from '../createQueuedAsyncStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('createQueuedAsyncStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
  });

  describe('getItem', () => {
    it('should retrieve item from AsyncStorage', async () => {
      const testData = { key: 'value' };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData));

      const storage = createQueuedAsyncStorage();
      const result = await storage.getItem('test-key');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe(JSON.stringify(testData));
    });

    it('should return null on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const storage = createQueuedAsyncStorage();
      const result = await storage.getItem('test-key');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should queue write operations and execute sequentially', async () => {
      const executionOrder: number[] = [];

      mockAsyncStorage.setItem.mockImplementation(async (key: string) => {
        const index = parseInt(key.split('-')[1]);
        executionOrder.push(index);
        // Simulate async delay
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
      });

      const storage = createQueuedAsyncStorage();

      // Enqueue multiple writes concurrently
      const promises = [
        storage.setItem('key-1', 'value1'),
        storage.setItem('key-2', 'value2'),
        storage.setItem('key-3', 'value3'),
      ];

      await Promise.all(promises);

      // Verify sequential execution
      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should store value in AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      const storage = createQueuedAsyncStorage();
      await storage.setItem('test-key', 'test-value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should propagate errors to caller', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Write failed'));

      const storage = createQueuedAsyncStorage();

      await expect(storage.setItem('test-key', 'test-value')).rejects.toThrow('Write failed');
    });

    it('should handle rapid sequential writes without race conditions', async () => {
      let writeCount = 0;

      mockAsyncStorage.setItem.mockImplementation(async () => {
        writeCount++;
        // Simulate variable async delay
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
      });

      const storage = createQueuedAsyncStorage();

      // Rapidly fire 10 writes
      const promises = Array.from({ length: 10 }, (_, i) =>
        storage.setItem(`key-${i}`, `value-${i}`)
      );

      await Promise.all(promises);

      // All writes should complete
      expect(writeCount).toBe(10);
    });
  });

  describe('removeItem', () => {
    it('should queue removal operations', async () => {
      mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

      const storage = createQueuedAsyncStorage();
      await storage.removeItem('test-key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should execute removals sequentially with writes', async () => {
      const executionOrder: string[] = [];

      mockAsyncStorage.setItem.mockImplementation(async (key: string) => {
        executionOrder.push(`set-${key}`);
        await new Promise((resolve) => setTimeout(resolve, 5));
      });

      mockAsyncStorage.removeItem.mockImplementation(async (key: string) => {
        executionOrder.push(`remove-${key}`);
        await new Promise((resolve) => setTimeout(resolve, 5));
      });

      const storage = createQueuedAsyncStorage();

      await Promise.all([
        storage.setItem('key-1', 'value1'),
        storage.removeItem('key-2'),
        storage.setItem('key-3', 'value3'),
      ]);

      // Verify sequential execution
      expect(executionOrder).toEqual(['set-key-1', 'remove-key-2', 'set-key-3']);
    });

    it('should propagate errors to caller', async () => {
      mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error('Remove failed'));

      const storage = createQueuedAsyncStorage();

      await expect(storage.removeItem('test-key')).rejects.toThrow('Remove failed');
    });
  });

  describe('integration: Zustand persist compatibility', () => {
    it('should be compatible with Zustand StateStorage interface', async () => {
      const storage = createQueuedAsyncStorage();

      // Should have required methods
      expect(typeof storage.getItem).toBe('function');
      expect(typeof storage.setItem).toBe('function');
      expect(typeof storage.removeItem).toBe('function');

      // Should return promises
      const getItemResult = storage.getItem('key');
      const setItemResult = storage.setItem('key', 'value');
      const removeItemResult = storage.removeItem('key');

      expect(getItemResult).toBeInstanceOf(Promise);
      expect(setItemResult).toBeInstanceOf(Promise);
      expect(removeItemResult).toBeInstanceOf(Promise);

      // Clean up promises
      await Promise.all([getItemResult, setItemResult.catch(() => {}), removeItemResult.catch(() => {})]);
    });
  });
});
