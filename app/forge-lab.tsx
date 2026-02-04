/**
 * Gym Lab Screen Route
 * Analytics hub with Body Map, Analytics, and Gym DNA
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import ForgeLabScreen from '@/src/ui/components/ForgeLab/ForgeLabScreen';

const GymLabRoute: React.FC = () => {
  const ds = makeDesignSystem('dark', 'toxic');

  return (
    <View style={[styles.container, { backgroundColor: ds.tone.bg }]}>
      <ForgeLabScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GymLabRoute;