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

type IntegrationDataCardProps = {
  data?: IntegrationData;
  isLoading: boolean;
};

const IntegrationDataCard: React.FC<IntegrationDataCardProps> = ({ data, isLoading }) => {
  const ds = makeDesignSystem('dark', 'toxic');

  // Check which integrations are available
  const hasAppleHealth = data?.appleHealth && Object.keys(data.appleHealth).length > 0;
  const hasWhoop = data?.whoop && Object.keys(data.whoop).length > 0;
  const hasMfp = data?.mfp && Object.keys(data.mfp).length > 0;

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
            <Text style={[styles.insightsText, { color: ds.tone.textSecondary }]}>
              Correlation analysis will appear here when you have data from
              multiple sources.
            </Text>
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
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 14,
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