/**
 * Strength Curve Card - Displays e1RM trends over time
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import VictoryLineChart from './VictoryLineChart';

type ExerciseStat = {
  exerciseId: string;
  name: string;
  e1rmHistory: { date: string; e1rm: number }[];
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

  // Get selected exercise data
  const selectedExerciseData = selectedExercise
    ? exercises.find(ex => ex.exerciseId === selectedExercise)
    : exercises[0];

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
                    }))}
                    xLabel="Date"
                    yLabel="e1RM (kg)"
                    accentColor={ds.tone.accent}
                    height={180}
                    showDots={selectedExerciseData.e1rmHistory.length <= 20}
                  />
                  <View style={styles.statsContainer}>
                    <Text style={[styles.statsText, { color: ds.tone.textSecondary }]}>
                      {selectedExerciseData.e1rmHistory.length} measurements •
                      Latest: {selectedExerciseData.e1rmHistory[selectedExerciseData.e1rmHistory.length - 1]?.e1rm.toFixed(1)}kg
                    </Text>
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
    height: 200,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    fontSize: 16,
    marginBottom: 8,
  },
  statsContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    opacity: 0.8,
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