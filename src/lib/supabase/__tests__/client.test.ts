// src/lib/supabase/__tests__/client.test.ts
// Characterization tests for Supabase client initialization and health check

// Mock expo-constants
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { supabase, healthCheck, HealthCheckResult, isSupabasePlaceholder } from '../client';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test-project.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzk2Mjk4MCwiZXhwIjoxOTM5NTM4OTgwfQ.test-signature-here',
    },
    version: '1.0.0',
  },
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    rpc: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      getSession: jest.fn(),
    },
    storage: {
      bucket: jest.fn(),
    },
  })),
}));

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
      expect(supabaseAnonKey).toContain('eyJ');
    });
  });

  describe('client initialization with valid credentials', () => {
    it('should characterize: createClient is called with URL, anon key, and options', () => {
      expect(createClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        expect.any(String),
        expect.objectContaining({
          auth: expect.any(Object),
          global: expect.any(Object),
        })
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

    it('should characterize: isSupabasePlaceholder is false with valid credentials', () => {
      expect(isSupabasePlaceholder).toBe(false);
    });
  });

  describe('error handling with missing credentials', () => {
    beforeEach(() => {
      // Reset modules to test different configurations
      jest.resetModules();
    });

    it('should characterize: create placeholder client when URL is missing', () => {
      // Mock Constants with missing URL
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
          },
        },
      }));

      // In dev mode, missing credentials create a placeholder
      const client = require('../client');
      expect(client.isSupabasePlaceholder).toBe(true);
    });

    it('should characterize: create placeholder client when anon key is missing', () => {
      // Mock Constants with missing anon key
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            supabaseUrl: 'https://test-project.supabase.co',
          },
        },
      }));

      const client = require('../client');
      expect(client.isSupabasePlaceholder).toBe(true);
    });

    it('should characterize: create placeholder client when both credentials are missing', () => {
      // Mock Constants with missing both
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {},
        },
      }));

      // When both credentials are missing, client.ts creates a placeholder client
      // instead of throwing an error (to allow local development)
      const client = require('../client');
      expect(client.supabase).toBeDefined();
      expect(client.isSupabasePlaceholder).toBe(true);
    });

    it('should characterize: create placeholder when URL format is invalid', () => {
      // Mock Constants with invalid URL
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            supabaseUrl: 'not-a-valid-url',
            supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
          },
        },
      }));

      const client = require('../client');
      expect(client.isSupabasePlaceholder).toBe(true);
    });
  });

  describe('health check function behavior', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should characterize: healthCheck returns correct structure on success', async () => {
      // Mock successful auth.getSession call
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await healthCheck();

      expect(result).toMatchObject({
        status: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(Date),
      } as HealthCheckResult);
    });

    it('should characterize: healthCheck returns connected status on successful connection', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await healthCheck();

      expect(result.status).toBe('connected');
      expect(result.message).toBe('Successfully connected to Supabase');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.latencyMs).toBeDefined();
    });

    it('should characterize: healthCheck returns error status on connection failure', async () => {
      (supabase.auth.getSession as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await healthCheck();

      expect(result.status).toBe('error');
      expect(result.message).toContain('Connection failed');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should characterize: healthCheck still returns connected on auth errors', async () => {
      // Auth errors indicate the connection worked, just no session
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' },
      });

      const result = await healthCheck();

      // Should still be connected - we reached the server
      expect(result.status).toBe('connected');
    });

    it('should characterize: healthCheck calls auth.getSession', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await healthCheck();

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should characterize: healthCheck includes latency measurement', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await healthCheck();

      expect(typeof result.latencyMs).toBe('number');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
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
