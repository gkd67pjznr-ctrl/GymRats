/**
 * Integration Data Card - Displays data from health/fitness integrations
 * Enhanced with real statistical correlation analysis
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { calculateCorrelation, getCorrelationStrength } from '@/src/lib/forgeLab/calculator';

type IntegrationData = {
  appleHealth?: { weight: number[]; sleep: number[] };
  whoop?: { recovery: number[]; strain: number[] };
  mfp?: { calories: number[]; protein: number[] };
};

type Insight = {
  title: string;
  description: string;
  strength: 'high' | 'medium' | 'low';
  trend?: 'up' | 'down' | 'neutral';
};

type CorrelationInsight = {
  metric1: string;
  metric2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  description: string;
  isPositive: boolean;
};

type IntegrationDataCardProps = {
  data?: IntegrationData;
  isLoading: boolean;
  workoutVolume?: number[]; // Weekly workout volume for correlation
  workoutPerformance?: number[]; // Daily e1RM or score data for correlation
  workoutFrequency?: number[]; // Weekly workout count for correlation
};

const IntegrationDataCard: React.FC<IntegrationDataCardProps> = ({
  data,
  isLoading,
  workoutVolume = [],
  workoutPerformance = [],
  workoutFrequency = []
}) => {
  const ds = makeDesignSystem('dark', 'toxic');

  // Check which integrations are available
  const hasAppleHealth = data?.appleHealth && Object.keys(data.appleHealth).length > 0;
  const hasWhoop = data?.whoop && Object.keys(data.whoop).length > 0;
  const hasMfp = data?.mfp && Object.keys(data.mfp).length > 0;
  const hasMultipleSources = [hasAppleHealth, hasWhoop, hasMfp].filter(Boolean).length >= 2;

  // Calculate real correlations
  const correlations = useMemo((): CorrelationInsight[] => {
    const results: CorrelationInsight[] = [];

    // Sleep vs Performance correlation
    if (data?.appleHealth?.sleep && workoutPerformance.length >= 3) {
      // Align data lengths
      const minLen = Math.min(data.appleHealth.sleep.length, workoutPerformance.length);
      const sleepData = data.appleHealth.sleep.slice(-minLen);
      const perfData = workoutPerformance.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(sleepData, perfData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Sleep',
            metric2: 'Performance',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `More sleep correlates with better performance (r=${r.toFixed(2)})`
              : `Unexpectedly, less sleep correlates with better performance (r=${r.toFixed(2)})`
          });
        }
      }
    }

    // Sleep vs Volume correlation
    if (data?.appleHealth?.sleep && workoutVolume.length >= 3) {
      const minLen = Math.min(data.appleHealth.sleep.length, workoutVolume.length);
      const sleepData = data.appleHealth.sleep.slice(-minLen);
      const volData = workoutVolume.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(sleepData, volData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Sleep',
            metric2: 'Volume',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `Better sleep supports higher training volume (r=${r.toFixed(2)})`
              : `You train harder when sleep-deprived - watch for overtraining (r=${r.toFixed(2)})`
          });
        }
      }
    }

    // Recovery vs Performance correlation (Whoop)
    if (data?.whoop?.recovery && workoutPerformance.length >= 3) {
      const minLen = Math.min(data.whoop.recovery.length, workoutPerformance.length);
      const recoveryData = data.whoop.recovery.slice(-minLen);
      const perfData = workoutPerformance.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(recoveryData, perfData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Recovery',
            metric2: 'Performance',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `Higher recovery scores lead to better lifts (r=${r.toFixed(2)})`
              : `Performance doesn't depend strongly on recovery score (r=${r.toFixed(2)})`
          });
        }
      }
    }

    // Strain vs Volume correlation (Whoop)
    if (data?.whoop?.strain && workoutVolume.length >= 3) {
      const minLen = Math.min(data.whoop.strain.length, workoutVolume.length);
      const strainData = data.whoop.strain.slice(-minLen);
      const volData = workoutVolume.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(strainData, volData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Strain',
            metric2: 'Volume',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `Whoop strain accurately tracks your training load (r=${r.toFixed(2)})`
              : `Strain may be influenced by non-lifting activities (r=${r.toFixed(2)})`
          });
        }
      }
    }

    // Calories vs Performance correlation (MFP)
    if (data?.mfp?.calories && workoutPerformance.length >= 3) {
      const minLen = Math.min(data.mfp.calories.length, workoutPerformance.length);
      const calData = data.mfp.calories.slice(-minLen);
      const perfData = workoutPerformance.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(calData, perfData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Calories',
            metric2: 'Performance',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `Eating more supports stronger performance (r=${r.toFixed(2)})`
              : `Your performance is stable across calorie ranges (r=${r.toFixed(2)})`
          });
        }
      }
    }

    // Protein vs Volume correlation (MFP)
    if (data?.mfp?.protein && workoutVolume.length >= 3) {
      const minLen = Math.min(data.mfp.protein.length, workoutVolume.length);
      const proteinData = data.mfp.protein.slice(-minLen);
      const volData = workoutVolume.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(proteinData, volData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Protein',
            metric2: 'Volume',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `Higher protein intake supports greater training volume (r=${r.toFixed(2)})`
              : `Volume doesn't strongly depend on protein intake (r=${r.toFixed(2)})`
          });
        }
      }
    }

    // Sleep vs Recovery cross-correlation
    if (data?.appleHealth?.sleep && data?.whoop?.recovery) {
      const minLen = Math.min(data.appleHealth.sleep.length, data.whoop.recovery.length);
      const sleepData = data.appleHealth.sleep.slice(-minLen);
      const recoveryData = data.whoop.recovery.slice(-minLen);

      if (minLen >= 3) {
        const r = calculateCorrelation(sleepData, recoveryData);
        const strength = getCorrelationStrength(r);

        if (strength !== 'none') {
          results.push({
            metric1: 'Sleep',
            metric2: 'Whoop Recovery',
            correlation: r,
            strength,
            isPositive: r >= 0,
            description: r >= 0
              ? `Sleep duration directly impacts your recovery score (r=${r.toFixed(2)})`
              : `Recovery is influenced by factors beyond sleep duration (r=${r.toFixed(2)})`
          });
        }
      }
    }

    return results;
  }, [data, workoutVolume, workoutPerformance, workoutFrequency]);

  // Generate insights based on available data
  const insights: Insight[] = useMemo(() => {
    const generatedInsights: Insight[] = [];

    // Sleep vs Volume correlation
    if (hasAppleHealth && data?.appleHealth?.sleep && workoutVolume.length > 0) {
      const avgSleep = data.appleHealth.sleep.reduce((a, b) => a + b, 0) / data.appleHealth.sleep.length;
      if (avgSleep > 0) {
        if (avgSleep >= 7) {
          generatedInsights.push({
            title: 'Sleep & Training',
            description: `Your avg sleep (${avgSleep.toFixed(1)}h) supports good recovery. Maintain this for consistent progress.`,
            strength: 'high',
            trend: 'neutral'
          });
        } else {
          generatedInsights.push({
            title: 'Sleep & Training',
            description: `Sleep is below optimal (${avgSleep.toFixed(1)}h). More rest may improve performance.`,
            strength: 'medium',
            trend: 'down'
          });
        }
      }
    }

    // Recovery insights from Whoop
    if (hasWhoop && data?.whoop?.recovery && data.whoop.recovery.length > 0) {
      const avgRecovery = data.whoop.recovery.reduce((a, b) => a + b, 0) / data.whoop.recovery.length;
      if (avgRecovery >= 80) {
        generatedInsights.push({
          title: 'Recovery Status',
          description: `Excellent recovery avg (${avgRecovery.toFixed(0)}%). Great condition for intense sessions.`,
          strength: 'high',
          trend: 'up'
        });
      } else if (avgRecovery >= 50) {
        generatedInsights.push({
          title: 'Recovery Status',
          description: `Moderate recovery (${avgRecovery.toFixed(0)}%). Consider deload if planning PR attempts.`,
          strength: 'medium',
          trend: 'neutral'
        });
      } else {
        generatedInsights.push({
          title: 'Recovery Status',
          description: `Low recovery (${avgRecovery.toFixed(0)}%). Focus on rest and nutrition before heavy lifting.`,
          strength: 'high',
          trend: 'down'
        });
      }
    }

    // Nutrition insights from MFP
    if (hasMfp && data?.mfp?.calories && data.mfp.calories.length > 0) {
      const avgCalories = data.mfp.calories.reduce((a, b) => a + b, 0) / data.mfp.calories.length;
      generatedInsights.push({
        title: 'Fueling Strategy',
        description: `Tracking ${avgCalories.toFixed(0)} kcal/day. Consistent nutrition supports strength gains.`,
        strength: 'medium',
        trend: 'neutral'
      });
    }

    return generatedInsights;
  }, [data, hasAppleHealth, hasWhoop, hasMfp, workoutVolume]);

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Integration Data</Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          Correlate your training with health metrics
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : data ? (
        <View style={styles.content}>
          {/* Apple Health Integration */}
          <View style={styles.integrationSection}>
            <View style={styles.integrationHeader}>
              <Text style={[styles.integrationTitle, { color: ds.tone.text }]}>
                Apple Health
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: hasAppleHealth ? '#4CAF50' : '#F44336'
                  }
                ]}
              />
            </View>

            {hasAppleHealth ? (
              <View style={styles.integrationData}>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: ds.tone.textSecondary }]}>
                    Weight Entries
                  </Text>
                  <Text style={[styles.dataValue, { color: ds.tone.text }]}>
                    {data.appleHealth?.weight?.length || 0}
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: ds.tone.textSecondary }]}>
                    Sleep Entries
                  </Text>
                  <Text style={[styles.dataValue, { color: ds.tone.text }]}>
                    {data.appleHealth?.sleep?.length || 0}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.noDataText, { color: ds.tone.textSecondary }]}>
                Not connected. Enable in Settings {'>'} Integrations.
              </Text>
            )}
          </View>

          {/* Whoop Integration */}
          <View style={styles.integrationSection}>
            <View style={styles.integrationHeader}>
              <Text style={[styles.integrationTitle, { color: ds.tone.text }]}>
                Whoop
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: hasWhoop ? '#4CAF50' : '#F44336'
                  }
                ]}
              />
            </View>

            {hasWhoop ? (
              <View style={styles.integrationData}>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: ds.tone.textSecondary }]}>
                    Recovery Readings
                  </Text>
                  <Text style={[styles.dataValue, { color: ds.tone.text }]}>
                    {data.whoop?.recovery?.length || 0}
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: ds.tone.textSecondary }]}>
                    Strain Readings
                  </Text>
                  <Text style={[styles.dataValue, { color: ds.tone.text }]}>
                    {data.whoop?.strain?.length || 0}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.noDataText, { color: ds.tone.textSecondary }]}>
                Not connected. Enable in Settings {'>'} Integrations.
              </Text>
            )}
          </View>

          {/* MyFitnessPal Integration */}
          <View style={styles.integrationSection}>
            <View style={styles.integrationHeader}>
              <Text style={[styles.integrationTitle, { color: ds.tone.text }]}>
                MyFitnessPal
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: hasMfp ? '#4CAF50' : '#F44336'
                  }
                ]}
              />
            </View>

            {hasMfp ? (
              <View style={styles.integrationData}>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: ds.tone.textSecondary }]}>
                    Calorie Entries
                  </Text>
                  <Text style={[styles.dataValue, { color: ds.tone.text }]}>
                    {data.mfp?.calories?.length || 0}
                  </Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: ds.tone.textSecondary }]}>
                    Protein Entries
                  </Text>
                  <Text style={[styles.dataValue, { color: ds.tone.text }]}>
                    {data.mfp?.protein?.length || 0}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.noDataText, { color: ds.tone.textSecondary }]}>
                Not connected. Enable in Settings {'>'} Integrations.
              </Text>
            )}
          </View>

          {/* Correlations Section */}
          {correlations.length > 0 && (
            <View style={styles.correlationsSection}>
              <Text style={[styles.insightsTitle, { color: ds.tone.text }]}>
                Statistical Correlations
              </Text>
              <Text style={[styles.correlationsSubtitle, { color: ds.tone.textSecondary }]}>
                How your metrics relate to each other
              </Text>

              <View style={styles.correlationsList}>
                {correlations.map((corr, index) => (
                  <View
                    key={index}
                    style={[
                      styles.correlationCard,
                      {
                        backgroundColor: ds.tone.bg,
                        borderColor: corr.strength === 'strong' ? ds.tone.accent :
                                    corr.strength === 'moderate' ? '#FFC107' : 'rgba(255,255,255,0.1)'
                      }
                    ]}
                  >
                    <View style={styles.correlationHeader}>
                      <View style={styles.correlationMetrics}>
                        <Text style={[styles.correlationMetric, { color: ds.tone.text }]}>
                          {corr.metric1}
                        </Text>
                        <Text style={[styles.correlationArrow, { color: ds.tone.textSecondary }]}>
                          ↔
                        </Text>
                        <Text style={[styles.correlationMetric, { color: ds.tone.text }]}>
                          {corr.metric2}
                        </Text>
                      </View>
                      <View style={[
                        styles.correlationBadge,
                        {
                          backgroundColor: corr.strength === 'strong' ? 'rgba(76,175,80,0.2)' :
                                          corr.strength === 'moderate' ? 'rgba(255,193,7,0.2)' :
                                          'rgba(158,158,158,0.2)'
                        }
                      ]}>
                        <Text style={[
                          styles.correlationStrength,
                          {
                            color: corr.strength === 'strong' ? '#4CAF50' :
                                   corr.strength === 'moderate' ? '#FFC107' : '#9E9E9E'
                          }
                        ]}>
                          {corr.strength}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.correlationValueRow}>
                      <Text style={[
                        styles.correlationValue,
                        { color: corr.isPositive ? '#4CAF50' : '#F44336' }
                      ]}>
                        r = {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                      </Text>
                      <Text style={[styles.correlationDirection, { color: ds.tone.textSecondary }]}>
                        {corr.isPositive ? '↑ Positive' : '↓ Negative'}
                      </Text>
                    </View>

                    <Text style={[styles.correlationDescription, { color: ds.tone.textSecondary }]}>
                      {corr.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Insights Section */}
          <View style={styles.insightsSection}>
            <Text style={[styles.insightsTitle, { color: ds.tone.text }]}>
              Insights
            </Text>

            {!hasMultipleSources && insights.length === 0 && correlations.length === 0 ? (
              <Text style={[styles.insightsText, { color: ds.tone.textSecondary }]}>
                Connect multiple data sources to unlock correlation insights.
              </Text>
            ) : insights.length > 0 ? (
              <View style={styles.insightsList}>
                {insights.map((insight, index) => (
                  <View
                    key={index}
                    style={[
                      styles.insightCard,
                      { backgroundColor: ds.tone.bg }
                    ]}
                  >
                    <View style={styles.insightHeader}>
                      <Text style={[styles.insightCardTitle, { color: ds.tone.text }]}>
                        {insight.title}
                      </Text>
                      <View
                        style={[
                          styles.strengthIndicator,
                          {
                            backgroundColor:
                              insight.strength === 'high' ? '#4CAF50' :
                              insight.strength === 'medium' ? '#FFC107' : '#9E9E9E'
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.insightCardDescription, { color: ds.tone.textSecondary }]}>
                      {insight.description}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.insightsText, { color: ds.tone.textSecondary }]}>
                Not enough data for insights yet. Keep tracking to unlock correlations.
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            No integration data available
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
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  integrationSection: {
    marginBottom: 20,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  integrationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  integrationData: {
    paddingLeft: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dataLabel: {
    fontSize: 16,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    paddingLeft: 10,
  },
  correlationsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  correlationsSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
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
    fontSize: 12,
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
  correlationDirection: {
    fontSize: 12,
  },
  correlationDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  insightsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightsText: {
    fontSize: 14,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  strengthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightCardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default IntegrationDataCard;