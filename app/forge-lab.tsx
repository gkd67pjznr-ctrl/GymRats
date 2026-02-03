/**
 * Forge Lab Screen Route
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { ScreenHeader } from '@/src/ui/components/ScreenHeader';
import ForgeLabScreen from '@/src/ui/components/ForgeLab/ForgeLabScreen';

const ForgeLabRoute: React.FC = () => {
  const ds = makeDesignSystem('dark', 'toxic');

  return (
    <View style={[styles.container, { backgroundColor: ds.tone.bg }]}>
      <ScreenHeader title="Forge Lab" />
      <ForgeLabScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ForgeLabRoute;