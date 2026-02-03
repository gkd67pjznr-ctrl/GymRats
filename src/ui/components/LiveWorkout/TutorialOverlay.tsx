/**
 * TutorialOverlay - Guided tutorial for first workout experience
 * Shows step-by-step instructions overlaying the live workout screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useOnboardingStore } from '@/src/lib/stores/onboardingStore';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { FR } from '@/src/ui/GrStyle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TutorialOverlayProps = {
  // Optional callback when tutorial is completed
  onComplete?: () => void;
  // Optional callback when tutorial is skipped
  onSkip?: () => void;
};

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Your First Workout!',
    description: "Let's log your first set. We'll guide you through the process.",
    targetElement: null, // No specific target for welcome
  },
  {
    title: 'Select an Exercise',
    description: 'Tap on any exercise card to select it, or tap "Add Exercise" to choose from the list.',
    targetElement: 'exercise-blocks', // Targets ExerciseBlocksCard
  },
  {
    title: 'Enter Weight and Reps',
    description: 'Use the number pad or buttons to enter your weight and reps. Tap "Add Set" when ready.',
    targetElement: 'quick-add', // Targets QuickAddSetCard
  },
  {
    title: 'You\'re All Set!',
    description: 'Great job! You can continue adding sets or finish your workout.',
    targetElement: 'workout-actions', // Targets WorkoutActions
  },
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onSkip }) => {
  const ds = makeDesignSystem('dark', 'toxic');
  const { tutorialStep, tutorialCompleted, advanceTutorialStep, completeTutorial } = useOnboardingStore();

  // Don't render if tutorial is already completed
  if (tutorialCompleted) {
    return null;
  }

  // Guard against out-of-bounds tutorial step
  const safeTutorialStep = Math.min(tutorialStep, TUTORIAL_STEPS.length - 1);
  const currentStep = TUTORIAL_STEPS[safeTutorialStep];

  const handleNext = () => {
    if (safeTutorialStep < TUTORIAL_STEPS.length - 1) {
      advanceTutorialStep();
    } else {
      completeTutorial();
      onComplete?.();
    }
  };

  const handleSkip = () => {
    completeTutorial();
    onSkip?.();
  };

  return (
    <View style={styles.container}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />

      {/* Tooltip positioned based on target element */}
      <View style={styles.tooltipContainer}>
        <View style={[styles.tooltip, { backgroundColor: ds.tone.card, borderColor: ds.tone.accent }]}>
          <Text style={[styles.tooltipTitle, { color: ds.tone.text }]}>
            {currentStep.title}
          </Text>
          <Text style={[styles.tooltipDescription, { color: ds.tone.textSecondary }]}>
            {currentStep.description}
          </Text>

          <View style={styles.tooltipActions}>
            {safeTutorialStep > 0 && (
              <TouchableOpacity
                style={[styles.tooltipButton, styles.secondaryButton, { borderColor: ds.tone.border }]}
                onPress={() => {
                  // Go back - would need a goBack action in store, skip for now
                  // For simplicity, just skip
                  handleSkip();
                }}
              >
                <Text style={[styles.tooltipButtonText, { color: ds.tone.textSecondary }]}>
                  Skip
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.tooltipButton, styles.primaryButton, { backgroundColor: ds.tone.accent }]}
              onPress={handleNext}
            >
              <Text style={[styles.tooltipButtonText, { color: ds.tone.bg }]}>
                {safeTutorialStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Got it!'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= safeTutorialStep ? ds.tone.accent : ds.tone.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Arrow indicator - would be positioned dynamically based on targetElement */}
        <View style={[styles.arrow, { borderTopColor: ds.tone.card }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tooltip: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    width: '100%',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  tooltipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  tooltipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});

export default TutorialOverlay;