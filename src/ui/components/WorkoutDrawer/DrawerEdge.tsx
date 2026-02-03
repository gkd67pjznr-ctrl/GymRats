// src/ui/components/WorkoutDrawer/DrawerEdge.tsx
// Visual indicator shown when drawer is collapsed

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

import { useThemeColors } from '@/src/ui/theme';
import { useCurrentSession } from '@/src/lib/stores/currentSessionStore';

const EDGE_WIDTH = 24;

interface DrawerEdgeProps {
  isCollapsed: boolean;
  onPress: () => void;
}

/**
 * DrawerEdge Component
 *
 * A thin strip visible on the right edge of the screen when the workout
 * drawer is collapsed. Shows workout status and can be tapped to expand.
 *
 * Displays:
 * - Pulsing indicator dot
 * - Set count
 * - Chevron hint
 */
export function DrawerEdge({ isCollapsed, onPress }: DrawerEdgeProps) {
  const c = useThemeColors();
  const session = useCurrentSession();

  // Pulsing animation for the indicator dot
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1, // infinite
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Count completed sets
  const setCount = session?.sets?.length ?? 0;

  if (!isCollapsed) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: c.primary,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        },
      ]}
    >
      {/* Pulsing indicator */}
      <Animated.View style={[styles.pulse, pulseStyle]}>
        <View
          style={[
            styles.dot,
            { backgroundColor: '#fff' },
          ]}
        />
      </Animated.View>

      {/* Set count */}
      {setCount > 0 && (
        <Text style={styles.setCount}>{setCount}</Text>
      )}

      {/* Chevron hint */}
      <Ionicons
        name="chevron-back"
        size={16}
        color="#fff"
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -EDGE_WIDTH,
    top: '40%',
    width: EDGE_WIDTH,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pulse: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  setCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  chevron: {
    opacity: 0.7,
  },
});

export default DrawerEdge;
