// src/ui/components/SyncStatusIndicator.tsx
// Visual sync status indicator component

import { useState } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useSyncState } from '../../lib/hooks/useSyncStatus';
import { networkMonitor } from '../../lib/sync/NetworkMonitor';
import { FR } from '../forgerankStyle';
import { useThemeColors } from '../theme';

type DisplayMode = 'compact' | 'detailed' | 'minimal';

export interface SyncStatusIndicatorProps {
  /**
   * Display mode:
   * - compact: Shows icon + label (default)
   * - detailed: Shows icon + label + last sync time + pending count
   * - minimal: Shows only icon
   */
  displayMode?: DisplayMode;

  /**
   * Store name to show status for. If not provided, shows overall status.
   */
  storeName?: string;

  /**
   * Position of the label relative to icon
   */
  labelPosition?: 'left' | 'right' | 'bottom';

  /**
   * Callback when tapped (for retry or manual sync)
   */
  onPress?: () => void;
}

/**
 * Get status icon and color based on sync state and network status
 */
function getStatusInfo(
  syncStatus: 'idle' | 'syncing' | 'success' | 'error',
  isOnline: boolean,
  hasPending: boolean
): { icon: string; color: string; label: string } {
  // Offline takes precedence
  if (!isOnline) {
    return {
      icon: '⚠️',
      color: '#f59e0b', // amber
      label: 'Offline',
    };
  }

  // Error state
  if (syncStatus === 'error') {
    return {
      icon: '❌',
      color: '#ef4444', // red
      label: 'Sync error',
    };
  }

  // Syncing state
  if (syncStatus === 'syncing' || hasPending) {
    return {
      icon: '🔄',
      color: '#3b82f6', // blue
      label: 'Syncing...',
    };
  }

  // Success state
  if (syncStatus === 'success') {
    return {
      icon: '✓',
      color: '#10b981', // green
      label: 'Synced',
    };
  }

  // Idle (never synced or stale)
  return {
    icon: '○',
    color: '#6b7280', // gray
    label: 'Ready',
  };
}

/**
 * Format relative time for last sync
 */
function formatLastSync(lastSyncMs: number | null): string {
  if (!lastSyncMs) return 'Never';

  const seconds = Math.floor((Date.now() - lastSyncMs) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * SyncStatusIndicator Component
 *
 * Displays the current sync status with visual feedback.
 *
 * @example
 * ```tsx
 * // Compact mode (default)
 * <SyncStatusIndicator />
 *
 * // Detailed mode with last sync time
 * <SyncStatusIndicator displayMode="detailed" />
 *
 * // Minimal mode (icon only)
 * <SyncStatusIndicator displayMode="minimal" />
 *
 * // For a specific store
 * <SyncStatusIndicator storeName="feed" displayMode="detailed" />
 *
 * // With manual sync on press
 * <SyncStatusIndicator
 *   displayMode="detailed"
 *   onPress={() => syncAll()}
 * />
 * ```
 */
export function SyncStatusIndicator({
  displayMode = 'compact',
  storeName,
  labelPosition = 'right',
  onPress,
}: SyncStatusIndicatorProps) {
  const c = useThemeColors();
  const { isSyncing, stats, statuses, pending, hasErrors, totalPending, syncAll } = useSyncState();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get specific store status or overall status
  const syncStatus = storeName ? statuses[storeName] : (hasErrors ? 'error' : isSyncing ? 'syncing' : stats.lastSyncAt ? 'success' : 'idle');
  const pendingCount = storeName ? pending[storeName] ?? 0 : totalPending;
  const lastSync = stats.lastSyncAt;

  const isOnline = networkMonitor.isOnline();
  const hasPending = pendingCount > 0;

  const statusInfo = getStatusInfo(syncStatus, isOnline, hasPending);
  const showDetailed = displayMode === 'detailed' || (displayMode === 'compact' && isExpanded);

  const content = (
    <View
      style={{
        flexDirection: labelPosition === 'bottom' ? 'column' : 'row',
        alignItems: 'center',
        gap: labelPosition === 'bottom' ? FR.space.x1 : FR.space.x2,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: displayMode === 'minimal' ? 16 : 20,
          height: displayMode === 'minimal' ? 16 : 20,
          borderRadius: displayMode === 'minimal' ? 8 : 10,
          backgroundColor: statusInfo.color + '20', // 20 = 12% opacity
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {syncStatus === 'syncing' && !isOnline === false ? (
          <ActivityIndicator size="small" color={statusInfo.color} />
        ) : (
          <Text
            style={{
              color: statusInfo.color,
              fontSize: displayMode === 'minimal' ? 10 : 12,
              fontWeight: '700',
            }}
          >
            {statusInfo.icon}
          </Text>
        )}
      </View>

      {/* Label and details */}
      {displayMode !== 'minimal' && (
        <View
          style={{
            flexDirection: labelPosition === 'bottom' ? 'column' : 'row',
            alignItems: labelPosition === 'bottom' ? 'flex-start' : 'center',
            gap: FR.space.x1,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {statusInfo.label}
          </Text>

          {/* Detailed info */}
          {showDetailed && (
            <>
              {lastSync && (
                <Text
                  style={{
                    color: c.muted,
                    fontSize: 10,
                    fontWeight: '600',
                  }}
                >
                  • {formatLastSync(lastSync)}
                </Text>
              )}

              {hasPending && (
                <Text
                  style={{
                    color: statusInfo.color,
                    fontSize: 10,
                    fontWeight: '700',
                  }}
                >
                  • {pendingCount} pending
                </Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );

  // If no onPress, return content as-is
  if (!onPress) {
    return content;
  }

  // Otherwise wrap in Pressable
  return (
    <Pressable
      onPress={() => {
        onPress();
        if (displayMode === 'compact') {
          setIsExpanded(!isExpanded);
        }
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        padding: FR.space.x1,
        borderRadius: FR.radius.sm,
        backgroundColor: pressed ? c.card : 'transparent',
      })}
    >
      {content}
    </Pressable>
  );
}

/**
 * Preset variants for common use cases
 */
export const SyncStatusIndicator = Object.assign(
  function SyncStatusIndicatorBase(props: SyncStatusIndicatorProps) {
    return <SyncStatusIndicator {...props} />;
  },
  {
    /**
     * Minimal pill version for headers
     */
    Pill: (props: Omit<SyncStatusIndicatorProps, 'displayMode'>) => (
      <SyncStatusIndicator {...props} displayMode="minimal" />
    ),

    /**
     * Detailed version for settings/debug screens
     */
    Detailed: (props: Omit<SyncStatusIndicatorProps, 'displayMode'>) => (
      <SyncStatusIndicator {...props} displayMode="detailed" />
    ),

    /**
     * Row version for horizontal layouts
     */
    Row: (props: Omit<SyncStatusIndicatorProps, 'displayMode' | 'labelPosition'>) => (
      <SyncStatusIndicator {...props} displayMode="compact" labelPosition="right" />
    ),
  }
);

export default SyncStatusIndicator;
