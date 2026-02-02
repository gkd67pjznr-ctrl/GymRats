/**
 * TrophyCase Component
 * Displays earned milestones and progress toward locked milestones
 * Grouped by rarity tier with visual treatment
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../theme';
import type { MilestoneWithProgress } from '../../../lib/milestones/types';
import { RARITY_INFO } from '../../../lib/milestones/definitions';

interface TrophyCaseProps {
  milestones: MilestoneWithProgress[];
  onPressMilestone?: (milestone: MilestoneWithProgress) => void;
}

const screenWidth = Dimensions.get('window').width;

export function TrophyCase({ milestones, onPressMilestone }: TrophyCaseProps) {
  const c = useThemeColors();

  // Group by rarity
  const grouped = {
    common: milestones.filter(m => m.rarity === 'common'),
    rare: milestones.filter(m => m.rarity === 'rare'),
    epic: milestones.filter(m => m.rarity === 'epic'),
    legendary: milestones.filter(m => m.rarity === 'legendary'),
  };

  // Calculate stats
  const earnedCount = milestones.filter(m => m.isEarned).length;
  const totalCount = milestones.length;

  const RaritySection = ({
    rarity,
    milestones: rarityMilestones,
  }: {
    rarity: keyof typeof RARITY_INFO;
    milestones: MilestoneWithProgress[];
  }) => {
    if (rarityMilestones.length === 0) return null;

    const info = RARITY_INFO[rarity];

    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            color: info.color,
            fontSize: 16,
            fontWeight: '900',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {info.name} ({rarityMilestones.filter(m => m.isEarned).length}/{rarityMilestones.length})
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {rarityMilestones.map((milestone) => (
            <MilestoneBadge
              key={milestone.id}
              milestone={milestone}
              rarityInfo={info}
              onPress={() => onPressMilestone?.(milestone)}
            />
          ))}
        </View>
      </View>
    );
  };

  const MilestoneBadge = ({
    milestone,
    rarityInfo,
    onPress,
  }: {
    milestone: MilestoneWithProgress;
    rarityInfo: (typeof RARITY_INFO)[keyof typeof RARITY_INFO];
    onPress: () => void;
  }) => {
    const size = 70;

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            width: size,
            height: size,
            borderRadius: 16,
            backgroundColor: milestone.isEarned ? c.card : c.card + '40',
            borderWidth: milestone.isEarned ? 2 : 1,
            borderColor: milestone.isEarned ? rarityInfo.color : c.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={{ fontSize: 28 }}>{milestone.icon}</Text>
        {!milestone.isEarned && milestone.progress > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: c.border,
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${milestone.progress}%`,
                backgroundColor: rarityInfo.color,
              }}
            />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: c.text, fontSize: 20, fontWeight: '900' }}>
          Milestones
        </Text>
        <Text style={{ color: c.muted, fontSize: 14 }}>
          {earnedCount}/{totalCount} earned
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {(Object.keys(grouped) as (keyof typeof grouped)[]).map((rarity) => (
          <RaritySection key={rarity} rarity={rarity} milestones={grouped[rarity]} />
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Milestone Detail Modal
 * Shows full details when a milestone is tapped
 */
interface MilestoneDetailModalProps {
  milestone: MilestoneWithProgress | null;
  visible: boolean;
  onClose: () => void;
}

export function MilestoneDetailModal({ milestone, visible, onClose }: MilestoneDetailModalProps) {
  const c = useThemeColors();

  if (!milestone) return null;

  const rarityInfo = RARITY_INFO[milestone.rarity];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: c.card,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: rarityInfo.color,
            padding: 24,
            width: '100%',
            maxWidth: 360,
            gap: 16,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon and Rarity */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 64 }}>{milestone.icon}</Text>
            <Text
              style={{
                color: rarityInfo.color,
                fontSize: 14,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {rarityInfo.name}
            </Text>
          </View>

          {/* Name */}
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
            {milestone.name}
          </Text>

          {/* Description */}
          <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
            {milestone.description}
          </Text>

          {/* Progress */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }}>
              {milestone.isEarned ? 'Completed' : 'Progress'}
            </Text>
            {milestone.isEarned ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: rarityInfo.color, fontSize: 16, fontWeight: '900' }}>
                  ✓ EARNED
                </Text>
                {milestone.earnedAt && (
                  <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
                    {new Date(milestone.earnedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ) : (
              <View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: c.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${milestone.progress}%`,
                      backgroundColor: rarityInfo.color,
                    }}
                  />
                </View>
                <Text style={{ color: c.muted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  {milestone.currentValue} / {milestone.condition.threshold}
                </Text>
              </View>
            )}
          </View>

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
              <Text style={{ color: c.accent, fontSize: 18, fontWeight: '900' }}>
                {milestone.tokens} 🪙
              </Text>
            </View>
          )}

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: rarityInfo.color,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Compact Trophy Card for profile screen
 * Shows summary and links to full trophy case
 */
interface TrophyCardProps {
  earnedCount: number;
  totalCount: number;
  onShowFull: () => void;
}

export function TrophyCard({ earnedCount, totalCount, onShowFull }: TrophyCardProps) {
  const c = useThemeColors();

  const percent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <Pressable
      onPress={onShowFull}
      style={({ pressed }) => [
        {
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          padding: 14,
          backgroundColor: c.card,
          gap: 12,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>
          🏆 Milestones
        </Text>
        <Text style={{ color: c.muted, fontSize: 14 }}>
          {earnedCount}/{totalCount}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 6,
          backgroundColor: c.border,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: percent >= 100 ? '#4ECDC4' : '#F39C12',
          }}
        />
      </View>

      <Text style={{ color: c.muted, fontSize: 12, lineHeight: 16 }}>
        Lifetime achievements with tiered rarity. Tap to view your trophy case.
      </Text>
    </Pressable>
  );
}
