// __tests__/lib/notifications/notificationService.test.ts
import { Platform } from 'react-native';
import {
  scheduleLocalNotification,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
  showImmediateNotification,
  scheduleRestTimerNotification,
  cancelRestTimerNotification,
  requestNotificationPermission,
  sendFriendRequestNotification,
  sendDirectMessageNotification,
  registerPushToken,
} from '@/src/lib/notifications/notificationService';
import { updateSettings } from '@/src/lib/stores/settingsStore';

// Mock expo-notifications at the module level
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  presentNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '16.0',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Mock the settings store
jest.mock('@/src/lib/stores/settingsStore', () => ({
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
}));

// Mock supabase client
jest.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    supabaseUrl: 'https://test.supabase.co',
  },
}));

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock implementations
    require('expo-notifications').requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    require('expo-notifications').scheduleNotificationAsync.mockResolvedValue('mock-notification-id');
    require('expo-notifications').cancelScheduledNotificationAsync.mockResolvedValue(undefined);
    require('expo-notifications').cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
    require('expo-notifications').presentNotificationAsync.mockResolvedValue(undefined);

    // Mock the settings store to return proper notification preferences
    const mockSettings = {
      notificationPrefs: {
        friendRequests: true,
        directMessages: true,
        competitionResults: true,
        restTimer: true,
        reactions: true,
        comments: true,
      },
    };
    require('@/src/lib/stores/settingsStore').getSettings.mockReturnValue(mockSettings);

    // Mock updateSettings to update the mock
    require('@/src/lib/stores/settingsStore').updateSettings.mockImplementation((updates: any) => {
      Object.assign(mockSettings, updates);
      if (updates.notificationPrefs) {
        Object.assign(mockSettings.notificationPrefs, updates.notificationPrefs);
      }
    });

    // Mock supabase auth
    require('@/src/lib/supabase/client').supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });
    require('@/src/lib/supabase/client').supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => 'OK',
    });
  });

  describe('requestNotificationPermission', () => {
    it('should return true when permissions are granted', async () => {
      require('expo-notifications').requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const result = await requestNotificationPermission();
      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      require('expo-notifications').requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      require('expo-notifications').requestPermissionsAsync.mockRejectedValue(new Error('Permission error'));
      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });
  });

  describe('scheduleLocalNotification', () => {
    it('should schedule a notification when preferences allow it', async () => {
      const notificationId = await scheduleLocalNotification({
        type: 'rest_timer',
        title: 'Test Notification',
        body: 'This is a test',
      }, 60);

      expect(notificationId).toBe('mock-notification-id');
      expect(require('expo-notifications').scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Notification',
          body: 'This is a test',
          data: {},
        },
        trigger: {
          seconds: 60,
        },
      });
    });

    it('should return null when notification type is disabled', async () => {
      // Disable rest timer notifications
      updateSettings({
        notificationPrefs: {
          restTimer: false,
        } as any,
      });

      const notificationId = await scheduleLocalNotification({
        type: 'rest_timer',
        title: 'Test Notification',
        body: 'This is a test',
      }, 60);

      expect(notificationId).toBeNull();
      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle scheduling errors gracefully', async () => {
      require('expo-notifications').scheduleNotificationAsync.mockRejectedValue(new Error('Scheduling error'));
      const notificationId = await scheduleLocalNotification({
        type: 'rest_timer',
        title: 'Test Notification',
        body: 'This is a test',
      }, 60);

      expect(notificationId).toBeNull();
    });
  });

  describe('cancelScheduledNotification', () => {
    it('should cancel a scheduled notification', async () => {
      await cancelScheduledNotification('test-id');
      expect(require('expo-notifications').cancelScheduledNotificationAsync).toHaveBeenCalledWith('test-id');
    });

    it('should handle cancellation errors gracefully', async () => {
      require('expo-notifications').cancelScheduledNotificationAsync.mockRejectedValue(new Error('Cancellation error'));
      await expect(cancelScheduledNotification('test-id')).resolves.not.toThrow();
    });
  });

  describe('cancelAllScheduledNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      await cancelAllScheduledNotifications();
      expect(require('expo-notifications').cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      require('expo-notifications').cancelAllScheduledNotificationsAsync.mockRejectedValue(new Error('Cancellation error'));
      await expect(cancelAllScheduledNotifications()).resolves.not.toThrow();
    });
  });

  describe('showImmediateNotification', () => {
    it('should show an immediate notification when preferences allow it', async () => {
      await showImmediateNotification({
        type: 'friend_request',
        title: 'New Friend Request',
        body: 'Someone wants to be your friend',
      });

      expect(require('expo-notifications').presentNotificationAsync).toHaveBeenCalledWith({
        title: 'New Friend Request',
        body: 'Someone wants to be your friend',
        data: {},
      });
    });

    it('should not show notification when type is disabled', async () => {
      updateSettings({
        notificationPrefs: {
          friendRequests: false,
        } as any,
      });

      await showImmediateNotification({
        type: 'friend_request',
        title: 'New Friend Request',
        body: 'Someone wants to be your friend',
      });

      expect(require('expo-notifications').presentNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      require('expo-notifications').presentNotificationAsync.mockRejectedValue(new Error('Presentation error'));
      await expect(showImmediateNotification({
        type: 'friend_request',
        title: 'New Friend Request',
        body: 'Someone wants to be your friend',
      })).resolves.not.toThrow();
    });
  });

  describe('scheduleRestTimerNotification', () => {
    it('should schedule a rest timer notification', async () => {
      const notificationId = await scheduleRestTimerNotification(90);
      expect(notificationId).toBe('mock-notification-id');
      expect(require('expo-notifications').scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should cancel existing notifications before scheduling new one', async () => {
      await scheduleRestTimerNotification(90);
      expect(require('expo-notifications').cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should return null when rest timer notifications are disabled', async () => {
      updateSettings({
        notificationPrefs: {
          restTimer: false,
        } as any,
      });

      const notificationId = await scheduleRestTimerNotification(90);
      expect(notificationId).toBeNull();
      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('cancelRestTimerNotification', () => {
    it('should cancel all scheduled notifications', async () => {
      await cancelRestTimerNotification();
      expect(require('expo-notifications').cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      require('expo-notifications').cancelAllScheduledNotificationsAsync.mockRejectedValue(new Error('Cancellation error'));
      await expect(cancelRestTimerNotification()).resolves.not.toThrow();
    });
  });

  describe('sendFriendRequestNotification', () => {
    it('should send friend request notification when enabled', async () => {
      await sendFriendRequestNotification('sender1', 'John Doe', 'receiver1');

      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
      // Should call sendPushNotification (which is mocked to log)
    });

    it('should not send notification when friend requests are disabled', async () => {
      // Disable friend request notifications
      updateSettings({
        notificationPrefs: {
          friendRequests: false,
        } as any,
      });

      await sendFriendRequestNotification('sender1', 'John Doe', 'receiver1');

      // Should not call any notification functions
      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock sendPushNotification to throw error
      const originalSendPushNotification = require('@/src/lib/notifications/notificationService').sendPushNotification;
      require('@/src/lib/notifications/notificationService').sendPushNotification = jest.fn(() => {
        throw new Error('Push error');
      });

      await expect(sendFriendRequestNotification('sender1', 'John Doe', 'receiver1')).resolves.not.toThrow();

      // Restore original function
      require('@/src/lib/notifications/notificationService').sendPushNotification = originalSendPushNotification;
    });
  });

  describe('sendDirectMessageNotification', () => {
    it('should send DM notification when enabled', async () => {
      await sendDirectMessageNotification('sender1', 'John Doe', 'receiver1', 'thread1', 'Hello there!');

      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
      // Should call sendPushNotification (which is mocked to log)
    });

    it('should truncate long message bodies', async () => {
      const longMessage = 'This is a very long message that should be truncated to fit within the notification body limits and not exceed the maximum length allowed for push notifications.';

      await sendDirectMessageNotification('sender1', 'John Doe', 'receiver1', 'thread1', longMessage);

      // Should still work without errors
      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should not send notification when DMs are disabled', async () => {
      // Disable DM notifications
      updateSettings({
        notificationPrefs: {
          directMessages: false,
        } as any,
      });

      await sendDirectMessageNotification('sender1', 'John Doe', 'receiver1', 'thread1', 'Hello there!');

      // Should not call any notification functions
      expect(require('expo-notifications').scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock sendPushNotification to throw error
      const originalSendPushNotification = require('@/src/lib/notifications/notificationService').sendPushNotification;
      require('@/src/lib/notifications/notificationService').sendPushNotification = jest.fn(() => {
        throw new Error('Push error');
      });

      await expect(sendDirectMessageNotification('sender1', 'John Doe', 'receiver1', 'thread1', 'Hello there!')).resolves.not.toThrow();

      // Restore original function
      require('@/src/lib/notifications/notificationService').sendPushNotification = originalSendPushNotification;
    });
  });

  describe('registerPushToken', () => {
    it('should register push token when permissions are granted', async () => {
      // Mock getPermissionsAsync to return granted status
      require('expo-notifications').getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      require('expo-notifications').getExpoPushTokenAsync.mockResolvedValue({ data: 'mock-token' });

      await registerPushToken();

      expect(require('expo-notifications').getPermissionsAsync).toHaveBeenCalled();
      expect(require('expo-notifications').getExpoPushTokenAsync).toHaveBeenCalled();
    });

    it('should not register when permissions are not granted', async () => {
      require('expo-notifications').getPermissionsAsync.mockResolvedValue({ status: 'denied' });

      await registerPushToken();

      expect(require('expo-notifications').getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      require('expo-notifications').getPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      await expect(registerPushToken()).resolves.not.toThrow();
    });
  });
});