// src/lib/stores/topBarStore.ts
// Zustand store for global top bar state management (dropdown, notifications)

import { create } from 'zustand';
import type { AppNotification } from '../socialModel';
import { notificationRepository } from '../sync/repositories/notificationRepository';
import { getUser } from './authStore';

/**
 * Top bar store state interface
 */
interface TopBarState {
  // Dropdown state
  dropdownOpen: boolean;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  isLoadingNotifications: boolean;
  notificationsError: string | null;

  // Realtime subscription cleanup
  _unsubscribe: (() => void) | null;

  // Actions
  toggleDropdown: () => void;
  openDropdown: () => void;
  closeDropdown: () => void;
  setNotifications: (notifications: AppNotification[]) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribe: () => void;
}

/**
 * Top bar store
 *
 * Manages the global top bar state including notification dropdown
 * visibility and notifications cache.
 */
export const useTopBarStore = create<TopBarState>((set, get) => ({
  // Initial state
  dropdownOpen: false,
  notifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,
  notificationsError: null,
  _unsubscribe: null,

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown: () => {
    const { dropdownOpen, notifications } = get();
    const newState = !dropdownOpen;

    // Fetch notifications if opening and we have none
    if (newState && notifications.length === 0) {
      get().fetchNotifications();
    }

    set({ dropdownOpen: newState });
  },

  /**
   * Open dropdown
   */
  openDropdown: () => {
    const { notifications } = get();

    // Fetch notifications if we have none
    if (notifications.length === 0) {
      get().fetchNotifications();
    }

    set({ dropdownOpen: true });
  },

  /**
   * Close dropdown
   */
  closeDropdown: () => {
    set({ dropdownOpen: false });
  },

  /**
   * Set notifications list
   */
  setNotifications: (notifications) => {
    set({ notifications });
  },

  /**
   * Set unread count
   */
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id) => {
    const user = getUser();
    if (!user) return;

    try {
      await notificationRepository.markAsRead(id, user.id);

      // Update local state
      const { notifications, unreadCount } = get();
      const notification = notifications.find(n => n.id === id);

      if (notification && !notification.readAtMs) {
        set({
          notifications: notifications.map(n =>
            n.id === id ? { ...n, readAtMs: Date.now() } : n
          ),
          unreadCount: Math.max(0, unreadCount - 1),
        });
      }
    } catch (error) {
      console.error('[topBarStore] markAsRead error:', error);
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const user = getUser();
    if (!user) return;

    try {
      await notificationRepository.markAllAsRead(user.id);

      // Update local state
      const { notifications } = get();
      set({
        notifications: notifications.map(n => ({
          ...n,
          readAtMs: n.readAtMs ?? Date.now(),
        })),
        unreadCount: 0,
      });
    } catch (error) {
      console.error('[topBarStore] markAllAsRead error:', error);
    }
  },

  /**
   * Fetch notifications from server
   */
  fetchNotifications: async () => {
    const user = getUser();
    if (!user) return;

    set({ isLoadingNotifications: true, notificationsError: null });

    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationRepository.fetchUserNotifications(user.id, 50),
        notificationRepository.fetchUnreadCount(user.id),
      ]);

      set({
        notifications,
        unreadCount,
        isLoadingNotifications: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[topBarStore] fetchNotifications error:', errorMessage);
      set({
        isLoadingNotifications: false,
        notificationsError: errorMessage,
      });
    }
  },

  /**
   * Subscribe to realtime notification updates
   */
  subscribeToNotifications: () => {
    const user = getUser();
    if (!user) return;

    // Clean up existing subscription
    const { _unsubscribe } = get();
    if (_unsubscribe) {
      _unsubscribe();
    }

    // Set up new subscription
    const unsubscribe = notificationRepository.subscribeToUser(
      user.id,
      (notification) => {
        // Add new notification to the top of the list
        const { notifications, unreadCount } = get();
        set({
          notifications: [notification, ...notifications],
          unreadCount: unreadCount + 1,
        });
      }
    );

    set({ _unsubscribe: unsubscribe });
  },

  /**
   * Unsubscribe from realtime updates
   */
  unsubscribe: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) {
      _unsubscribe();
      set({ _unsubscribe: null });
    }
  },
}));

// ============================================================================
// Convenience selectors
// ============================================================================

export const selectDropdownOpen = (state: TopBarState) => state.dropdownOpen;
export const selectNotifications = (state: TopBarState) => state.notifications;
export const selectUnreadCount = (state: TopBarState) => state.unreadCount;
export const selectIsLoadingNotifications = (state: TopBarState) => state.isLoadingNotifications;

// ============================================================================
// Hooks for common access patterns
// ============================================================================

/**
 * Hook to get dropdown open state
 */
export function useDropdownOpen(): boolean {
  return useTopBarStore(selectDropdownOpen);
}

/**
 * Hook to get notifications list
 */
export function useNotifications(): AppNotification[] {
  return useTopBarStore(selectNotifications);
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount(): number {
  return useTopBarStore(selectUnreadCount);
}

/**
 * Hook to get loading state
 */
export function useIsLoadingNotifications(): boolean {
  return useTopBarStore(selectIsLoadingNotifications);
}

// ============================================================================
// Imperative API for non-React code
// ============================================================================

export const topBarActions = {
  toggleDropdown: () => useTopBarStore.getState().toggleDropdown(),
  openDropdown: () => useTopBarStore.getState().openDropdown(),
  closeDropdown: () => useTopBarStore.getState().closeDropdown(),
  fetchNotifications: () => useTopBarStore.getState().fetchNotifications(),
  markAsRead: (id: string) => useTopBarStore.getState().markAsRead(id),
  markAllAsRead: () => useTopBarStore.getState().markAllAsRead(),
  subscribeToNotifications: () => useTopBarStore.getState().subscribeToNotifications(),
  unsubscribe: () => useTopBarStore.getState().unsubscribe(),
  getUnreadCount: () => useTopBarStore.getState().unreadCount,
  isDropdownOpen: () => useTopBarStore.getState().dropdownOpen,
};
