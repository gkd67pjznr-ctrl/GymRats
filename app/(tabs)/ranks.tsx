// app/(tabs)/ranks.tsx
// Main Ranks tab with My Ranks and Leaderboards sub-tabs

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../../src/ui/theme';
import { TabErrorBoundary } from '../../src/ui/tab-error-boundary';
import { ProtectedRoute } from '../../src/ui/components/ProtectedRoute';
import { FR } from '../../src/ui/forgerankStyle';
import { ExerciseRankList, LeaderboardsTab, FriendCompareModal } from '../../src/ui/components/Ranks';
import { useExerciseRank } from '../../src/lib/hooks/useExerciseRanks';
import { shareRank } from '../../src/lib/sharing/rankCardGenerator';

type SubTab = 'my-ranks' | 'leaderboards';

export default function RanksTab() {
  const c = useThemeColors();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('my-ranks');
  const [compareExerciseId, setCompareExerciseId] = useState<string | null>(null);
  const [shareExerciseId, setShareExerciseId] = useState<string | null>(null);

  // Get exercise rank for sharing
  const shareExerciseRank = useExerciseRank(shareExerciseId ?? '');

  // Handle compare button press
  const handleCompare = useCallback((exerciseId: string) => {
    setCompareExerciseId(exerciseId);
  }, []);

  // Handle share button press
  const handleShare = useCallback((exerciseId: string) => {
    setShareExerciseId(exerciseId);
  }, []);

  // Share when exercise rank is loaded
  useEffect(() => {
    if (shareExerciseId && shareExerciseRank) {
      shareRank(shareExerciseRank).finally(() => {
        setShareExerciseId(null);
      });
    }
  }, [shareExerciseId, shareExerciseRank]);

  const SubTabToggle = ({ label, tab }: { label: string; tab: SubTab }) => (
    <Pressable
      onPress={() => setActiveSubTab(tab)}
      style={[
        styles.subTabButton,
        {
          backgroundColor: activeSubTab === tab ? c.primary : 'transparent',
          borderColor: activeSubTab === tab ? c.primary : c.border,
        },
      ]}
    >
      <Text
        style={[
          styles.subTabLabel,
          {
            color: activeSubTab === tab ? '#fff' : c.text,
            fontWeight: activeSubTab === tab ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Ranks">
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>Ranks</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              Track your progress and compete with others
            </Text>
          </View>

          {/* Sub-tab toggle */}
          <View style={[styles.subTabRow, { borderColor: c.border }]}>
            <SubTabToggle label="My Ranks" tab="my-ranks" />
            <SubTabToggle label="Leaderboards" tab="leaderboards" />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {activeSubTab === 'my-ranks' ? (
              <ExerciseRankList
                onCompare={handleCompare}
                onShare={handleShare}
              />
            ) : (
              <LeaderboardsTab />
            )}
          </View>

          {/* Friend Compare Modal */}
          <FriendCompareModal
            visible={compareExerciseId !== null}
            exerciseId={compareExerciseId}
            onClose={() => setCompareExerciseId(null)}
          />
        </View>
      </TabErrorBoundary>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: FR.space.x4,
    paddingBottom: FR.space.x2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: FR.space.x4,
    paddingBottom: FR.space.x3,
    gap: FR.space.x2,
    borderBottomWidth: 1,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  subTabLabel: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: FR.space.x4,
    paddingTop: FR.space.x3,
  },
});
