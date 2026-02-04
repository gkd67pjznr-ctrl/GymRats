import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationPayload, NotificationPreferences, NotificationType, NOTIFICATION_CHANNELS, REST_TIMER_NOTIFICATION_ID } from './types';
import { getSettings } from '../stores/settingsStore';
import { supabase } from '../supabase/client';

/**
 * Notification Service - Core notification functionality
 * Handles both local and push notifications
 */

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Initialize notification service
 * Should be called early in app lifecycle
 */
export const initializeNotificationService = async (): Promise<void> => {
  try {
    // Register for push notifications
    await registerForPushNotificationsAsync();

    // Set up notification channels (Android only)
    if (Platform.OS === 'android') {
      await setupNotificationChannels();
    }

    if (__DEV__) {
      console.log('Notification service initialized');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to initialize notification service:', error);
    }
  }
};

/**
 * Set up notification channels for Android
 */
const setupNotificationChannels = async (): Promise<void> => {
  try {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SOCIAL.id, {
      name: NOTIFICATION_CHANNELS.SOCIAL.name,
      description: NOTIFICATION_CHANNELS.SOCIAL.description,
      importance: NOTIFICATION_CHANNELS.SOCIAL.importance,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.WORKOUT.id, {
      name: NOTIFICATION_CHANNELS.WORKOUT.name,
      description: NOTIFICATION_CHANNELS.WORKOUT.description,
      importance: NOTIFICATION_CHANNELS.WORKOUT.importance,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.COMPETITION.id, {
      name: NOTIFICATION_CHANNELS.COMPETITION.name,
      description: NOTIFICATION_CHANNELS.COMPETITION.description,
      importance: NOTIFICATION_CHANNELS.COMPETITION.importance,
      sound: 'default',
    });
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to set up notification channels:', error);
    }
  }
};

/**
 * Request notification permissions
 * Returns true if permissions were granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to request notification permissions:', error);
    }
    return false;
  }
};

/**
 * Register for push notifications
 */
const registerForPushNotificationsAsync = async (): Promise<void> => {
  try {
    // Check if permissions are already granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus !== 'granted') {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        if (__DEV__) {
          console.log('Notification permissions not granted');
        }
        return;
      }
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    if (__DEV__) {
      console.log('Expo push token:', token.data);
    }

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to register for push notifications:', error);
    }
  }
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (
  payload: NotificationPayload,
  triggerSeconds: number
): Promise<string | null> => {
  try {
    // Check if notifications are enabled for this type
    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!shouldShowNotification(payload.type, prefs)) {
      if (__DEV__) {
        console.log(`Notification of type ${payload.type} is disabled by user preferences`);
      }
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        repeats: false,
      },
    });

    if (__DEV__) {
      console.log(`Scheduled notification ${notificationId} for ${triggerSeconds} seconds`);
    }
    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to schedule local notification:', error);
    }
    return null;
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelScheduledNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    if (__DEV__) {
      console.log(`Cancelled scheduled notification ${notificationId}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to cancel scheduled notification:', error);
    }
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (__DEV__) {
      console.log('Cancelled all scheduled notifications');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to cancel all scheduled notifications:', error);
    }
  }
};

/**
 * Show an immediate notification
 */
export const showImmediateNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    // Check if notifications are enabled for this type
    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!shouldShowNotification(payload.type, prefs)) {
      if (__DEV__) {
        console.log(`Notification of type ${payload.type} is disabled by user preferences`);
      }
      return;
    }

    await Notifications.presentNotificationAsync({
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    });
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to show immediate notification:', error);
    }
  }
};

/**
 * Check if notification should be shown based on user preferences
 */
const shouldShowNotification = (type: NotificationType, prefs: NotificationPreferences): boolean => {
  switch (type) {
    case 'friend_request':
      return prefs.friendRequests;
    case 'dm_received':
      return prefs.directMessages;
    case 'competition_result':
      return prefs.competitionResults;
    case 'rest_timer':
      return prefs.restTimer;
    case 'reaction':
      return prefs.reactions;
    case 'comment':
      return prefs.comments;
    default:
      return true;
  }
};

/**
 * Set up notification response listener
 */
export const setupNotificationResponseListener = (handler: (response: Notifications.NotificationResponse) => void): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};

/**
 * Set up notification received listener (foreground)
 */
export const setupNotificationReceivedListener = (handler: (notification: Notifications.Notification) => void): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(handler);
};

/**
 * Schedule rest timer notification
 * This is the P0 launch feature - background rest timer notifications
 */
export const scheduleRestTimerNotification = async (seconds: number): Promise<string | null> => {
  try {
    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!prefs.restTimer) {
      if (__DEV__) {
        console.log('Rest timer notifications are disabled by user preferences');
      }
      return null;
    }

    // Cancel any existing rest timer notification
    await cancelAllScheduledNotifications();

    const notificationId = await scheduleLocalNotification({
      type: 'rest_timer',
      title: 'Time to lift!',
      body: 'Your rest period is complete. Get back to your workout!',
      data: {
        type: 'rest_timer',
        screen: 'live-workout',
      },
    }, seconds);

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to schedule rest timer notification:', error);
    }
    return null;
  }
};

/**
 * Cancel rest timer notification
 */
export const cancelRestTimerNotification = async (): Promise<void> => {
  try {
    await cancelAllScheduledNotifications();
    if (__DEV__) {
      console.log('Cancelled rest timer notification');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to cancel rest timer notification:', error);
    }
  }
};

/**
 * Send friend request notification
 * Called when a user receives a friend request
 */
export const sendFriendRequestNotification = async (
  senderId: string,
  senderName: string,
  receiverId: string
): Promise<void> => {
  try {
    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!prefs.friendRequests) {
      if (__DEV__) {
        console.log('Friend request notifications disabled for user', receiverId);
      }
      return;
    }

    const payload: NotificationPayload = {
      type: 'friend_request',
      title: 'New Friend Request',
      body: `${senderName} wants to be your friend!`,
      data: {
        type: 'friend_request',
        screen: 'friends',
        senderId,
        senderName,
      },
    };

    // Send via backend
    await sendPushNotification(receiverId, payload);

    // Also create in-app notification
    await createInAppNotification(receiverId, payload);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to send friend request notification:', error);
    }
  }
};

/**
 * Send direct message notification
 * Called when a user receives a new DM
 */
export const sendDirectMessageNotification = async (
  senderId: string,
  senderName: string,
  receiverId: string,
  threadId: string,
  messageText: string
): Promise<void> => {
  try {
    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!prefs.directMessages) {
      if (__DEV__) {
        console.log('Direct message notifications disabled for user', receiverId);
      }
      return;
    }

    const payload: NotificationPayload = {
      type: 'dm_received',
      title: `New Message from ${senderName}`,
      body: messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText,
      data: {
        type: 'dm_received',
        screen: 'dm',
        threadId,
        senderId,
        senderName,
      },
    };

    // Send via backend
    await sendPushNotification(receiverId, payload);

    // Also create in-app notification
    await createInAppNotification(receiverId, payload);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to send direct message notification:', error);
    }
  }
};

/**
 * Send reaction notification
 * Called when a user reacts to another user's post
 * Note: With DB triggers enabled, this is called automatically.
 * This function is available for manual/client-side use if needed.
 */
export const sendReactionNotification = async (
  reactorId: string,
  reactorName: string,
  postAuthorId: string,
  postId: string,
  emote: string
): Promise<void> => {
  try {
    // Don't notify if reacting to own post
    if (reactorId === postAuthorId) {
      return;
    }

    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!prefs.reactions) {
      if (__DEV__) {
        console.log('Reaction notifications disabled for user', postAuthorId);
      }
      return;
    }

    // Map emote to friendly label
    const emoteLabel: Record<string, string> = {
      like: 'liked',
      fire: 'loved',
      skull: 'found hilarious',
      crown: 'crowned',
      bolt: 'was energized by',
      clap: 'applauded',
    };
    const label = emoteLabel[emote] || 'reacted to';

    const payload: NotificationPayload = {
      type: 'reaction',
      title: 'New Reaction',
      body: `${reactorName} ${label} your post`,
      data: {
        type: 'reaction',
        screen: 'post',
        postId,
        reactorId,
        reactorName,
        emote,
      },
    };

    // Send via backend
    await sendPushNotification(postAuthorId, payload);

    // Also create in-app notification
    await createInAppNotification(postAuthorId, payload);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to send reaction notification:', error);
    }
  }
};

/**
 * Send comment notification
 * Called when a user comments on another user's post
 * Note: With DB triggers enabled, this is called automatically.
 * This function is available for manual/client-side use if needed.
 */
export const sendCommentNotification = async (
  commenterId: string,
  commenterName: string,
  postAuthorId: string,
  postId: string,
  commentId: string,
  commentText: string
): Promise<void> => {
  try {
    // Don't notify if commenting on own post
    if (commenterId === postAuthorId) {
      return;
    }

    const settings = getSettings();
    const prefs = settings.notificationPrefs;

    if (!prefs.comments) {
      if (__DEV__) {
        console.log('Comment notifications disabled for user', postAuthorId);
      }
      return;
    }

    // Truncate comment preview
    const commentPreview = commentText.length > 50
      ? `${commentText.substring(0, 50)}...`
      : commentText;

    const payload: NotificationPayload = {
      type: 'comment',
      title: 'New Comment',
      body: `${commenterName} commented: ${commentPreview}`,
      data: {
        type: 'comment',
        screen: 'post',
        postId,
        commentId,
        commenterId,
        commenterName,
      },
    };

    // Send via backend
    await sendPushNotification(postAuthorId, payload);

    // Also create in-app notification
    await createInAppNotification(postAuthorId, payload);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to send comment notification:', error);
    }
  }
};

/**
 * Create in-app notification in database
 * Stores notification for in-app display and history
 */
const createInAppNotification = async (
  userId: string,
  payload: NotificationPayload
): Promise<void> => {
  try {
    console.log(`Creating in-app notification for user ${userId}:`, payload);

    // Insert notification into database
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to create in-app notification:', error);
      throw error;
    }

    console.log('In-app notification created successfully');
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to create in-app notification:', error);
    }
  }
};

/**
 * Register or update push token for current user
 * Should be called when user logs in or notification permissions change
 */
export const registerPushToken = async (): Promise<void> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      if (__DEV__) {
        console.log('Notification permissions not granted');
      }
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Expo push token:', token.data);

    // Get Supabase URL from client (remove trailing slash if present)
    const supabaseUrl = supabase.supabaseUrl.replace(/\/$/, '');
    const functionUrl = `${supabaseUrl}/functions/v1/register-push-token`;

    // Get auth token from current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No authenticated session found');
      return;
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        token: token.data,
        deviceInfo: {
          platform: Platform.OS,
          osVersion: Platform.Version,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to register push token: ${response.status}`, errorText);
      throw new Error(`Push token registration failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Push token registered successfully:', result);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to register push token:', error);
    }
  }
};

/**
 * Send push notification via backend
 * Calls Supabase Edge Function to send push notification to user
 */
export const sendPushNotification = async (
  userId: string,
  payload: NotificationPayload
): Promise<void> => {
  try {
    console.log(`Sending push notification to user ${userId}:`, payload);

    // Get Supabase URL from client (remove trailing slash if present)
    const supabaseUrl = supabase.supabaseUrl.replace(/\/$/, '');
    const functionUrl = `${supabaseUrl}/functions/v1/send-push-notification`;

    // Get auth token from current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No authenticated session found');
      return;
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId,
        payload
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send push notification: ${response.status}`, errorText);
      throw new Error(`Push notification failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Push notification sent successfully:', result);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to send push notification:', error);
    }
  }
};