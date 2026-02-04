/**
 * Gym Lab Screen Route
 * Analytics hub with Body Map, Analytics, and Gym DNA
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import ForgeLabScreen from '@/src/ui/components/ForgeLab/ForgeLabScreen';

const GymLabRoute: React.FC = () => {
  const ds = makeDesignSystem('dark', 'toxic');

  return (
    <View style={[styles.container, { backgroundColor: ds.tone.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Gym Lab</Text>
      </View>
      <ForgeLabScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
});

export default GymLabRoute;