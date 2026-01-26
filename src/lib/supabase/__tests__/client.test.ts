// src/lib/supabase/__tests__/client.test.ts
// Characterization tests for Supabase client initialization and health check

import Constants from 'expo-constants';
import { supabase, healthCheck, HealthCheckResult } from '../client';

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test-project.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    },
  },
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const { createClient } = require('@supabase/supabase-js');

describe('Supabase Client', () => {
  describe('environment variable access via Constants.expoConfig.extra', () => {
    it('should characterize: environment variables are loaded from Constants.expoConfig.extra', () => {
      // This test characterizes the current behavior of loading env vars
      // The actual implementation uses Constants.expoConfig?.extra?.supabaseUrl
      const mockConstants = Constants as any;
      expect(mockConstants.expoConfig).toBeDefined();
      expect(mockConstants.expoConfig.extra).toBeDefined();
      expect(mockConstants.expoConfig.extra.supabaseUrl).toBeDefined();
      expect(mockConstants.expoConfig.extra.supabaseAnonKey).toBeDefined();
    });

    it('should characterize: retrieve Supabase URL from extra config', () => {
      const mockConstants = Constants as any;
      const supabaseUrl = mockConstants.expoConfig?.extra?.supabaseUrl;
      expect(supabaseUrl).toBe('https://test-project.supabase.co');
    });

    it('should characterize: retrieve Supabase anon key from extra config', () => {
      const mockConstants = Constants as any;
      const supabaseAnonKey = mockConstants.expoConfig?.extra?.supabaseAnonKey;
      expect(supabaseAnonKey).toBe('test-anon-key');
    });
  });

  describe('client initialization with valid credentials', () => {
    it('should characterize: createClient is called with URL and anon key', () => {
      expect(createClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        'test-anon-key'
      );
    });

    it('should characterize: supabase export is a valid client instance', () => {
      expect(supabase).toBeDefined();
      expect(typeof supabase).toBe('object');
    });

    it('should characterize: supabase client has expected methods', () => {
      expect(typeof supabase.from).toBe('function');
      expect(typeof supabase.rpc).toBe('function');
    });
  });

  describe('error handling with missing credentials', () => {
    beforeEach(() => {
      // Reset modules to test different configurations
      jest.resetModules();
    });

    it('should characterize: throw error when supabaseUrl is missing', () => {
      // Mock Constants with missing URL
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            supabaseAnonKey: 'test-anon-key',
          },
        },
      }));

      expect(() => {
        require('../client');
      }).toThrow('Missing Supabase URL');
    });

    it('should characterize: throw error when supabaseAnonKey is missing', () => {
      // Mock Constants with missing anon key
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            supabaseUrl: 'https://test-project.supabase.co',
          },
        },
      }));

      expect(() => {
        require('../client');
      }).toThrow('Missing Supabase anonymous key');
    });

    it('should characterize: throw error when both credentials are missing', () => {
      // Mock Constants with missing both
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {},
        },
      }));

      expect(() => {
        require('../client');
      }).toThrow('Missing Supabase URL');
    });

    it('should characterize: throw error when URL format is invalid', () => {
      // Mock Constants with invalid URL
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            supabaseUrl: 'not-a-valid-url',
            supabaseAnonKey: 'test-anon-key',
          },
        },
      }));

      expect(() => {
        require('../client');
      }).toThrow('Invalid Supabase URL format');
    });
  });

  describe('health check function behavior', () => {
    it('should characterize: healthCheck returns correct structure on success', async () => {
      // Mock successful RPC call
      const mockRpc = jest.fn().mockResolvedValue({
        error: { message: 'table "nonexistent_table_for_health_check" does not exist' },
      });
      supabase.rpc = mockRpc;

      const result = await healthCheck();

      expect(result).toMatchObject({
        status: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(Date),
      } as HealthCheckResult);
    });

    it('should characterize: healthCheck returns connected status on successful connection', async () => {
      const mockRpc = jest.fn().mockResolvedValue({
        error: { message: 'table does not exist' },
      });
      supabase.rpc = mockRpc;

      const result = await healthCheck();

      expect(result.status).toBe('connected');
      expect(result.message).toBe('Successfully connected to Supabase');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should characterize: healthCheck returns error status on connection failure', async () => {
      const mockRpc = jest.fn().mockRejectedValue(new Error('Network error'));
      supabase.rpc = mockRpc;

      const result = await healthCheck();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Connection failed');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should characterize: healthCheck handles authentication errors', async () => {
      const mockRpc = jest.fn().mockResolvedValue({
        error: { message: 'Invalid API key' },
      });
      supabase.rpc = mockRpc;

      const result = await healthCheck();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Connection failed');
    });

    it('should characterize: healthCheck calls Supabase RPC function', async () => {
      const mockRpc = jest.fn().mockResolvedValue({
        error: { message: 'table does not exist' },
      });
      supabase.rpc = mockRpc;

      await healthCheck();

      expect(mockRpc).toHaveBeenCalledWith('get_table_columns', {
        table_name: 'nonexistent_table_for_health_check',
      });
    });
  });

  describe('integration: Constants.expoConfig.extra pattern', () => {
    it('should characterize: Expo environment variable access pattern works correctly', () => {
      // This test documents the Expo pattern for accessing environment variables
      const mockConstants = Constants as any;

      // Pattern: Constants.expoConfig?.extra?.variableName
      const url = mockConstants.expoConfig?.extra?.supabaseUrl;
      const key = mockConstants.expoConfig?.extra?.supabaseAnonKey;

      expect(url).toBeDefined();
      expect(key).toBeDefined();
      expect(typeof url).toBe('string');
      expect(typeof key).toBe('string');
    });
  });
});
