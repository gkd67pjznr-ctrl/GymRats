// src/ui/components/LiveWorkout/PRCelebration.tsx
// Full-screen PR celebration modal
//
// Shows animated celebration for personal records.
// Built to support future AI-generated images and animations.

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/src/ui/theme';
import { FR } from '@/src/ui/forgerankStyle';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type { SelectedCelebration } from '@/src/lib/celebration';
import { getAssetForKey, getPRTypeLabel, getTierLabel } from '@/src/lib/celebration';
import { playSound, SoundManager } from '@/src/lib/sound';
import { areSoundsEnabled, isAudioCueEnabled, areHapticsEnabled } from '@/src/lib/sound/soundUtils';

interface PRCelebrationProps {
  /** Celebration data (null = hidden) */
  celebration: SelectedCelebration | null;
  /** Called when user dismisses */
  onDismiss: () => void;
  /** Called when user taps share (optional) */
  onShare?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * PR Celebration Modal
 *
 * Full-screen overlay that celebrates personal records with:
 * - Animated entrance/exit
 * - Image/emoji display (AI-ready)
 * - Punchy text
 * - Sound effects
 * - Haptic feedback
 * - Share button
 */
export function PRCelebration({
  celebration,
  onDismiss,
  onShare,
}: PRCelebrationProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');

  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const translateY = useRef(new Animated.Value(100)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Track if we've played the celebration effects
  const effectsPlayedRef = useRef(false);

  // Show/hide modal
  useEffect(() => {
    if (celebration) {
      effectsPlayedRef.current = false;
      showModal();
    } else {
      hideModal();
    }
  }, [celebration]);

  // Play celebration effects (sound + haptics)
  useEffect(() => {
    if (celebration && !effectsPlayedRef.current) {
      effectsPlayedRef.current = true;
      playEffects(celebration);
    }
  }, [celebration]);

  const showModal = () => {
    // Reset animations
    opacity.setValue(0);
    scale.setValue(0.5);
    translateY.setValue(100);
    emojiScale.setValue(0);
    glowOpacity.setValue(0);

    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Emoji pop-in (staggered)
    Animated.timing(emojiScale, {
      toValue: 1,
      delay: 150,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playEffects = (celebration: SelectedCelebration) => {
    const { celebration: celeb } = celebration;

    // Play sound if PR celebration audio cue is enabled
    if (areSoundsEnabled() && isAudioCueEnabled('prCelebration')) {
      playSound(celeb.sound.key, celeb.sound.volume);
    }

    // Haptic feedback if global haptics are enabled
    if (areHapticsEnabled()) {
      const hapticType = celeb.haptic.type;
      const repeats = celeb.haptic.repeats ?? 1;

      const playHaptic = async () => {
        for (let i = 0; i < repeats; i++) {
          switch (hapticType) {
            case 'success':
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              break;
            case 'heavy':
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              break;
            case 'medium':
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              break;
            case 'light':
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
            default:
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          if (i < repeats - 1 && celeb.haptic.delayMs) {
            await new Promise((resolve) =>
              setTimeout(resolve, celeb.haptic.delayMs)
            );
          }
        }
      };

      playHaptic().catch(() => {});
    }
  };

  const handleDismiss = () => {
    hideModal();
    // Wait for exit animation before calling onDismiss
    setTimeout(() => onDismiss(), 200);
  };

  const handleShare = () => {
    hideModal();
    setTimeout(() => onShare?.(), 200);
  };

  if (!celebration) return null;

  const { celebration: celeb, headline, subheadline, detail } = celebration;
  const asset = getAssetForKey(celeb.contentKey);

  // Tier color (higher tier = more intense)
  const tierColor =
    celeb.tier === 4
      ? ds.tone.mythic
      : celeb.tier === 3
      ? ds.tone.diamond
      : celeb.tier === 2
      ? ds.tone.platinum
      : ds.tone.gold;

  // Pre-calculate colors
  const detailBoxBg = ds.tone.accent + '20';

  return (
    <Modal
      visible={!!celebration}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Background overlay */}
      <Animated.View style={[styles.overlay, { opacity }]}>

        {/* Glow effect behind emoji */}
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: tierColor,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                { scale },
                { translateY },
              ],
            },
          ]}
        >
          {/* PR type badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: tierColor,
                borderColor: c.border,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: c.card }]}>
              {getPRTypeLabel(celeb.prType as 'weight' | 'rep' | 'e1rm')}
            </Text>
          </View>

          {/* Emoji/Image display */}
          <Animated.View
            style={[
              styles.emojiContainer,
              {
                transform: [{ scale: emojiScale }],
              },
            ]}
          >
            {/* Fallback emoji for v1 */}
            <Text style={styles.emoji}>{asset.emoji}</Text>

            {/* Future: AI-generated image
            <Image
              source={{ uri: asset.uri }}
              style={[styles.image, { aspectRatio: asset.aspectRatio }]}
              resizeMode="contain"
            />
            */}
          </Animated.View>

          {/* Headline */}
          <Text style={[styles.headline, { color: c.text }]}>
            {headline}
          </Text>

          {/* Subheadline */}
          {subheadline && (
            <Text style={[styles.subheadline, { color: c.muted }]}>
              {subheadline}
            </Text>
          )}

          {/* Detail */}
          {detail && (
            <View style={[styles.detailBox, { backgroundColor: detailBoxBg }]}>
              <Text style={[styles.detail, { color: c.text }]}>
                {detail}
              </Text>
            </View>
          )}

          {/* Tier indicator */}
          <View style={styles.tierContainer}>
            <Text style={[styles.tierLabel, { color: c.muted }]}>Tier</Text>
            <Text style={[styles.tierValue, { color: tierColor }]}>
              {getTierLabel(celeb.tier)}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.shareButton,
                {
                  backgroundColor: ds.tone.accent,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleShare}
            >
              <Text style={[styles.buttonText, { color: c.card }]}>
                Share
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.dismissButton,
                {
                  backgroundColor: c.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleDismiss}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>
                Continue
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    // Note: blur effect not supported in React Native StyleSheet
    // Use shadow props or a blur view component if needed
  },
  content: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    padding: FR.space.x6,
    borderRadius: FR.radius.card,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: FR.space.x3,
    paddingVertical: 4,
    borderRadius: FR.radius.pill,
    borderWidth: 1,
    marginBottom: FR.space.x3,
  },
  badgeText: {
    ...FR.type.mono,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: undefined,
  },
  headline: {
    ...FR.type.h1,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subheadline: {
    ...FR.type.body,
    textAlign: 'center',
  },
  detailBox: {
    paddingHorizontal: FR.space.x4,
    paddingVertical: FR.space.x3,
    borderRadius: FR.radius.soft,
    marginTop: FR.space.x2,
  },
  detail: {
    ...FR.type.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: FR.space.x2,
  },
  tierLabel: {
    ...FR.type.mono,
    marginRight: FR.space.x2,
  },
  tierValue: {
    ...FR.type.h3,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: FR.space.x4,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: FR.space.x4,
    borderRadius: FR.radius.card,
    alignItems: 'center',
    marginHorizontal: FR.space.x1,
  },
  shareButton: {},
  dismissButton: {},
  buttonText: {
    ...FR.type.body,
    fontWeight: '700',
  },
});
