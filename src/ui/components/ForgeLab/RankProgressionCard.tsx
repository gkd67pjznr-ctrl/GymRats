/**
 * Rank Progression Card - Displays Forgerank progression over time
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

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

  // Get selected exercise data
  const selectedExerciseData = selectedExercise
    ? exercises.find(ex => ex.exerciseId === selectedExercise)
    : exercises[0];

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
          Track your Forgerank progression over time
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

          {/* Chart Area */}
          {selectedExerciseData ? (
            <View style={styles.chartContainer}>
              <View style={styles.chartPlaceholder}>
                <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                  Rank Progression for {selectedExerciseData.name}
                </Text>
                <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                  {selectedExerciseData.rankHistory.length} rank changes
                </Text>
                {selectedExerciseData.rankHistory.length > 0 && (
                  <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                    Current rank: {selectedExerciseData.rankHistory[selectedExerciseData.rankHistory.length - 1]?.rank} (
                    <Text style={{ color: getRankColor(selectedExerciseData.rankHistory[selectedExerciseData.rankHistory.length - 1]?.rank) }}>
                      {getRankName(selectedExerciseData.rankHistory[selectedExerciseData.rankHistory.length - 1]?.rank)}
                    </Text>
                    )
                  </Text>
                )}
              </View>

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
    marginBottom: 16,
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