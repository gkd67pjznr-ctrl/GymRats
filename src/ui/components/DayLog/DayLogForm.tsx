// src/ui/components/DayLog/DayLogForm.tsx
// Quick-input form for Day Log - appears as top-third overlay

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import {
  useDayLogUI,
  hideDayLogForm,
  addDayLog,
} from '@/src/lib/stores/dayLogStore';
import type {
  DayLogDraft,
  HydrationLevel,
  EnergyLevel,
  SleepQuality,
  NutritionStatus,
  CarbsLevel,
  PainLocation,
  MoodState,
} from '@/src/lib/dayLog/types';
import {
  DEFAULT_DAY_LOG_DRAFT,
  ALL_PAIN_LOCATIONS,
  PAIN_LOCATION_LABELS,
} from '@/src/lib/dayLog/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FORM_MAX_HEIGHT = SCREEN_HEIGHT * 0.45; // Top ~45% of screen

export interface DayLogFormProps {
  /**
   * Override visibility
   */
  visible?: boolean;
  /**
   * Called when form is submitted
   */
  onSubmit?: (draft: DayLogDraft) => void;
  /**
   * Called when form is cancelled
   */
  onCancel?: () => void;
  /**
   * Session ID to link the log to
   */
  sessionId?: string;
}

// Segmented control for scales
function SegmentedScale<T extends number | string>({
  values,
  selected,
  onSelect,
  labels,
  colors,
  ds,
}: {
  values: T[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  labels?: Record<T, string>;
  colors: ReturnType<typeof useThemeColors>;
  ds: ReturnType<typeof makeDesignSystem>;
}) {
  return (
    <View style={styles.segmentedRow}>
      {values.map((value) => {
        const isSelected = selected === value;
        const label = labels ? labels[value] : String(value);

        return (
          <Pressable
            key={String(value)}
            onPress={() => onSelect(value)}
            style={[
              styles.segment,
              {
                backgroundColor: isSelected ? ds.tone.accent : colors.card,
                borderColor: isSelected ? ds.tone.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: isSelected ? ds.tone.bg : colors.text },
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

// Section component
function FormSection({
  label,
  hint,
  colors,
  children,
}: {
  label: string;
  hint?: string;
  colors: ReturnType<typeof useThemeColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {label}
        </Text>
        {hint && (
          <Text style={[styles.sectionHint, { color: colors.muted }]}>
            {hint}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

/**
 * DayLogForm - Quick-input form appearing in top portion of screen
 *
 * Optimized for speed during workout:
 * - Uses segmented controls (not text input)
 * - Aches/pains: toggle reveals checkboxes
 * - Minimal required fields
 */
export function DayLogForm({
  visible: visibleOverride,
  onSubmit,
  onCancel,
  sessionId,
}: DayLogFormProps) {
  const colors = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const insets = useSafeAreaInsets();
  const ui = useDayLogUI();

  // Form state
  const [draft, setDraft] = useState<DayLogDraft>(DEFAULT_DAY_LOG_DRAFT);

  // Animation
  const slideAnim = useRef(new Animated.Value(-FORM_MAX_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Use override or store state
  const isVisible = visibleOverride ?? ui.formVisible;
  const currentSessionId = sessionId ?? ui.currentSessionId;

  // Animate in/out
  useEffect(() => {
    if (isVisible) {
      // Reset form when opening
      setDraft(DEFAULT_DAY_LOG_DRAFT);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 300,
          friction: 25,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -FORM_MAX_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, backdropOpacity]);

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
    if (onSubmit) {
      onSubmit(draft);
    } else if (currentSessionId) {
      addDayLog(draft, currentSessionId);
    }
    hideDayLogForm();
  }, [draft, currentSessionId, onSubmit]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      hideDayLogForm();
    }
  }, [onCancel]);

  // Labels
  const hydrationLabels: Record<HydrationLevel, string> = {
    1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  };

  const energyLabels: Record<EnergyLevel, string> = {
    1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  };

  const sleepLabels: Record<SleepQuality, string> = {
    1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  };

  const nutritionLabels: Record<NutritionStatus, string> = {
    none: 'Fasted',
    light: 'Light',
    moderate: 'Mod',
    full: 'Full',
  };

  const carbsLabels: Record<CarbsLevel, string> = {
    low: 'Low',
    moderate: 'Mod',
    high: 'High',
  };

  const moodLabels: Record<MoodState, string> = {
    stressed: 'Stressed',
    neutral: 'Neutral',
    focused: 'Focused',
    motivated: 'Fired Up',
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent backdrop (only covers bottom portion) */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity },
        ]}
        pointerEvents={isVisible ? 'auto' : 'none'}
      >
        <Pressable style={styles.backdropPressable} onPress={handleCancel} />
      </Animated.View>

      {/* Sliding form panel */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            backgroundColor: ds.tone.card,
            borderBottomColor: ds.tone.border,
            paddingTop: insets.top,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              How are you feeling?
            </Text>
          </View>
          <Pressable
            onPress={handleCancel}
            style={styles.closeButton}
            hitSlop={8}
          >
            <Ionicons name="close" size={24} color={colors.muted} />
          </Pressable>
        </View>

        {/* Scrollable Form */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hydration */}
          <FormSection
            label="Hydration"
            hint="1=dry, 5=well-hydrated"
            colors={colors}
          >
            <SegmentedScale<HydrationLevel>
              values={[1, 2, 3, 4, 5]}
              selected={draft.hydration}
              onSelect={(v) => updateDraft({ hydration: v })}
              labels={hydrationLabels}
              colors={colors}
              ds={ds}
            />
          </FormSection>

          {/* Energy */}
          <FormSection
            label="Energy"
            hint="1=tired, 5=energized"
            colors={colors}
          >
            <SegmentedScale<EnergyLevel>
              values={[1, 2, 3, 4, 5]}
              selected={draft.energyLevel}
              onSelect={(v) => updateDraft({ energyLevel: v })}
              labels={energyLabels}
              colors={colors}
              ds={ds}
            />
          </FormSection>

          {/* Sleep */}
          <FormSection
            label="Sleep Quality"
            hint="1=poor, 5=great"
            colors={colors}
          >
            <SegmentedScale<SleepQuality>
              values={[1, 2, 3, 4, 5]}
              selected={draft.sleepQuality}
              onSelect={(v) => updateDraft({ sleepQuality: v })}
              labels={sleepLabels}
              colors={colors}
              ds={ds}
            />
          </FormSection>

          {/* Nutrition */}
          <FormSection
            label="Nutrition"
            colors={colors}
          >
            <SegmentedScale<NutritionStatus>
              values={['none', 'light', 'moderate', 'full']}
              selected={draft.nutrition}
              onSelect={(v) => updateDraft({ nutrition: v })}
              labels={nutritionLabels}
              colors={colors}
              ds={ds}
            />
          </FormSection>

          {/* Carbs */}
          <FormSection
            label="Carbs"
            colors={colors}
          >
            <SegmentedScale<CarbsLevel>
              values={['low', 'moderate', 'high']}
              selected={draft.carbsLevel}
              onSelect={(v) => updateDraft({ carbsLevel: v })}
              labels={carbsLabels}
              colors={colors}
              ds={ds}
            />
          </FormSection>

          {/* Mood */}
          <FormSection
            label="Mood"
            colors={colors}
          >
            <SegmentedScale<MoodState>
              values={['stressed', 'neutral', 'focused', 'motivated']}
              selected={draft.mood}
              onSelect={(v) => updateDraft({ mood: v })}
              labels={moodLabels}
              colors={colors}
              ds={ds}
            />
          </FormSection>

          {/* Aches/Pains Toggle */}
          <FormSection
            label="Any aches or pain?"
            colors={colors}
          >
            <View style={styles.painToggleRow}>
              <Pressable
                onPress={() => updateDraft({ hasPain: false, painLocations: [] })}
                style={[
                  styles.painToggle,
                  {
                    backgroundColor: draft.hasPain === false ? ds.tone.accent : colors.card,
                    borderColor: draft.hasPain === false ? ds.tone.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.painToggleText,
                    { color: draft.hasPain === false ? ds.tone.bg : colors.text },
                  ]}
                >
                  None
                </Text>
              </Pressable>
              <Pressable
                onPress={() => updateDraft({ hasPain: true })}
                style={[
                  styles.painToggle,
                  {
                    backgroundColor: draft.hasPain === true ? ds.tone.accent : colors.card,
                    borderColor: draft.hasPain === true ? ds.tone.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.painToggleText,
                    { color: draft.hasPain === true ? ds.tone.bg : colors.text },
                  ]}
                >
                  Some
                </Text>
              </Pressable>
            </View>

            {/* Pain locations (only show if hasPain) */}
            {draft.hasPain && (
              <View style={styles.painLocations}>
                {ALL_PAIN_LOCATIONS.map((location) => {
                  const isSelected = draft.painLocations?.includes(location) ?? false;
                  return (
                    <Pressable
                      key={location}
                      onPress={() => togglePainLocation(location)}
                      style={[
                        styles.painChip,
                        {
                          backgroundColor: isSelected
                            ? `${ds.tone.accent}25`
                            : colors.bg,
                          borderColor: isSelected
                            ? ds.tone.accent
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.painChipText,
                          { color: isSelected ? ds.tone.accent : colors.text },
                        ]}
                      >
                        {PAIN_LOCATION_LABELS[location]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </FormSection>
        </ScrollView>

        {/* Footer with Save button */}
        <View style={[styles.footer, { borderTopColor: ds.tone.border }]}>
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: pressed ? `${ds.tone.accent}CC` : ds.tone.accent,
              },
            ]}
          >
            <Text style={[styles.saveButtonText, { color: ds.tone.bg }]}>
              Save & Continue
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropPressable: {
    flex: 1,
  },
  formContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: FORM_MAX_HEIGHT,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 11,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  painToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  painToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  painToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  painLocations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  painChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  painChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DayLogForm;
