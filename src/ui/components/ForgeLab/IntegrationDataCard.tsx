/**
 * Integration Data Card - Displays data from health/fitness integrations
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

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

type IntegrationDataCardProps = {
  data?: IntegrationData;
  isLoading: boolean;
  workoutVolume?: number[]; // Optional: weekly workout volume for correlation
};

const IntegrationDataCard: React.FC<IntegrationDataCardProps> = ({
  data,
  isLoading,
  workoutVolume = []
}) => {
  const ds = makeDesignSystem('dark', 'toxic');

  // Check which integrations are available
  const hasAppleHealth = data?.appleHealth && Object.keys(data.appleHealth).length > 0;
  const hasWhoop = data?.whoop && Object.keys(data.whoop).length > 0;
  const hasMfp = data?.mfp && Object.keys(data.mfp).length > 0;
  const hasMultipleSources = [hasAppleHealth, hasWhoop, hasMfp].filter(Boolean).length >= 2;

  // Generate insights based on available data
  const insights: Insight[] = React.useMemo(() => {
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

    // Multi-source correlation insights
    if (hasAppleHealth && hasWhoop && data?.appleHealth?.sleep && data?.whoop?.recovery) {
      generatedInsights.push({
        title: 'Sleep Quality Impact',
        description: 'Cross-reference available: Analyzing how sleep quality affects your recovery scores.',
        strength: 'low',
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

          {/* Insights Section */}
          <View style={styles.insightsSection}>
            <Text style={[styles.insightsTitle, { color: ds.tone.text }]}>
              Insights
            </Text>

            {!hasMultipleSources && insights.length === 0 ? (
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