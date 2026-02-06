// src/ui/components/DayLog/DayLogPrompt.tsx
// Yes/No confirmation prompt for Day Log

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import {
  useDayLogUI,
  dismissDayLogPrompt,
  showDayLogForm,
} from '@/src/lib/stores/dayLogStore';

export interface DayLogPromptProps {
  /**
   * Override visibility (for controlled usage)
   */
  visible?: boolean;
  /**
   * Called when user taps "Yes"
   */
  onYes?: () => void;
  /**
   * Called when user taps "No"
   */
  onNo?: () => void;
}

/**
 * DayLogPrompt - Small yes/no confirmation box
 *
 * - If "No" -> Remove text bubble, don't prompt again this session
 * - If "Yes" -> Show full Day Log form
 */
export function DayLogPrompt({
  visible: visibleOverride,
  onYes,
  onNo,
}: DayLogPromptProps) {
  const colors = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const ui = useDayLogUI();

  // Use override or store state
  const isVisible = visibleOverride ?? ui.confirmPromptVisible;

  const handleYes = () => {
    if (onYes) {
      onYes();
    } else {
      showDayLogForm();
    }
  };

  const handleNo = () => {
    if (onNo) {
      onNo();
    } else {
      dismissDayLogPrompt();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleNo}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleNo}
      >
        <Pressable
          style={[
            styles.promptBox,
            {
              backgroundColor: ds.tone.card,
              borderColor: ds.tone.border,
            },
          ]}
          // Prevent tap-through
          onPress={() => {}}
        >
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Pre-Workout Check-In
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.muted }]}>
            Track how you&apos;re feeling to get performance insights
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {/* No Button */}
            <Pressable
              onPress={handleNo}
              style={({ pressed }) => [
                styles.button,
                styles.noButton,
                {
                  backgroundColor: pressed ? colors.border : 'transparent',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.muted }]}>
                Skip
              </Text>
            </Pressable>

            {/* Yes Button */}
            <Pressable
              onPress={handleYes}
              style={({ pressed }) => [
                styles.button,
                styles.yesButton,
                {
                  backgroundColor: pressed
                    ? `${ds.tone.accent}CC`
                    : ds.tone.accent,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: ds.tone.bg }]}>
                Log State
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  promptBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noButton: {
    borderWidth: 1,
  },
  yesButton: {
    // Filled style
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DayLogPrompt;
