// src/ui/components/BodyModel/BalanceIndicatorsCard.tsx
// Card displaying muscle balance indicators

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { useWorkoutSessions } from '@/src/lib/stores/workoutStore';
import { calculateVolumeForSessions } from '@/src/lib/volumeCalculator';
import {
  calculateAllBalanceAssessments,
  calculateOverallBalanceScore,
  getBalanceStatusLabel,
  getBalanceStatusColor,
} from '@/src/lib/bodyModel/balanceCalculator';
import type { BalanceAssessment, TimePeriod } from '@/src/lib/bodyModel/bodyModelTypes';
import { filterSessionsByPeriod } from '@/src/lib/bodyModel/muscleDetailService';

interface BalanceIndicatorsCardProps {
  /** Time period for analysis */
  timePeriod?: TimePeriod;
  /** Whether to show detailed view */
  detailed?: boolean;
  /** Callback when tapped for more details */
  onPress?: () => void;
}

export function BalanceIndicatorsCard({
  timePeriod = 'month',
  detailed = false,
  onPress,
}: BalanceIndicatorsCardProps) {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();

  const { assessments, overallScore } = useMemo(() => {
    const filteredSessions = filterSessionsByPeriod(sessions, timePeriod);
    const volumeResult = calculateVolumeForSessions(filteredSessions);
    const assessments = calculateAllBalanceAssessments(volumeResult);
    const overallScore = calculateOverallBalanceScore(volumeResult);

    return { assessments, overallScore };
  }, [sessions, timePeriod]);

  const statusColor = getBalanceStatusColor(overallScore);
  const statusLabel = getBalanceStatusLabel(overallScore);

  const getStatusIcon = (status: BalanceAssessment['status']): string => {
    switch (status) {
      case 'balanced':
        return 'checkmark-circle';
      case 'dominant_first':
      case 'dominant_second':
        return 'alert-circle';
    }
  };

  const getStatusIndicatorColor = (status: BalanceAssessment['status']): string => {
    return status === 'balanced' ? '#4CAF50' : '#FF9800';
  };

  const renderBalanceBar = (assessment: BalanceAssessment) => {
    // Calculate position on bar (0 = far left, 100 = far right)
    // ratio of 1 = center, < 1 = left, > 1 = right
    const ratio = Math.min(2, Math.max(0.5, assessment.ratio));
    const position = ((ratio - 0.5) / 1.5) * 100;

    return (
      <View style={styles.balanceBarContainer}>
        {/* Labels */}
        <View style={styles.balanceLabels}>
          <Text style={[styles.balanceLabel, { color: c.muted }]}>
            {assessment.name.split(' / ')[0]}
          </Text>
          <Text style={[styles.balanceLabel, { color: c.muted }]}>
            {assessment.name.split(' / ')[1]}
          </Text>
        </View>

        {/* Bar */}
        <View style={[styles.balanceBar, { backgroundColor: c.bg }]}>
          {/* Center line */}
          <View style={[styles.centerLine, { backgroundColor: c.border }]} />

          {/* Indicator */}
          <View
            style={[
              styles.balanceIndicator,
              {
                left: `${position}%`,
                backgroundColor: getStatusIndicatorColor(assessment.status),
              },
            ]}
          />
        </View>

        {/* Ratio text */}
        <Text style={[styles.ratioText, { color: c.muted }]}>
          {assessment.ratio === Infinity ? '∞' : assessment.ratio.toFixed(2)}
        </Text>
      </View>
    );
  };

  const Container = onPress ? Pressable : View;
  const containerProps = onPress ? { onPress } : {};

  return (
    <Container
      {...containerProps}
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: c.text }]}>Balance</Text>
          <View style={styles.scoreBadge}>
            <View style={[styles.scoreCircle, { backgroundColor: statusColor }]}>
              <Text style={styles.scoreText}>{overallScore}</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={c.muted} />
        )}
      </View>

      {/* Balance indicators */}
      <View style={styles.balanceList}>
        {assessments.map((assessment, index) => (
          <View key={assessment.name}>
            {/* Compact view: just icon and name */}
            {!detailed && (
              <View style={styles.compactRow}>
                <Ionicons
                  name={getStatusIcon(assessment.status) as any}
                  size={16}
                  color={getStatusIndicatorColor(assessment.status)}
                />
                <Text style={[styles.assessmentName, { color: c.text }]}>
                  {assessment.name}
                </Text>
                {assessment.status !== 'balanced' && (
                  <Text style={[styles.deviationText, { color: c.muted }]}>
                    {assessment.deviationPercent.toFixed(0)}% off
                  </Text>
                )}
              </View>
            )}

            {/* Detailed view: full bar and description */}
            {detailed && (
              <View style={styles.detailedRow}>
                <View style={styles.detailedHeader}>
                  <Ionicons
                    name={getStatusIcon(assessment.status) as any}
                    size={18}
                    color={getStatusIndicatorColor(assessment.status)}
                  />
                  <Text style={[styles.assessmentName, { color: c.text }]}>
                    {assessment.name}
                  </Text>
                </View>

                {renderBalanceBar(assessment)}

                <Text style={[styles.descriptionText, { color: c.muted }]}>
                  {assessment.description}
                </Text>

                {assessment.status !== 'balanced' && (
                  <View style={[styles.recommendationBox, { backgroundColor: c.bg }]}>
                    <Ionicons name="bulb-outline" size={14} color={c.primary} />
                    <Text style={[styles.recommendationText, { color: c.text }]}>
                      {assessment.recommendation}
                    </Text>
                  </View>
                )}

                {index < assessments.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: c.border }]} />
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceList: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  assessmentName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  deviationText: {
    fontSize: 12,
  },
  detailedRow: {
    gap: 8,
    paddingVertical: 8,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceBarContainer: {
    marginVertical: 4,
  },
  balanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceBar: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
  },
  balanceIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -2,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  ratioText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  recommendationText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    marginTop: 8,
  },
});

export default BalanceIndicatorsCard;
