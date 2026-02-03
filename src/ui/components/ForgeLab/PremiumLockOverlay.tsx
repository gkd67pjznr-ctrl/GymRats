/**
 * Premium Lock Overlay - Blurs premium content and shows upgrade CTA
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

type PremiumLockOverlayProps = {
  featureName: string;
};

const PremiumLockOverlay: React.FC<PremiumLockOverlayProps> = ({ featureName }) => {
  const ds = makeDesignSystem('dark', 'toxic');

  return (
    <View style={styles.overlay}>
      <View style={styles.blurContainer}>
        {/* Simulated blur effect with semi-transparent overlay */}
        <View style={styles.blurEffect} />

        {/* Lock icon and upgrade message */}
        <View style={styles.content}>
          <Text style={[styles.lockIcon, { color: ds.tone.text }]}>🔒</Text>
          <Text style={[styles.title, { color: ds.tone.text }]}>
            Premium Feature
          </Text>
          <Text style={[styles.description, { color: ds.tone.textSecondary }]}>
            {featureName} is available with GymRats Pro
          </Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: ds.tone.accent }]}
            onPress={() => {
              // TODO: Navigate to subscription screen
            }}
          >
            <Text style={[styles.buttonText, { color: ds.tone.bg }]}>
              Upgrade to Pro
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumLockOverlay;