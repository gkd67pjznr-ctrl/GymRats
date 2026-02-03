// app/debug/sync-status.tsx
// Debug screen for viewing detailed sync status across all stores

import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { useSyncState } from "../../src/lib/hooks/useSyncStatus";
import { networkMonitor } from "../../src/lib/sync/NetworkMonitor";
import { useThemeColors } from "../../src/ui/theme";
import { FR } from "../../src/ui/GrStyle";
import { useWorkoutStore } from "../../src/lib/stores/workoutStore";
import { useRoutinesStore } from "../../src/lib/stores/routinesStore";
import { clearCurrentSession } from "../../src/lib/stores";
import { useOnboardingStore, resetOnboarding } from "../../src/lib/stores/onboardingStore";

type SyncStatusDisplay = {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync: number | null;
  pending: number;
  error: string | null;
};

function formatTimestamp(ms: number | null): string {
  if (!ms) return "Never";
  return new Date(ms).toLocaleString();
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function getStatusColor(status: 'idle' | 'syncing' | 'success' | 'error'): string {
  switch (status) {
    case 'idle': return '#6b7280';
    case 'syncing': return '#3b82f6';
    case 'success': return '#10b981';
    case 'error': return '#ef4444';
  }
}

function getStatusLabel(status: 'idle' | 'syncing' | 'success' | 'error'): string {
  switch (status) {
    case 'idle': return 'Idle';
    case 'syncing': return 'Syncing...';
    case 'success': return 'Synced';
    case 'error': return 'Error';
  }
}

export default function SyncStatusScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { isSyncing, stats, statuses, pending, syncAll, hasErrors, totalPending } = useSyncState();
  const isOnline = networkMonitor.isOnline();

  const [syncing, setSyncing] = useState(false);

  // Data counts
  const workoutSessions = useWorkoutStore((s) => s.sessions);
  const routines = useRoutinesStore((s) => s.routines);
  const clearWorkoutSessions = useWorkoutStore((s) => s.clearSessions);
  const clearRoutines = useRoutinesStore((s) => s.clearRoutines);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);

  const handleClearWorkouts = () => {
    Alert.alert(
      "Clear Workout History",
      `This will permanently delete ${workoutSessions.length} workout sessions. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            clearWorkoutSessions();
            Alert.alert("Done", "All workout sessions cleared.");
          },
        },
      ]
    );
  };

  const handleClearRoutines = () => {
    Alert.alert(
      "Clear Routines",
      `This will permanently delete ${routines.length} routines. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            clearRoutines();
            Alert.alert("Done", "All routines cleared.");
          },
        },
      ]
    );
  };

  const handleClearCurrentSession = () => {
    Alert.alert(
      "Clear Active Workout",
      "This will clear any in-progress workout session.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCurrentSession();
            Alert.alert("Done", "Active workout cleared.");
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset onboarding to show the welcome flow again on next app navigation.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetOnboarding();
            Alert.alert("Done", "Onboarding reset. Navigate away from this screen to see onboarding flow.");
          },
        },
      ]
    );
  };

  async function handleSyncAll() {
    setSyncing(true);
    try {
      await syncAll();
    } catch (err) {
      console.error('[SyncStatus] Manual sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }

  const storeList: { name: string; displayName: string }[] = [
    { name: 'workout', displayName: 'Workouts' },
    { name: 'routines', displayName: 'Routines' },
    { name: 'workoutPlan', displayName: 'Workout Plans' },
    { name: 'friends', displayName: 'Friends' },
    { name: 'social', displayName: 'Social Feed' },
    { name: 'feed', displayName: 'Feed' },
    { name: 'chat', displayName: 'Chat' },
  ];

  return (
    <>
    <Stack.Screen
      options={{
        title: "Sync Status",
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: c.text, fontWeight: "900" }}>Back</Text>
          </Pressable>
        ),
      }}
    />

    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      >
        {/* Overall Status Card */}
        <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 12 }}>
          <Text style={{ color: c.text, ...FR.type.h2 }}>Overall Status</Text>

          {/* Network Status */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Network</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isOnline ? '#10b981' : '#ef4444',
              }} />
              <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Sync Status */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Sync Status</Text>
            <Text style={{
              color: getStatusColor(hasErrors ? 'error' : isSyncing ? 'syncing' : 'success'),
              ...FR.type.body,
              fontWeight: "700",
            }}>
              {hasErrors ? 'Errors' : isSyncing ? 'Syncing...' : 'Healthy'}
            </Text>
          </View>

          {/* Pending Mutations */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Pending Changes</Text>
            <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
              {totalPending}
            </Text>
          </View>

          {/* Last Sync */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Last Sync</Text>
            <Text style={{ color: c.text, ...FR.type.sub }}>
              {formatTimestamp(stats.lastSyncAt)}
            </Text>
          </View>

          {/* Sync Duration */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Last Duration</Text>
            <Text style={{ color: c.text, ...FR.type.sub }}>
              {formatDuration(stats.lastSyncDuration)}
            </Text>
          </View>

          {/* Manual Sync Button */}
          <Pressable
            onPress={handleSyncAll}
            disabled={syncing || !isOnline}
            style={({ pressed }) => ({
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: FR.radius.button,
              backgroundColor: (syncing || !isOnline) ? c.border : c.text,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={c.bg} />
            ) : (
              <Text style={{ color: c.bg, ...FR.type.body, fontWeight: "900" }}>
                Sync All Now
              </Text>
            )}
          </Pressable>
        </View>

        {/* Statistics Card */}
        <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 12 }}>
          <Text style={{ color: c.text, ...FR.type.h2 }}>Statistics</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Total Syncs</Text>
            <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
              {stats.totalSyncs}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Successful</Text>
            <Text style={{ color: '#10b981', ...FR.type.body, fontWeight: "700" }}>
              {stats.successfulSyncs}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.muted, ...FR.type.body }}>Failed</Text>
            <Text style={{ color: '#ef4444', ...FR.type.body, fontWeight: "700" }}>
              {stats.failedSyncs}
            </Text>
          </View>
        </View>

        {/* Per-Store Status */}
        <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 12 }}>
          <Text style={{ color: c.text, ...FR.type.h2 }}>Store Status</Text>

          {storeList.map((store) => {
            const status = statuses[store.name] || 'idle';
            const pendingCount = pending[store.name] || 0;
            const statusColor = getStatusColor(status);

            return (
              <View
                key={store.name}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                }}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                    {store.displayName}
                  </Text>
                  <Text style={{ color: c.muted, ...FR.type.sub }}>
                    {getStatusLabel(status)}
                    {pendingCount > 0 && ` • ${pendingCount} pending`}
                  </Text>
                </View>

                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: statusColor,
                }} />
              </View>
            );
          })}
        </View>

        {/* Info Card */}
        <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 8 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>About Sync Status</Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            This screen shows the real-time synchronization status of all app data.
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            • <Text style={{ color: c.text }}>Green:</Text> Successfully synced
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            • <Text style={{ color: c.text }}>Blue:</Text> Currently syncing
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            • <Text style={{ color: c.text }}>Gray:</Text> Idle (waiting for sync)
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            • <Text style={{ color: c.text }}>Red:</Text> Error occurred
          </Text>
        </View>

        {/* Danger Zone - Data Reset */}
        <View style={{ ...FR.card({ card: c.card, border: '#ef4444' }), gap: 12 }}>
          <Text style={{ color: '#ef4444', ...FR.type.h2 }}>Danger Zone</Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Use these buttons to clear local data. This cannot be undone.
          </Text>

          {/* Current Data Counts */}
          <View style={{ backgroundColor: `${c.border}40`, borderRadius: 8, padding: 12, gap: 4 }}>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              Workouts: <Text style={{ color: c.text, fontWeight: "700" }}>{workoutSessions.length}</Text>
            </Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              Routines: <Text style={{ color: c.text, fontWeight: "700" }}>{routines.length}</Text>
            </Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              Onboarding: <Text style={{ color: onboardingCompleted ? '#10b981' : '#f97316', fontWeight: "700" }}>
                {onboardingCompleted ? 'Completed' : 'Not Completed'}
              </Text>
            </Text>
          </View>

          {/* Clear Active Workout */}
          <Pressable
            onPress={handleClearCurrentSession}
            style={({ pressed }) => ({
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: FR.radius.button,
              backgroundColor: '#f97316',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#fff', ...FR.type.body, fontWeight: "900" }}>
              Clear Active Workout
            </Text>
          </Pressable>

          {/* Clear Workouts */}
          <Pressable
            onPress={handleClearWorkouts}
            disabled={workoutSessions.length === 0}
            style={({ pressed }) => ({
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: FR.radius.button,
              backgroundColor: workoutSessions.length === 0 ? c.border : '#ef4444',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#fff', ...FR.type.body, fontWeight: "900" }}>
              Clear All Workouts ({workoutSessions.length})
            </Text>
          </Pressable>

          {/* Clear Routines */}
          <Pressable
            onPress={handleClearRoutines}
            disabled={routines.length === 0}
            style={({ pressed }) => ({
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: FR.radius.button,
              backgroundColor: routines.length === 0 ? c.border : '#ef4444',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#fff', ...FR.type.body, fontWeight: "900" }}>
              Clear All Routines ({routines.length})
            </Text>
          </Pressable>

          {/* Reset Onboarding */}
          <Pressable
            onPress={handleResetOnboarding}
            style={({ pressed }) => ({
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: FR.radius.button,
              backgroundColor: '#8b5cf6',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#fff', ...FR.type.body, fontWeight: "900" }}>
              Reset Onboarding
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  </>
  );
}
