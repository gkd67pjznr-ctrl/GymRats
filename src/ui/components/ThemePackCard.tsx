/**
 * ThemePackCard - Display card for a theme pack
 *
 * Shows pack preview with colors, name, tier badge, and purchase/equip button.
 */

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/ui/theme';
import { FR } from '@/src/ui/GrStyle';
import type { ThemePack } from '@/src/lib/themes/types';
import { useIsPackOwned, useThemePackStore } from '@/src/lib/themes';

interface ThemePackCardProps {
  pack: ThemePack;
  isEquipped: boolean;
  onEquip: () => void;
  onPurchase: () => Promise<boolean>;
}

export function ThemePackCard({
  pack,
  isEquipped,
  onEquip,
  onPurchase,
}: ThemePackCardProps) {
  const c = useThemeColors();
  const isOwned = useIsPackOwned(pack.id);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePress = async () => {
    if (isOwned) {
      onEquip();
    } else {
      setIsPurchasing(true);
      try {
        await onPurchase();
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  // Get gradient colors from pack
  const gradientColors = pack.colors.gradients?.hero ?? [
    pack.colors.primary,
    pack.colors.secondary ?? pack.colors.primary,
  ];

  // Tier badge config
  const tierConfig = {
    free: { label: 'FREE', color: '#22c55e', icon: 'gift-outline' as const },
    premium: { label: 'PREMIUM', color: '#a855f7', icon: 'star' as const },
    legendary: { label: 'LEGENDARY', color: '#f59e0b', icon: 'diamond' as const },
  };

  const tier = tierConfig[pack.tier];

  return (
    <Pressable
      onPress={handlePress}
      disabled={isPurchasing}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: c.card,
          borderColor: isEquipped ? pack.colors.primary : c.border,
          borderWidth: isEquipped ? 2 : 1,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Color Preview Gradient */}
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientPreview}
      >
        {/* Color swatches */}
        <View style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: pack.colors.primary }]} />
          <View style={[styles.swatch, { backgroundColor: pack.colors.secondary ?? pack.colors.accent }]} />
          <View style={[styles.swatch, { backgroundColor: pack.colors.accent }]} />
        </View>
      </LinearGradient>

      {/* Pack Info */}
      <View style={styles.info}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {pack.name}
          </Text>
          {isEquipped && (
            <View style={[styles.equippedBadge, { backgroundColor: pack.colors.primary }]}>
              <Ionicons name="checkmark" size={12} color={pack.colors.background} />
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: c.muted }]} numberOfLines={2}>
          {pack.description}
        </Text>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          {/* Tier Badge */}
          <View style={[styles.tierBadge, { backgroundColor: `${tier.color}20` }]}>
            <Ionicons name={tier.icon} size={12} color={tier.color} />
            <Text style={[styles.tierText, { color: tier.color }]}>
              {tier.label}
            </Text>
          </View>

          {/* Action Button */}
          {isPurchasing ? (
            <ActivityIndicator size="small" color={c.primary} />
          ) : isOwned ? (
            isEquipped ? (
              <Text style={[styles.equippedText, { color: pack.colors.primary }]}>
                Equipped
              </Text>
            ) : (
              <View style={[styles.equipButton, { backgroundColor: c.border }]}>
                <Text style={[styles.equipText, { color: c.text }]}>
                  Equip
                </Text>
              </View>
            )
          ) : (
            <View style={[styles.priceButton, { backgroundColor: tier.color }]}>
              <Text style={[styles.priceText, { color: '#000' }]}>
                ${pack.priceUsd?.toFixed(2) ?? '0.00'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Compact version for horizontal scroll
 */
export function ThemePackCardCompact({
  pack,
  isEquipped,
  onPress,
}: {
  pack: ThemePack;
  isEquipped: boolean;
  onPress: () => void;
}) {
  const c = useThemeColors();

  const gradientColors = pack.colors.gradients?.hero ?? [
    pack.colors.primary,
    pack.colors.secondary ?? pack.colors.primary,
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.compactContainer,
        {
          backgroundColor: c.card,
          borderColor: isEquipped ? pack.colors.primary : c.border,
          borderWidth: isEquipped ? 2 : 1,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.compactGradient}
      />
      <Text style={[styles.compactName, { color: c.text }]} numberOfLines={1}>
        {pack.name}
      </Text>
      {isEquipped && (
        <View style={[styles.compactEquipped, { backgroundColor: pack.colors.primary }]}>
          <Ionicons name="checkmark" size={10} color={pack.colors.background} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: FR.radius.card,
    overflow: 'hidden',
    marginBottom: FR.space.x3,
  },
  gradientPreview: {
    height: 80,
    justifyContent: 'flex-end',
    padding: FR.space.x3,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  info: {
    padding: FR.space.x4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: FR.space.x1,
  },
  name: {
    ...FR.type.h3,
    fontWeight: '700',
    flex: 1,
  },
  equippedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: FR.space.x2,
  },
  description: {
    ...FR.type.caption,
    marginBottom: FR.space.x3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: FR.space.x2,
    paddingVertical: 4,
    borderRadius: FR.radius.pill,
    gap: 4,
  },
  tierText: {
    ...FR.type.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  equippedText: {
    ...FR.type.caption,
    fontWeight: '700',
  },
  equipButton: {
    paddingHorizontal: FR.space.x3,
    paddingVertical: FR.space.x2,
    borderRadius: FR.radius.soft,
  },
  equipText: {
    ...FR.type.caption,
    fontWeight: '700',
  },
  priceButton: {
    paddingHorizontal: FR.space.x3,
    paddingVertical: FR.space.x2,
    borderRadius: FR.radius.soft,
  },
  priceText: {
    ...FR.type.caption,
    fontWeight: '700',
  },
  // Compact styles
  compactContainer: {
    width: 100,
    borderRadius: FR.radius.soft,
    overflow: 'hidden',
    marginRight: FR.space.x2,
  },
  compactGradient: {
    height: 60,
  },
  compactName: {
    ...FR.type.caption,
    fontWeight: '600',
    padding: FR.space.x2,
    textAlign: 'center',
  },
  compactEquipped: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
