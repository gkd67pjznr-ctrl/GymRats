// src/ui/components/DayLog/DayLogModal.tsx
// Quick-input modal for capturing pre-workout state

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type {
  DayLogDraft,
  HydrationLevel,
  EnergyLevel,
  SleepQuality,
  NutritionStatus,
  CarbsLevel,
  PainLocation,
} from '@/src/lib/dayLog/types';
import {
  DEFAULT_DAY_LOG_DRAFT,
  ALL_PAIN_LOCATIONS,
  PAIN_LOCATION_LABELS,
} from '@/src/lib/dayLog/types';

export interface DayLogModalProps {
  visible: boolean;
  onSubmit: (draft: DayLogDraft) => void;
  onSkip: () => void;
}

// Button row component for rating scales
function RatingButtonRow<T extends number | string>({
  values,
  selected,
  onSelect,
  labels,
  colors,
}: {
  values: T[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  labels?: Record<T, string>;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const ds = makeDesignSystem('dark', 'toxic');

  return (
    <View style={styles.buttonRow}>
      {values.map((value) => {
        const isSelected = selected === value;
        const label = labels ? labels[value] : String(value);

        return (
          <Pressable
            key={String(value)}
            onPress={() => onSelect(value)}
            style={[
              styles.ratingButton,
              {
                backgroundColor: isSelected ? ds.tone.accent : colors.card,
                borderColor: isSelected ? ds.tone.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.ratingButtonText,
                { color: isSelected ? colors.bg : colors.text },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Section header component
function SectionHeader({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  );
}

export const DayLogModal: React.FC<DayLogModalProps> = ({
  visible,
  onSubmit,
  onSkip,
}) => {
  const colors = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');

  // Form state
  const [draft, setDraft] = useState<DayLogDraft>(DEFAULT_DAY_LOG_DRAFT);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setDraft(DEFAULT_DAY_LOG_DRAFT);
    }
  }, [visible]);

  // Update handlers
  const updateDraft = useCallback((updates: Partial<DayLogDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const togglePainLocation = useCallback((location: PainLocation) => {
    setDraft((prev) => {
      const current = prev.painLocations || [];
      const updated = current.includes(location)
        ? current.filter((l) => l !== location)
        : [...current, location];
      return { ...prev, painLocations: updated };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(draft);
  }, [draft, onSubmit]);

  // Hydration labels with emoji
  const hydrationLabels: Record<HydrationLevel, string> = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
  };

  // Energy labels with emoji
  const energyLabels: Record<EnergyLevel, string> = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
  };

  // Sleep quality labels with emoji
  const sleepLabels: Record<SleepQuality, string> = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
  };

  // Nutrition labels
  const nutritionLabels: Record<NutritionStatus, string> = {
    none: 'None',
    light: 'Light',
    moderate: 'Moderate',
    full: 'Full',
  };

  // Carbs labels
  const carbsLabels: Record<CarbsLevel, string> = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onSkip}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Pre-Workout Check-In
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                How are you feeling today?
              </Text>
            </View>
            <TouchableOpacity onPress={onSkip} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.muted }]}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hydration */}
            <View style={styles.section}>
              <SectionHeader title="Hydration" colors={colors} />
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                1 = Dehydrated, 5 = Well Hydrated
              </Text>
              <RatingButtonRow<HydrationLevel>
                values={[1, 2, 3, 4, 5]}
                selected={draft.hydration}
                onSelect={(v) => updateDraft({ hydration: v })}
                labels={hydrationLabels}
                colors={colors}
              />
            </View>

            {/* Nutrition */}
            <View style={styles.section}>
              <SectionHeader title="Nutrition" colors={colors} />
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                How much have you eaten?
              </Text>
              <RatingButtonRow<NutritionStatus>
                values={['none', 'light', 'moderate', 'full']}
                selected={draft.nutrition}
                onSelect={(v) => updateDraft({ nutrition: v })}
                labels={nutritionLabels}
                colors={colors}
              />
            </View>

            {/* Carbs */}
            <View style={styles.section}>
              <SectionHeader title="Carbs" colors={colors} />
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                Carbohydrate intake today
              </Text>
              <RatingButtonRow<CarbsLevel>
                values={['low', 'moderate', 'high']}
                selected={draft.carbsLevel}
                onSelect={(v) => updateDraft({ carbsLevel: v })}
                labels={carbsLabels}
                colors={colors}
              />
            </View>

            {/* Energy */}
            <View style={styles.section}>
              <SectionHeader title="Energy Level" colors={colors} />
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                1 = Very Low, 5 = High Energy
              </Text>
              <RatingButtonRow<EnergyLevel>
                values={[1, 2, 3, 4, 5]}
                selected={draft.energyLevel}
                onSelect={(v) => updateDraft({ energyLevel: v })}
                labels={energyLabels}
                colors={colors}
              />
            </View>

            {/* Sleep */}
            <View style={styles.section}>
              <SectionHeader title="Sleep Quality" colors={colors} />
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                1 = Very Poor, 5 = Excellent
              </Text>
              <RatingButtonRow<SleepQuality>
                values={[1, 2, 3, 4, 5]}
                selected={draft.sleepQuality}
                onSelect={(v) => updateDraft({ sleepQuality: v })}
                labels={sleepLabels}
                colors={colors}
              />
            </View>

            {/* Pain */}
            <View style={styles.section}>
              <SectionHeader title="Any Pain or Discomfort?" colors={colors} />
              <View style={styles.painToggleRow}>
                <Pressable
                  onPress={() =>
                    updateDraft({ hasPain: false, painLocations: [] })
                  }
                  style={[
                    styles.painToggleButton,
                    {
                      backgroundColor:
                        draft.hasPain === false ? ds.tone.accent : colors.card,
                      borderColor:
                        draft.hasPain === false ? ds.tone.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.painToggleText,
                      {
                        color:
                          draft.hasPain === false ? colors.bg : colors.text,
                      },
                    ]}
                  >
                    No Pain
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => updateDraft({ hasPain: true })}
                  style={[
                    styles.painToggleButton,
                    {
                      backgroundColor:
                        draft.hasPain === true ? ds.tone.accent : colors.card,
                      borderColor:
                        draft.hasPain === true ? ds.tone.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.painToggleText,
                      {
                        color: draft.hasPain === true ? colors.bg : colors.text,
                      },
                    ]}
                  >
                    Some Pain
                  </Text>
                </Pressable>
              </View>

              {/* Pain locations (only show if hasPain is true) */}
              {draft.hasPain && (
                <View style={styles.painLocationsContainer}>
                  <Text
                    style={[styles.painLocationsLabel, { color: colors.muted }]}
                  >
                    Select affected areas:
                  </Text>
                  <View style={styles.painLocationsGrid}>
                    {ALL_PAIN_LOCATIONS.map((location) => {
                      const isSelected =
                        draft.painLocations?.includes(location) ?? false;
                      return (
                        <Pressable
                          key={location}
                          onPress={() => togglePainLocation(location)}
                          style={[
                            styles.painLocationChip,
                            {
                              backgroundColor: isSelected
                                ? `${ds.tone.accent}30`
                                : colors.bg,
                              borderColor: isSelected
                                ? ds.tone.accent
                                : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.painLocationText,
                              {
                                color: isSelected ? ds.tone.accent : colors.text,
                              },
                            ]}
                          >
                            {PAIN_LOCATION_LABELS[location]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <SectionHeader title="Notes (Optional)" colors={colors} />
              <TextInput
                value={draft.notes}
                onChangeText={(text) => updateDraft({ notes: text })}
                placeholder="Anything else to note?"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                style={[
                  styles.notesInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={onSkip}
              style={[
                styles.skipButton,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.skipButtonText, { color: colors.text }]}>
                Skip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: ds.tone.accent }]}
            >
              <Text style={[styles.submitButtonText, { color: colors.bg }]}>
                Save & Start
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  painToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  painToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  painToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  painLocationsContainer: {
    marginTop: 16,
  },
  painLocationsLabel: {
    fontSize: 12,
    marginBottom: 10,
  },
  painLocationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  painLocationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  painLocationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notesInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DayLogModal;
