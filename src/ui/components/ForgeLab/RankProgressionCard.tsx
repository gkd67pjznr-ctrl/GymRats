/**
 * Rank Progression Card - Displays GymRank progression over time
 * Enhanced with rank projection trajectory
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import VictoryLineChart from './VictoryLineChart';
import { projectRank, calculateMovingAverage } from '@/src/lib/forgeLab/calculator';

type ExerciseStat = {
  exerciseId: string;
  name: string;
  e1rmHistory: { date: string; e1rm: number }[];
  volumeHistory: { week: string; volume: number }[];
  rankHistory: { date: string; rank: number; score: number }[];
};

type RankProgressionCardProps = {
  exercises: ExerciseStat[];
  isLoading: boolean;
};

const RankProgressionCard: React.FC<RankProgressionCardProps> = ({ exercises, isLoading }) => {
  const ds = makeDesignSystem('dark', 'toxic');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showProjection, setShowProjection] = useState(true);

  // Get selected exercise data
  const selectedExerciseData = selectedExercise
    ? exercises.find(ex => ex.exerciseId === selectedExercise)
    : exercises[0];

  // Prepare chart data for rank progression (using score for smoother projection)
  const chartData = selectedExerciseData
    ? selectedExerciseData.rankHistory.map(point => ({
        x: point.date,
        y: point.score, // Use score instead of rank for smoother chart
        date: point.date,
        rank: point.rank,
        score: point.score,
      }))
    : [];

  // Calculate projection
  const projection = useMemo(() => {
    if (!selectedExerciseData?.rankHistory || selectedExerciseData.rankHistory.length < 3) {
      return null;
    }
    const currentRank = selectedExerciseData.rankHistory[selectedExerciseData.rankHistory.length - 1]?.rank || 1;
    return projectRank(selectedExerciseData.rankHistory, currentRank);
  }, [selectedExerciseData?.rankHistory]);

  // Generate projection line data (30 days into the future)
  const projectionLineData = useMemo(() => {
    if (!projection || !selectedExerciseData?.rankHistory.length) return [];

    const lastPoint = selectedExerciseData.rankHistory[selectedExerciseData.rankHistory.length - 1];
    const lastDate = new Date(lastPoint.date);
    const lastScore = lastPoint.score;
    const projectedScore = projection.projectedScore;

    // Create points from last data point to 30 days in future
    const points: { x: string; y: number }[] = [];
    for (let i = 0; i <= 30; i += 5) { // Every 5 days
      const futureDate = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000);
      const interpolatedScore = lastScore + ((projectedScore - lastScore) * (i / 30));
      points.push({
        x: futureDate.toISOString().split('T')[0],
        y: interpolatedScore,
      });
    }
    return points;
  }, [projection, selectedExerciseData?.rankHistory]);

  // Calculate trend line for score history
  const trendLineData = useMemo(() => {
    if (!selectedExerciseData?.rankHistory || selectedExerciseData.rankHistory.length < 5) return [];

    const dataForMA = selectedExerciseData.rankHistory.map(p => ({
      date: p.date,
      value: p.score,
    }));

    return calculateMovingAverage(dataForMA, 5).map(p => ({
      x: p.date,
      y: p.value,
    }));
  }, [selectedExerciseData?.rankHistory]);

  // Get rank colors from design system
  const getRankColor = (rank: number): string => {
    if (rank >= 19) return ds.tone.mythic;     // 19-20: Mythic
    if (rank >= 16) return ds.tone.diamond;    // 16-18: Diamond
    if (rank >= 13) return ds.tone.platinum;   // 13-15: Platinum
    if (rank >= 10) return ds.tone.gold;       // 10-12: Gold
    if (rank >= 7) return ds.tone.silver;      // 7-9: Silver
    if (rank >= 4) return ds.tone.bronze;      // 4-6: Bronze
    return ds.tone.iron;                       // 1-3: Iron
  };

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Rank Progression</Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          Track your GymRank progression over time
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : exercises && exercises.length > 0 ? (
        <View style={styles.content}>
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
                  onPress={() => setSelectedExercise(exercise.exerciseId)}
                >
                  {exercise.name}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Projection Toggle */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setShowProjection(!showProjection)}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: showProjection ? 'rgba(100,200,255,0.2)' : ds.tone.bg,
                  borderColor: showProjection ? '#64C8FF' : ds.tone.textSecondary,
                }
              ]}
            >
              <Text style={[styles.toggleText, { color: showProjection ? '#64C8FF' : ds.tone.textSecondary }]}>
                🔮 Projection
              </Text>
            </Pressable>
          </View>

          {/* Chart Area */}
          {selectedExerciseData ? (
            <View style={styles.chartContainer}>
              {chartData.length > 0 ? (
                <View style={styles.chartContainerInner}>
                  <VictoryLineChart
                    data={chartData}
                    xLabel="Date"
                    yLabel="Score"
                    accentColor={ds.tone.accent}
                    height={150}
                    showDots={chartData.length <= 20}
                    trendLineData={showProjection && projectionLineData.length > 0 ? projectionLineData : undefined}
                    trendLineColor="#64C8FF"
                  />

                  {/* Projection Stats */}
                  {showProjection && projection && (
                    <View style={styles.projectionContainer}>
                      <View style={[styles.projectionCard, { backgroundColor: 'rgba(100,200,255,0.1)', borderColor: 'rgba(100,200,255,0.3)' }]}>
                        <Text style={[styles.projectionLabel, { color: ds.tone.textSecondary }]}>
                          30-Day Projection
                        </Text>
                        <Text style={[styles.projectionValue, { color: '#64C8FF' }]}>
                          {projection.projectedScore} pts
                        </Text>
                        <View style={[styles.confidenceBadge, {
                          backgroundColor: projection.confidence === 'high' ? 'rgba(76,175,80,0.2)' :
                                          projection.confidence === 'medium' ? 'rgba(255,193,7,0.2)' :
                                          'rgba(244,67,54,0.2)'
                        }]}>
                          <Text style={[styles.confidenceText, {
                            color: projection.confidence === 'high' ? '#4CAF50' :
                                   projection.confidence === 'medium' ? '#FFC107' :
                                   '#F44336'
                          }]}>
                            {projection.confidence} confidence
                          </Text>
                        </View>
                      </View>

                      {projection.daysToNextRank && (
                        <View style={[styles.projectionCard, { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.3)' }]}>
                          <Text style={[styles.projectionLabel, { color: ds.tone.textSecondary }]}>
                            Next Rank In
                          </Text>
                          <Text style={[styles.projectionValue, { color: '#FFD700' }]}>
                            ~{projection.daysToNextRank} days
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.statsContainer}>
                    <Text style={[styles.statsText, { color: ds.tone.textSecondary }]}>
                      {chartData.length} sessions • Current: {chartData[chartData.length - 1]?.score} pts (
                      <Text style={{ color: getRankColor(chartData[chartData.length - 1]?.rank) }}>
                        {getRankName(chartData[chartData.length - 1]?.rank)}
                      </Text>
                      )
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                    No rank history data for {selectedExerciseData.name}
                  </Text>
                </View>
              )}

              {/* Rank History List */}
              {selectedExerciseData.rankHistory.length > 0 && (
                <View style={styles.rankHistoryContainer}>
                  <Text style={[styles.sectionTitle, { color: ds.tone.text }]}>
                    Rank History
                  </Text>
                  <ScrollView style={styles.rankHistoryList}>
                    {[...selectedExerciseData.rankHistory]
                      .reverse()
                      .slice(0, 5)
                      .map((rankEntry, index) => (
                        <View key={index} style={styles.rankEntry}>
                          <View style={styles.rankInfo}>
                            <Text style={[styles.rankDate, { color: ds.tone.textSecondary }]}>
                              {formatDate(rankEntry.date)}
                            </Text>
                            <Text style={[styles.rankValue, { color: ds.tone.text }]}>
                              Rank {rankEntry.rank}
                            </Text>
                          </View>
                          <View style={styles.rankBadgeContainer}>
                            <View
                              style={[
                                styles.rankBadge,
                                { backgroundColor: getRankColor(rankEntry.rank) }
                              ]}
                            >
                              <Text style={styles.rankBadgeText}>
                                {getRankName(rankEntry.rank)}
                              </Text>
                            </View>
                            <Text style={[styles.scoreText, { color: ds.tone.textSecondary }]}>
                              {rankEntry.score} pts
                            </Text>
                          </View>
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
                Select an exercise to view rank progression
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            No rank data available
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper function to get rank name
const getRankName = (rank: number): string => {
  const ranks = [
    'Iron', 'Iron', 'Iron', 'Bronze', 'Bronze', 'Bronze',
    'Silver', 'Silver', 'Silver', 'Gold', 'Gold', 'Gold',
    'Platinum', 'Platinum', 'Platinum', 'Diamond', 'Diamond', 'Diamond',
    'Mythic', 'Mythic'
  ];
  return ranks[rank - 1] || 'Iron';
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  exerciseSelector: {
    marginBottom: 12,
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
  projectionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  projectionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  projectionLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  chartContainer: {
    flex: 1,
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  chartContainerInner: {
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    opacity: 0.8,
  },
  chartText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankHistoryContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rankHistoryList: {
    maxHeight: 150,
  },
  rankEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rankInfo: {
    flex: 1,
  },
  rankDate: {
    fontSize: 14,
  },
  rankValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  rankBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  rankBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 14,
  },
  emptyContainer: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RankProgressionCard;