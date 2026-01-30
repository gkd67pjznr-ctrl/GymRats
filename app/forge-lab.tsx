/**
 * Forge Lab Screen Route
 */
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import ForgeLabScreen from '@/src/ui/components/ForgeLab/ForgeLabScreen';

const ForgeLabRoute: React.FC = () => {
  const ds = makeDesignSystem('dark', 'toxic');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.tone.bg }]}>
      <ForgeLabScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ForgeLabRoute;