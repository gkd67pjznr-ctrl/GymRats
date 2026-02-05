/**
 * Day Log Correlations Card - Displays correlations between pre-workout state and performance
 * Shows insights like "When well-rested → X% more PRs"
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { calculateDayLogCorrelations } from '@/src/lib/forgeLab/calculator';
import { useDayLogs } from '@/src/lib/stores/dayLogStore';
import { useWorkoutStore } from '@/src/lib/stores/workoutStore';
import type { DayLogCorrelation } from '@/src/lib/forgeLab/types';

type DayLogCorrelationsCardProps = {
  isLoading?: boolean;
};

const DayLogCorrelationsCard: React.FC<DayLogCorrelationsCardProps> = ({
  isLoading = false,
}) => {
  const ds = makeDesignSystem('dark', 'toxic');
  const { logs, hydrated: logsHydrated } = useDayLogs();
  const sessions = useWorkoutStore((state) => state.sessions);
  const sessionsHydrated = useWorkoutStore((state) => state.hydrated);

  // Calculate correlations
  const correlations = useMemo((): DayLogCorrelation[] => {
    if (!logsHydrated || !sessionsHydrated) return [];
    return calculateDayLogCorrelations(logs, sessions);
  }, [logs, sessions, logsHydrated, sessionsHydrated]);

  // Check if we have enough data
  const hasEnoughData = logs.length >= 3;
  const hasCorrelations = correlations.length > 0;

  // Get strength color
  const getStrengthColor = (strength: DayLogCorrelation['strength']): string => {
    switch (strength) {
      case 'strong':
        return '#4CAF50'; // Green
      case 'moderate':
        return '#FFC107'; // Yellow
      case 'weak':
        return '#9E9E9E'; // Gray
      default:
        return ds.tone.textSecondary;
    }
  };

  // Get strength badge background
  const getStrengthBgColor = (strength: DayLogCorrelation['strength']): string => {
    switch (strength) {
      case 'strong':
        return 'rgba(76, 175, 80, 0.2)';
      case 'moderate':
        return 'rgba(255, 193, 7, 0.2)';
      case 'weak':
        return 'rgba(158, 158, 158, 0.2)';
      default:
        return 'rgba(158, 158, 158, 0.1)';
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>
          Day Log Insights
        </Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          How your pre-workout state affects performance
        </Text>
      </View>

      {isLoading || !logsHydrated || !sessionsHydrated ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : !hasEnoughData ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: ds.tone.text }]}>
            Not Enough Data Yet
          </Text>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            Complete at least 3 workouts with pre-workout check-ins to see correlation insights.
          </Text>
          <Text style={[styles.emptyHint, { color: ds.tone.accent }]}>
            {logs.length} / 3 check-ins completed
          </Text>
        </View>
      ) : !hasCorrelations ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: ds.tone.text }]}>
            No Strong Patterns Found
          </Text>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            Keep logging your pre-workout state. Patterns may emerge with more data.
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.correlationsList}>
            {correlations.slice(0, 5).map((corr, index) => (
              <View
                key={`${corr.factor}-${corr.metric}-${index}`}
                style={[
                  styles.correlationCard,
                  {
                    backgroundColor: ds.tone.bg,
                    borderColor:
                      corr.strength === 'strong'
                        ? ds.tone.accent
                        : corr.strength === 'moderate'
                        ? '#FFC107'
                        : 'rgba(255,255,255,0.1)',
                  },
                ]}
              >
                <View style={styles.correlationHeader}>
                  <View style={styles.correlationMetrics}>
                    <Text style={[styles.correlationMetric, { color: ds.tone.text }]}>
                      {corr.factor}
                    </Text>
                    <Text style={[styles.correlationArrow, { color: ds.tone.textSecondary }]}>
                      {corr.isPositive ? '↑' : '↓'}
                    </Text>
                    <Text style={[styles.correlationMetric, { color: ds.tone.text }]}>
                      {corr.metric}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.correlationBadge,
                      { backgroundColor: getStrengthBgColor(corr.strength) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.correlationStrength,
                        { color: getStrengthColor(corr.strength) },
                      ]}
                    >
                      {corr.strength}
                    </Text>
                  </View>
                </View>

                <View style={styles.correlationValueRow}>
                  <Text
                    style={[
                      styles.correlationValue,
                      { color: corr.isPositive ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    r = {corr.correlation > 0 ? '+' : ''}
                    {corr.correlation.toFixed(2)}
                  </Text>
                  <Text style={[styles.correlationSample, { color: ds.tone.textSecondary }]}>
                    n = {corr.sampleSize}
                  </Text>
                </View>

                <Text style={[styles.correlationDescription, { color: ds.tone.textSecondary }]}>
                  {corr.description}
                </Text>
              </View>
            ))}
          </View>

          {correlations.length > 5 && (
            <Text style={[styles.moreText, { color: ds.tone.textSecondary }]}>
              +{correlations.length - 5} more correlations
            </Text>
          )}
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  emptyHint: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  correlationsList: {
    gap: 12,
  },
  correlationCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  correlationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  correlationMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  correlationMetric: {
    fontSize: 14,
    fontWeight: '600',
  },
  correlationArrow: {
    fontSize: 14,
    fontWeight: '600',
  },
  correlationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  correlationStrength: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  correlationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  correlationValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  correlationSample: {
    fontSize: 12,
  },
  correlationDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  moreText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default DayLogCorrelationsCard;
