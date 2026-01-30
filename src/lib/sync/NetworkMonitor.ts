// src/lib/sync/NetworkMonitor.ts
// Network connectivity monitoring for sync system

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Network state information
 */
export type NetworkState = {
  isOnline: boolean;
  isConnected: boolean;
  type: string | null;
  isConnectionExpensive: boolean;
};

/**
 * Listener callback type
 */
type NetworkListener = (state: NetworkState) => void;

/**
 * NetworkMonitor - Singleton class for monitoring network connectivity
 * Uses NetInfo from @react-native-community/netinfo
 */
class NetworkMonitorClass {
  private currentState: NetworkState;
  private listeners: Set<NetworkListener> = new Set();
  private isMonitoring: boolean = false;

  constructor() {
    this.currentState = this.getDefaultState();
  }

  private getDefaultState(): NetworkState {
    return {
      isOnline: true,
      isConnected: true,
      type: null,
      isConnectionExpensive: false,
    };
  }

  /**
   * Start monitoring network state
   * Should be called once on app initialization
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Get initial state
    const netInfoState = await NetInfo.fetch();
    this.currentState = this.mapNetInfoState(netInfoState);

    // Subscribe to network changes
    NetInfo.addEventListener((state) => {
      const newState = this.mapNetInfoState(state);

      // Only notify if state actually changed
      if (newState.isOnline !== this.currentState.isOnline) {
        this.currentState = newState;
        this.notifyListeners();
      }
    });
  }

  /**
   * Stop monitoring network state
   * Call this on app cleanup
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.listeners.clear();
  }

  /**
   * Get current network state synchronously
   */
  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentState.isOnline;
  }

  /**
   * Subscribe to network state changes
   * Returns unsubscribe function
   */
  subscribe(callback: NetworkListener): () => void {
    this.listeners.add(callback);

    // Immediately call with current state
    callback(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Manually refresh network state
   */
  async refresh(): Promise<NetworkState> {
    const netInfoState = await NetInfo.fetch();
    this.currentState = this.mapNetInfoState(netInfoState);
    return this.getCurrentState();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (error) {
        if (__DEV__) {
          console.error('[NetworkMonitor] Listener error:', error);
        }
      }
    });
  }

  private mapNetInfoState(state: ReturnType<typeof NetInfo.fetch extends Promise<infer T> ? T : never>): NetworkState {
    return {
      isOnline: state.isConnected ?? false,
      isConnected: state.isConnected ?? false,
      type: state.type ?? null,
      isConnectionExpensive: state.isConnectionExpensive ?? false,
    };
  }
}

// Singleton instance
export const networkMonitor = new NetworkMonitorClass();

/**
 * React hook for network state
 * Automatically subscribes to network changes
 */
export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(networkMonitor.getCurrentState());

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}

/**
 * React hook for online status
 * Returns true if device is online
 */
export function useIsOnline(): boolean {
  const state = useNetworkState();
  return state.isOnline;
}
