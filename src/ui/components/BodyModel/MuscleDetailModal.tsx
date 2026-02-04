// src/ui/components/BodyModel/MuscleDetailModal.tsx
// Modal showing detailed stats for a selected muscle group

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { FR } from '../../GrStyle';
import type { MuscleGroup } from '@/src/data/exerciseTypes';
import type { TimePeriod, MuscleDetail } from '@/src/lib/bodyModel/bodyModelTypes';
import { getMuscleDetail, formatVolume } from '@/src/lib/bodyModel/muscleDetailService';
import { useWorkoutSessions } from '@/src/lib/stores/workoutStore';

interface MuscleDetailModalProps {
  visible: boolean;
  onClose: () => void;
  muscleGroup: MuscleGroup | null;
  timePeriod: TimePeriod;
}

export function MuscleDetailModal({
  visible,
  onClose,
  muscleGroup,
  timePeriod,
}: MuscleDetailModalProps) {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();

  const detail: MuscleDetail | null = useMemo(() => {
    if (!muscleGroup) return null;
    return getMuscleDetail(sessions, muscleGroup, timePeriod);
  }, [muscleGroup, sessions, timePeriod]);

  if (!detail) return null;

  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 0.8) return '#4CAF50'; // High - green
    if (intensity >= 0.5) return '#FFC107'; // Medium - amber
    if (intensity >= 0.2) return '#FF9800'; // Low - orange
    return '#F44336'; // Very low - red
  };

  const getStatusLabel = (daysSince: number | null): string => {
    if (daysSince === null) return 'Never trained';
    if (daysSince === 0) return 'Trained today';
    if (daysSince === 1) return 'Trained yesterday';
    if (daysSince <= 3) return 'Recently trained';
    if (daysSince <= 7) return 'Trained this week';
    return `${daysSince} days ago`;
  };

  const getStatusColor = (daysSince: number | null): string => {
    if (daysSince === null) return '#F44336';
    if (daysSince <= 3) return '#4CAF50';
    if (daysSince <= 7) return '#FFC107';
    return '#FF9800';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: c.text }]}>{detail.name}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: c.card }]}>
                <Text style={[styles.badgeText, { color: c.muted }]}>
                  {detail.movementPattern.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: c.card }]}>
                <Text style={[styles.badgeText, { color: c.muted }]}>
                  {detail.bodyRegion.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={c.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View style={[styles.section, { backgroundColor: c.card }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(detail.daysSinceLastTrained) },
                  ]}
                />
                <Text style={[styles.statusText, { color: c.text }]}>
                  {getStatusLabel(detail.daysSinceLastTrained)}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.intensityBar,
                    {
                      backgroundColor: c.bg,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.intensityFill,
                      {
                        backgroundColor: getIntensityColor(detail.normalizedIntensity),
                        width: `${detail.normalizedIntensity * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.intensityLabel, { color: c.muted }]}>
                  Intensity: {Math.round(detail.normalizedIntensity * 100)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={[styles.section, { backgroundColor: c.card }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Volume Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: c.primary }]}>
                  {formatVolume(detail.totalVolumeKg)}
                </Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Total Volume</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: c.primary }]}>
                  {detail.totalSets}
                </Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Sets</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: c.primary }]}>
                  {detail.sessionCount}
                </Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Sessions</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: c.primary }]}>
                  {detail.volumePercentage.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Of Total</Text>
              </View>
            </View>
          </View>

          {/* Volume Trend */}
          {detail.volumeTrend.length > 0 && (
            <View style={[styles.section, { backgroundColor: c.card }]}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Volume Trend</Text>
              <View style={styles.trendContainer}>
                {detail.volumeTrend.slice(-7).map((point, index) => {
                  const maxVolume = Math.max(...detail.volumeTrend.map(p => p.volumeKg), 1);
                  const height = (point.volumeKg / maxVolume) * 60;
                  const date = new Date(point.dateMs);
                  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <View key={index} style={styles.trendBar}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height,
                              backgroundColor: c.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barLabel, { color: c.muted }]}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Top Exercises */}
          <View style={[styles.section, { backgroundColor: c.card }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Top Exercises</Text>
            {detail.topExercises.length > 0 ? (
              detail.topExercises.map((exercise, index) => (
                <View
                  key={exercise.exerciseId}
                  style={[
                    styles.exerciseRow,
                    index < detail.topExercises.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: c.border,
                    },
                  ]}
                >
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: c.text }]}>
                      {exercise.exerciseName}
                    </Text>
                    <Text style={[styles.exerciseSets, { color: c.muted }]}>
                      {exercise.sets} sets
                    </Text>
                  </View>
                  <Text style={[styles.exerciseVolume, { color: c.primary }]}>
                    {formatVolume(exercise.volumeKg)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: c.muted }]}>
                No exercises logged for this muscle
              </Text>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusRow: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  intensityBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 4,
  },
  intensityLabel: {
    fontSize: 12,
    width: 100,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 60,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseSets: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseVolume: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default MuscleDetailModal;
