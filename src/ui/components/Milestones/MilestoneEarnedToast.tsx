/**
 * MilestoneEarnedToast Component
 * Animated celebration when a milestone is earned
 * Rarity-appropriate visuals and animations
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../theme';
import type { MilestoneCelebration } from '../../../lib/milestones/types';
import { RARITY_INFO } from '../../../lib/milestones/definitions';

interface MilestoneEarnedToastProps {
  celebration: MilestoneCelebration | null;
  onDismiss: () => void;
  onViewTrophyCase?: () => void;
}

const screenWidth = Dimensions.get('window').width;

export function MilestoneEarnedToast({
  celebration,
  onDismiss,
  onViewTrophyCase,
}: MilestoneEarnedToastProps) {
  const c = useThemeColors();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (celebration) {
      // Entrance animation: spring in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Pulse animation for legendary
      if (celebration.milestone.rarity === 'legendary') {
        const pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        pulseLoop.start();

        return () => pulseLoop.stop();
      }

      // Glow animation for epic and legendary
      if (celebration.milestone.rarity === 'epic' || celebration.milestone.rarity === 'legendary') {
        const glowLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        );
        glowLoop.start();

        return () => glowLoop.stop();
      }
    } else {
      // Reset animations when dismissed
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [celebration?.milestone.id]);

  if (!celebration) return null;

  const milestone = celebration.milestone;
  const rarityInfo = RARITY_INFO[milestone.rarity];

  // Background glow based on rarity
  const getGlowColor = () => {
    switch (milestone.rarity) {
      case 'common':
        return 'rgba(192, 192, 192, 0.3)';
      case 'rare':
        return 'rgba(155, 89, 182, 0.3)';
      case 'epic':
        return 'rgba(243, 156, 18, 0.3)';
      case 'legendary':
        return 'rgba(231, 76, 60, 0.3)';
    }
  };

  const getBorderColor = () => {
    return rarityInfo.color;
  };

  return (
    <Modal
      visible={celebration !== null}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        onPress={onDismiss}
      >
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              milestone.rarity === 'legendary' && { scale: pulseAnim },
            ].filter(Boolean) as any,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: c.card,
                borderRadius: 24,
                borderWidth: milestone.rarity === 'legendary' ? 3 : 2,
                borderColor: getBorderColor(),
                padding: 28,
                width: '100%',
                maxWidth: 340,
                gap: 20,
                shadowColor: getBorderColor(),
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 20,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Rarity Banner */}
            <View
              style={{
                backgroundColor: getGlowColor(),
                borderRadius: 12,
                padding: 8,
                alignItems: 'center',
              }}
            >
              <Animated.Text
                style={{
                  color: rarityInfo.color,
                  fontSize: 12,
                  fontWeight: '900',
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}
              >
                {rarityInfo.name} Milestone Unlocked!
              </Animated.Text>
            </View>

            {/* Icon with glow for epic/legendary */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              {(milestone.rarity === 'epic' || milestone.rarity === 'legendary') && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: rarityInfo.color,
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                  }}
                />
              )}
              <Text style={{ fontSize: 72 }}>{milestone.icon}</Text>
            </View>

            {/* Milestone Name */}
            <Text
              style={{
                color: c.text,
                fontSize: 24,
                fontWeight: '900',
                textAlign: 'center',
              }}
            >
              {milestone.name}
            </Text>

            {/* Description */}
            <Text
              style={{
                color: c.muted,
                fontSize: 14,
                lineHeight: 20,
                textAlign: 'center',
              }}
            >
              {milestone.description}
            </Text>

            {/* Token Reward */}
            {milestone.tokens && milestone.tokens > 0 && (
              <View
                style={{
                  backgroundColor: c.bg,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: c.muted, fontSize: 12 }}>Reward</Text>
                <Text style={{ color: c.accent, fontSize: 20, fontWeight: '900' }}>
                  +{milestone.tokens} 🪙
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 10, flexDirection: 'row' }}>
              <Pressable
                onPress={onDismiss}
                style={{
                  flex: 1,
                  backgroundColor: c.bg,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              >
                <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>Awesome!</Text>
              </Pressable>

              {onViewTrophyCase && (
                <Pressable
                  onPress={() => {
                    onDismiss();
                    onViewTrophyCase();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: rarityInfo.color,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: '700' }}>
                    View Trophy Case
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Legendary confetti effect (simplified as particles) */}
            {milestone.rarity === 'legendary' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5],
                      top: '50%',
                      left: '50%',
                      transform: [
                        {
                          translateX: Animated.divide(
                            Animated.multiply(
                              Animated.sin(new Animated.Value(i * 45).animate(new Date().getTime(), 0)),
                              150
                            ),
                            new Animated.Value(1)
                          ),
                        },
                        {
                          translateY: Animated.divide(
                            Animated.multiply(
                              Animated.cos(new Animated.Value(i * 45).animate(new Date().getTime(), 0)),
                              150
                            ),
                            new Animated.Value(1)
                          ),
                        },
                      ],
                    }}
                  />
                ))}
              </>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/**
 * Compact milestone notification (toast style)
 * For less intrusive milestone announcements
 */
interface CompactMilestoneToastProps {
  celebration: MilestoneCelebration | null;
  onDismiss: () => void;
  onPress?: () => void;
}

export function CompactMilestoneToast({
  celebration,
  onDismiss,
  onPress,
}: CompactMilestoneToastProps) {
  const c = useThemeColors();
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (celebration) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const autoDismiss = setTimeout(() => {
        onDismiss();
      }, 4000);

      return () => clearTimeout(autoDismiss);
    } else {
      slideAnim.setValue(-100);
    }
  }, [celebration?.milestone.id]);

  if (!celebration) return null;

  const milestone = celebration.milestone;
  const rarityInfo = RARITY_INFO[milestone.rarity];

  return (
    <Pressable onPress={onPress || onDismiss}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          right: 20,
          backgroundColor: c.card,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: rarityInfo.color,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: rarityInfo.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={{ fontSize: 36 }}>{milestone.icon}</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: rarityInfo.color,
              fontSize: 12,
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
          >
            {rarityInfo.name} Milestone!
          </Text>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: '900' }}>
            {milestone.name}
          </Text>
        </View>
        {milestone.tokens && milestone.tokens > 0 && (
          <Text style={{ fontSize: 16 }}>+{milestone.tokens}🪙</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}
