// src/ui/components/WorkoutReplay/ReplayControls.tsx
// Controls for workout replay screen

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeColors } from '../../../ui/theme';

interface ReplayControlsProps {
  onShare: () => void;
  onSkip: () => void;
}

export function ReplayControls({ onShare, onSkip }: ReplayControlsProps) {
  const c = useThemeColors();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onShare}
        style={({ pressed }) => [
          styles.button,
          styles.shareButton,
          { backgroundColor: '#4ECDC4' },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: '#000' }]}>Share to Feed</Text>
      </Pressable>

      <Pressable
        onPress={onSkip}
        style={({ pressed }) => [
          styles.button,
          styles.skipButton,
          { backgroundColor: c.card, borderColor: c.border },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: c.text }]}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  shareButton: {
    borderColor: 'transparent',
  },
  skipButton: {
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});