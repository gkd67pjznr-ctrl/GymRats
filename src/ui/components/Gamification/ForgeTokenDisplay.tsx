/**
 * ForgeTokenDisplay Component
 *
 * Displays the user's Forge Token balance with gem icon.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

interface ForgeTokenDisplayProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: any;
}

const SIZE_CONFIG = {
  sm: { iconSize: 14, balanceFontSize: 14, labelFontSize: 9 },
  md: { iconSize: 20, balanceFontSize: 20, labelFontSize: 11 },
  lg: { iconSize: 28, balanceFontSize: 28, labelFontSize: 13 },
};

export function ForgeTokenDisplay({
  balance,
  size = 'md',
  showLabel = true,
  style,
}: ForgeTokenDisplayProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const config = SIZE_CONFIG[size];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={[styles.gemIcon, { fontSize: config.iconSize }]}>💎</Text>

        <Text
          style={[
            styles.balanceText,
            {
              fontSize: config.balanceFontSize,
              color: ds.tone.accent,
            },
          ]}
        >
          {balance.toLocaleString()}
        </Text>
      </View>

      {showLabel && (
        <Text
          style={[styles.label, { fontSize: config.labelFontSize, color: ds.tone.muted }]}
        >
          {balance === 1 ? 'Forge Token' : 'Forge Tokens'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gemIcon: {
    lineHeight: 24,
  },
  balanceText: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
});
