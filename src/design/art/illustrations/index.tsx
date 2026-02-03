/**
 * Illustrations - Unified Export
 *
 * Empty state and decorative illustrations.
 * These are placeholder exports - actual SVG illustrations to be added.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IllustrationProps } from '../types';
import { colors } from '../../tokens/primitives';
import { text } from '../../tokens/semantic';

// =============================================================================
// PLACEHOLDER ILLUSTRATIONS
// =============================================================================

/**
 * Empty workouts illustration
 * TODO: Replace with actual SVG illustration
 */
export function NoWorkoutsIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.toxic.primary,
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>🏋️</Text>
        <Text style={styles.label}>No Workouts Yet</Text>
      </View>
    </View>
  );
}

/**
 * No history illustration
 */
export function NoHistoryIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.toxic.primary,
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>📊</Text>
        <Text style={styles.label}>No History</Text>
      </View>
    </View>
  );
}

/**
 * No friends illustration
 */
export function NoFriendsIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.toxic.primary,
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>👥</Text>
        <Text style={styles.label}>No Friends Added</Text>
      </View>
    </View>
  );
}

/**
 * No routines illustration
 */
export function NoRoutinesIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.toxic.primary,
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>📋</Text>
        <Text style={styles.label}>No Routines</Text>
      </View>
    </View>
  );
}

/**
 * No results illustration
 */
export function NoResultsIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.toxic.primary,
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>🔍</Text>
        <Text style={styles.label}>No Results</Text>
      </View>
    </View>
  );
}

/**
 * Connection error illustration
 */
export function ConnectionErrorIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.red[500],
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>📡</Text>
        <Text style={styles.label}>Connection Error</Text>
      </View>
    </View>
  );
}

/**
 * Success illustration
 */
export function SuccessIllustration({
  width = 200,
  height = 200,
  primaryColor = colors.green[500],
  style,
}: IllustrationProps) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: primaryColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: primaryColor }]}>✓</Text>
        <Text style={styles.label}>Success!</Text>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    opacity: 0.5,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  label: {
    color: text.muted,
    fontSize: 14,
    textAlign: 'center',
  },
});
