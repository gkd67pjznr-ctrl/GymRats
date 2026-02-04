/**
 * Gym Lab Screen - Main analytics dashboard
 * Contains: Body Map, Analytics, and Gym DNA tabs
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useForgeLab, useIsPremiumUser } from '@/src/lib/forgeLab/useForgeLab';
import { makeDesignSystem } from '@/src/ui/designSystem';
import WeightGraphCard from './WeightGraphCard';
import StrengthCurveCard from './StrengthCurveCard';
import VolumeTrendCard from './VolumeTrendCard';
import MuscleBalanceCard from './MuscleBalanceCard';
import RankProgressionCard from './RankProgressionCard';
import IntegrationDataCard from './IntegrationDataCard';
import PremiumLockOverlay from './PremiumLockOverlay';
import { BodyModelCard } from './BodyModelCard';
import { GymDNACard } from './GymDNACard';

type SubTab = 'body' | 'analytics' | 'dna';

const ForgeLabScreen: React.FC = () => {
  const { colors } = useTheme();
  const ds = makeDesignSystem('dark', 'toxic');
  const { data, loading, error, dateRange, setDateRange, refreshData } = useForgeLab();
  const isPremium = useIsPremiumUser();

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('body');

  // Date range options
  const dateRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: ds.tone.bg }]}>
        <Text style={[styles.loadingText, { color: ds.tone.text }]}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: ds.tone.bg }]}>
        <Text style={[styles.errorText, { color: ds.tone.text }]}>Error: {error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: ds.tone.accent }]}
          onPress={refreshData}
        >
          <Text style={[styles.buttonText, { color: ds.tone.bg }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sub-tab toggle component
  const SubTabToggle = ({ label, tab }: { label: string; tab: SubTab }) => (
    <Pressable
      onPress={() => setActiveSubTab(tab)}
      style={[
        styles.subTabButton,
        {
          backgroundColor: activeSubTab === tab ? ds.tone.accent : 'transparent',
          borderColor: activeSubTab === tab ? ds.tone.accent : ds.tone.border,
        },
      ]}
    >
      <Text
        style={[
          styles.subTabLabel,
          {
            color: activeSubTab === tab ? ds.tone.bg : ds.tone.text,
            fontWeight: activeSubTab === tab ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: ds.tone.bg }]}>
      {/* Sub-tab toggle */}
      <View style={[styles.subTabRow, { borderBottomColor: ds.tone.border }]}>
        <SubTabToggle label="Body Map" tab="body" />
        <SubTabToggle label="Analytics" tab="analytics" />
        <SubTabToggle label="DNA" tab="dna" />
      </View>

      {activeSubTab === 'dna' ? (
        // Gym DNA sub-tab
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <GymDNACard />
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : activeSubTab === 'body' ? (
        // Body Model sub-tab
        <BodyModelCard fullScreen />
      ) : (
        // Analytics sub-tab
        <>
          {/* Date Range Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateRangeContainer}
            contentContainerStyle={styles.dateRangeContent}
          >
            {dateRanges.map(range => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.dateRangeButton,
                  {
                    backgroundColor: dateRange === range ? ds.tone.accent : ds.tone.card,
                    borderColor: ds.tone.accent,
                  },
                  dateRange === range && styles.dateRangeButtonSelected
                ]}
                onPress={() => setDateRange(range as any)}
              >
                <Text
                  style={[
                    styles.dateRangeText,
                    {
                      color: dateRange === range ? ds.tone.bg : ds.tone.text
                    }
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Weight Graph (Free) */}
            <WeightGraphCard
              data={data?.weightHistory || []}
              isLoading={loading}
            />

            {/* Strength Curves (Premium) */}
            <View style={styles.cardContainer}>
              <StrengthCurveCard
                exercises={data?.exerciseStats || []}
                selectedExercise={selectedExercise}
                onSelectExercise={setSelectedExercise}
                isLoading={loading}
              />
              {!isPremium && <PremiumLockOverlay featureName="Strength Curves" />}
            </View>

            {/* Volume Trends (Premium) */}
            <View style={styles.cardContainer}>
              <VolumeTrendCard
                exercises={data?.exerciseStats || []}
                isLoading={loading}
              />
              {!isPremium && <PremiumLockOverlay featureName="Volume Trends" />}
            </View>

            {/* Muscle Group Balance (Premium) */}
            <View style={styles.cardContainer}>
              <MuscleBalanceCard
                data={data?.muscleGroupVolume || []}
                isLoading={loading}
              />
              {!isPremium && <PremiumLockOverlay featureName="Muscle Balance" />}
            </View>

            {/* Rank Progression (Premium) */}
            <View style={styles.cardContainer}>
              <RankProgressionCard
                exercises={data?.exerciseStats || []}
                isLoading={loading}
              />
              {!isPremium && <PremiumLockOverlay featureName="Rank Progression" />}
            </View>

            {/* Integration Data (Premium) */}
            <View style={styles.cardContainer}>
              <IntegrationDataCard
                data={data?.integrationData}
                isLoading={loading}
              />
              {!isPremium && <PremiumLockOverlay featureName="Integration Data" />}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  subTabLabel: {
    fontSize: 14,
  },
  dateRangeContainer: {
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  dateRangeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  dateRangeButtonSelected: {
    borderWidth: 2,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  retryButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgeLabScreen;