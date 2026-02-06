// src/ui/components/DayLog/DayLogIcon.tsx
// Icon component for Day Log access with optional text bubble prompt

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import {
  useShouldShowBubble,
  useCanAccessDayLog,
  useDayLogUI,
  showDayLogConfirmPrompt,
} from '@/src/lib/stores/dayLogStore';

export interface DayLogIconProps {
  /**
   * Called when user taps the icon
   */
  onPress?: () => void;
  /**
   * Size of the icon
   */
  size?: number;
  /**
   * Whether to show the bubble (override auto-detection)
   */
  showBubble?: boolean;
}

/**
 * DayLogIcon - Small icon with optional text bubble
 *
 * Placed in the top right of workout screen.
 * Shows "Log your physical/mental?" text bubble on first workout load.
 */
export function DayLogIcon({
  onPress,
  size = 24,
  showBubble: showBubbleOverride,
}: DayLogIconProps) {
  const colors = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const ui = useDayLogUI();
  const shouldShowBubbleAuto = useShouldShowBubble();
  const canAccess = useCanAccessDayLog();

  // Animation for the bubble
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.8)).current;

  // Determine if bubble should be shown
  const showBubble = showBubbleOverride ?? shouldShowBubbleAuto;

  // Animate bubble in/out
  useEffect(() => {
    if (showBubble) {
      // Delay slightly so user notices it appearing
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(bubbleOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(bubbleScale, {
            toValue: 1,
            tension: 300,
            friction: 20,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

      return () => clearTimeout(timeout);
    } else {
      Animated.parallel([
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleScale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showBubble, bubbleOpacity, bubbleScale]);

  const handlePress = () => {
    if (!canAccess) return;

    if (onPress) {
      onPress();
    } else {
      // Default behavior: show confirmation prompt
      showDayLogConfirmPrompt();
    }
  };

  // Don't render if not in a workout session
  if (!ui.currentSessionId) {
    return null;
  }

  // Dim the icon if already logged this session
  const iconOpacity = ui.hasLoggedThisSession ? 0.4 : 1;
  const iconColor = ui.hasLoggedThisSession
    ? colors.muted
    : showBubble
    ? ds.tone.accent
    : colors.text;

  return (
    <View style={styles.container}>
      {/* Icon Button */}
      <Pressable
        onPress={handlePress}
        disabled={ui.hasLoggedThisSession}
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor: pressed ? `${colors.primary}15` : 'transparent',
            opacity: pressed ? 0.7 : iconOpacity,
          },
        ]}
        hitSlop={12}
      >
        <Ionicons
          name="clipboard-outline"
          size={size}
          color={iconColor}
        />
        {/* Dot indicator when logged */}
        {ui.hasLoggedThisSession && (
          <View
            style={[
              styles.checkIndicator,
              { backgroundColor: ds.tone.success },
            ]}
          >
            <Ionicons name="checkmark" size={8} color="#000" />
          </View>
        )}
      </Pressable>

      {/* Text Bubble - positioned below the icon */}
      {showBubble && (
        <Animated.View
          style={[
            styles.bubble,
            {
              backgroundColor: ds.tone.card,
              borderColor: ds.tone.accent,
              opacity: bubbleOpacity,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          <View
            style={[styles.bubbleArrow, { borderBottomColor: ds.tone.card }]}
          />
          <Text style={[styles.bubbleText, { color: colors.text }]}>
            Log your physical/mental?
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 100,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  bubble: {
    position: 'absolute',
    top: '100%',
    right: -8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 160,
    zIndex: 1000,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  bubbleArrow: {
    position: 'absolute',
    top: -8,
    right: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // Arrow points up (no rotation needed now)
  },
  checkIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DayLogIcon;
