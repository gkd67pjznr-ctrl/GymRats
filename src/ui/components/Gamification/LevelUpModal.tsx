/**
 * LevelUpModal Component
 *
 * Full-screen celebration modal shown when a user levels up.
 * Features confetti animation, sound, haptic feedback, and token reward display.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type { LevelUpCelebration } from '@/src/lib/gamification/types';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  celebration: LevelUpCelebration | null;
  onDismiss: () => void;
}

export function LevelUpModal({ visible, celebration, onDismiss }: LevelUpModalProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible && celebration) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      slideAnim.setValue(50);

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ds.motion.fastMs,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: ds.motion.spring.tension,
          friction: ds.motion.spring.friction,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ds.motion.medMs,
          delay: ds.motion.fastMs,
          useNativeDriver: true,
        }),
      ]).start();

      // Fire confetti after a short delay
      if (confettiRef.current) {
        setTimeout(() => {
          confettiRef.current?.start();
        }, 200);
      }
    }
  }, [visible, celebration]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  if (!celebration) return null;

  const tierColor = getTierColor(celebration.level, ds);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 3 }}
          fadeOut
          autoStart={false}
          fallSpeed={3000}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Level Badge */}
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: tierColor, borderRadius: 80 },
            ]}
          >
            <Text style={[styles.levelNumber, { color: '#0A0A0D' }]}>
              {celebration.level}
            </Text>
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: ds.tone.accent }]}>
            {celebration.content.headline}
          </Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.subtitle,
              {
                color: ds.tone.text,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {celebration.content.subtitle}
          </Animated.Text>

          {/* Flavor Text */}
          <Animated.Text
            style={[
              styles.flavorText,
              {
                color: ds.tone.muted,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {celebration.content.flavorText}
          </Animated.Text>

          {/* Token Reward */}
          <Animated.View
            style={[
              styles.tokenReward,
              {
                backgroundColor: ds.tone.card2,
                borderColor: ds.tone.accent,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.tokenIcon}>💎</Text>
            <Text style={[styles.tokenAmount, { color: ds.tone.accent }]}>
              +{celebration.tokensAwarded}
            </Text>
            <Text style={[styles.tokenLabel, { color: ds.tone.muted }]}>
              Forge Tokens
            </Text>
          </Animated.View>

          {/* Dismiss Button */}
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              {
                backgroundColor: pressed
                  ? 'rgba(255, 255, 255, 0.1)'
                  : ds.tone.card2,
                borderColor: ds.tone.border,
              },
            ]}
          >
            <Text style={[styles.dismissText, { color: ds.tone.text }]}>
              Continue
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function getTierColor(level: number, ds: ReturnType<typeof makeDesignSystem>): string {
  if (level <= 5) return ds.tone.iron;
  if (level <= 10) return ds.tone.bronze;
  if (level <= 15) return ds.tone.silver;
  if (level <= 20) return ds.tone.gold;
  if (level <= 30) return ds.tone.platinum;
  return ds.tone.mythic;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 20,
    maxWidth: 360,
  },
  levelBadge: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  levelNumber: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
  },
  headline: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  flavorText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  tokenReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tokenIcon: {
    fontSize: 32,
  },
  tokenAmount: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  dismissButton: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});
