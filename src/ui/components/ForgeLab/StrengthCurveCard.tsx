/**
 * Strength Curve Card - Displays e1RM trends over time
 * Enhanced with PR markers, trend lines, tooltips, and period comparison
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import VictoryLineChart from './VictoryLineChart';
import { calculateMovingAverage, comparePeriods } from '@/src/lib/forgeLab/calculator';

type ExerciseStat = {
  exerciseId: string;
  name: string;
  e1rmHistory: { date: string; e1rm: number; isPR?: boolean }[];
  volumeHistory: { week: string; volume: number }[];
  rankHistory: { date: string; rank: number; score: number }[];
};

type StrengthCurveCardProps = {
  exercises: ExerciseStat[];
  selectedExercise: string | null;
  onSelectExercise: (exerciseId: string) => void;
  isLoading: boolean;
};

const StrengthCurveCard: React.FC<StrengthCurveCardProps> = ({
  exercises,
  selectedExercise,
  onSelectExercise,
  isLoading
}) => {
  const ds = makeDesignSystem('dark', 'toxic');
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [showPRMarkers, setShowPRMarkers] = useState(true);

  // Get selected exercise data
  const selectedExerciseData = selectedExercise
    ? exercises.find(ex => ex.exerciseId === selectedExercise)
    : exercises[0];

  // Calculate moving average trend line
  const trendLineData = useMemo(() => {
    if (!selectedExerciseData?.e1rmHistory || selectedExerciseData.e1rmHistory.length < 5) {
      return [];
    }

    const dataForMA = selectedExerciseData.e1rmHistory.map(p => ({
      date: p.date,
      value: p.e1rm,
    }));

    return calculateMovingAverage(dataForMA, 5).map(p => ({
      x: p.date,
      y: p.value,
    }));
  }, [selectedExerciseData?.e1rmHistory]);

  // Calculate period comparison (last 30 days vs previous 30 days)
  const periodComparison = useMemo(() => {
    if (!selectedExerciseData?.e1rmHistory || selectedExerciseData.e1rmHistory.length < 2) {
      return null;
    }

    const dataForComparison = selectedExerciseData.e1rmHistory.map(p => ({
      date: p.date,
      value: p.e1rm,
    }));

    return comparePeriods(dataForComparison, 30);
  }, [selectedExerciseData?.e1rmHistory]);

  // Count PRs
  const prCount = useMemo(() => {
    return selectedExerciseData?.e1rmHistory.filter(p => p.isPR).length || 0;
  }, [selectedExerciseData?.e1rmHistory]);

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Strength Curves</Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          Track your estimated 1RM progress
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : exercises && exercises.length > 0 ? (
        <>
          {/* Exercise Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.exerciseSelector}
            contentContainerStyle={styles.exerciseSelectorContent}
          >
            {exercises.map(exercise => (
              <View
                key={exercise.exerciseId}
                style={[
                  styles.exerciseButton,
                  {
                    backgroundColor:
                      selectedExercise === exercise.exerciseId
                        ? ds.tone.accent
                        : ds.tone.bg,
                    borderColor: ds.tone.accent,
                  },
                  selectedExercise === exercise.exerciseId && styles.exerciseButtonSelected
                ]}
              >
                <Text
                  style={[
                    styles.exerciseButtonText,
                    {
                      color:
                        selectedExercise === exercise.exerciseId
                          ? ds.tone.bg
                          : ds.tone.text
                    }
                  ]}
                  onPress={() => onSelectExercise(exercise.exerciseId)}
                >
                  {exercise.name}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Toggle controls */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setShowPRMarkers(!showPRMarkers)}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: showPRMarkers ? 'rgba(255,215,0,0.2)' : ds.tone.bg,
                  borderColor: showPRMarkers ? '#FFD700' : ds.tone.textSecondary,
                }
              ]}
            >
              <Text style={[styles.toggleText, { color: showPRMarkers ? '#FFD700' : ds.tone.textSecondary }]}>
                ⭐ PRs
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowTrendLine(!showTrendLine)}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: showTrendLine ? 'rgba(255,255,255,0.1)' : ds.tone.bg,
                  borderColor: showTrendLine ? ds.tone.text : ds.tone.textSecondary,
                }
              ]}
            >
              <Text style={[styles.toggleText, { color: showTrendLine ? ds.tone.text : ds.tone.textSecondary }]}>
                📈 Trend
              </Text>
            </Pressable>
          </View>

          {/* Chart Area */}
          <View style={styles.chartContainer}>
            {selectedExerciseData ? (
              selectedExerciseData.e1rmHistory.length > 0 ? (
                <>
                  <VictoryLineChart
                    data={selectedExerciseData.e1rmHistory.map(point => ({
                      x: point.date,
                      y: point.e1rm,
                      date: point.date,
                      isPR: point.isPR,
                    }))}
                    xLabel="Date"
                    yLabel="e1RM (kg)"
                    accentColor={ds.tone.accent}
                    height={180}
                    showDots={selectedExerciseData.e1rmHistory.length <= 20}
                    showPRMarkers={showPRMarkers}
                    trendLineData={showTrendLine ? trendLineData : undefined}
                    enableTooltips={true}
                  />

                  {/* Stats Row */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: ds.tone.accent }]}>
                        {selectedExerciseData.e1rmHistory[selectedExerciseData.e1rmHistory.length - 1]?.e1rm.toFixed(1)}
                      </Text>
                      <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>Latest (kg)</Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: '#FFD700' }]}>
                        {prCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>PRs</Text>
                    </View>

                    {periodComparison && (
                      <View style={styles.statItem}>
                        <Text style={[
                          styles.statValue,
                          { color: periodComparison.percentChange >= 0 ? '#4CAF50' : '#F44336' }
                        ]}>
                          {periodComparison.percentChange >= 0 ? '+' : ''}{periodComparison.percentChange}%
                        </Text>
                        <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>vs Last 30d</Text>
                      </View>
                    )}

                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: ds.tone.text }]}>
                        {selectedExerciseData.e1rmHistory.length}
                      </Text>
                      <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>Sessions</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
                    No e1RM data for {selectedExerciseData.name}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.emptyChart}>
                <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
                  Select an exercise to view strength curve
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            No exercise data available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseSelector: {
    marginBottom: 12,
  },
  exerciseSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  exerciseButtonSelected: {
    borderWidth: 2,
  },
  exerciseButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    minHeight: 200,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StrengthCurveCard;
