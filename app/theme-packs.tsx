/**
 * Theme Packs Screen
 *
 * Browse, preview, and purchase theme packs.
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeColors } from '@/src/ui/theme';
import { FR } from '@/src/ui/GrStyle';
import { ThemePackCard } from '@/src/ui/components/ThemePackCard';
import {
  useAvailablePacks,
  useEquippedPack,
  useThemePackStore,
  getFreePacks,
  getPremiumPacks,
  getLegendaryPacks,
} from '@/src/lib/themes';
import type { ThemePack } from '@/src/lib/themes/types';

export default function ThemePacksScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const availablePacks = useAvailablePacks();
  const equippedPack = useEquippedPack();
  const { equipPack, purchasePack, restorePurchases, fetchPacks, isLoading } = useThemePackStore();

  const [refreshing, setRefreshing] = useState(false);

  // Group packs by tier
  const freePacks = availablePacks.filter(p => p.tier === 'free');
  const premiumPacks = availablePacks.filter(p => p.tier === 'premium');
  const legendaryPacks = availablePacks.filter(p => p.tier === 'legendary');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPacks();
    setRefreshing(false);
  }, [fetchPacks]);

  const handleEquip = useCallback((packId: string) => {
    equipPack(packId);
  }, [equipPack]);

  const handlePurchase = useCallback(async (pack: ThemePack) => {
    try {
      const success = await purchasePack(pack.id);
      if (success) {
        Alert.alert(
          'Purchase Complete!',
          `${pack.name} is now yours. It has been automatically equipped.`,
          [{ text: 'Awesome!' }]
        );
        return true;
      } else {
        Alert.alert(
          'Purchase Failed',
          'The purchase could not be completed. Please try again.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      Alert.alert(
        'Purchase Error',
        'An error occurred during purchase. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }, [purchasePack]);

  const handleRestorePurchases = useCallback(async () => {
    try {
      await restorePurchases();
      Alert.alert(
        'Purchases Restored',
        'Any previous purchases have been restored.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Could not restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [restorePurchases]);

  const renderPackSection = (title: string, packs: ThemePack[], description?: string) => {
    if (packs.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.sectionDescription, { color: c.muted }]}>
            {description}
          </Text>
        )}
        {packs.map(pack => (
          <ThemePackCard
            key={pack.id}
            pack={pack}
            isEquipped={equippedPack?.id === pack.id}
            onEquip={() => handleEquip(pack.id)}
            onPurchase={() => handlePurchase(pack)}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Theme Packs',
          headerStyle: { backgroundColor: c.card },
          headerTintColor: c.text,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: c.bg }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={c.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>
            Transform Your Workout
          </Text>
          <Text style={[styles.subtitle, { color: c.muted }]}>
            Theme packs change colors, animations, particles, and celebration effects.
          </Text>
        </View>

        {/* Currently Equipped */}
        {equippedPack && (
          <View style={[styles.currentPack, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.currentLabel, { color: c.muted }]}>
              Currently Equipped
            </Text>
            <Text style={[styles.currentName, { color: equippedPack.colors.primary }]}>
              {equippedPack.name}
            </Text>
          </View>
        )}

        {/* Free Packs */}
        {renderPackSection(
          'Free Packs',
          freePacks,
          'Start with these — included with the app.'
        )}

        {/* Premium Packs */}
        {renderPackSection(
          'Premium Packs',
          premiumPacks,
          'Enhanced visuals and unique color schemes.'
        )}

        {/* Legendary Packs */}
        {renderPackSection(
          'Legendary Packs',
          legendaryPacks,
          'The ultimate experience — custom animations, particles, and effects.'
        )}

        {/* Restore Purchases */}
        <View style={styles.restoreSection}>
          <Text
            style={[styles.restoreText, { color: c.primary }]}
            onPress={handleRestorePurchases}
          >
            Restore Purchases
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: FR.space.x4,
    paddingBottom: FR.space.x8,
  },
  header: {
    marginBottom: FR.space.x6,
  },
  title: {
    ...FR.type.h1,
    fontWeight: '800',
    marginBottom: FR.space.x2,
  },
  subtitle: {
    ...FR.type.body,
  },
  currentPack: {
    padding: FR.space.x4,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    marginBottom: FR.space.x6,
    alignItems: 'center',
  },
  currentLabel: {
    ...FR.type.caption,
    marginBottom: FR.space.x1,
  },
  currentName: {
    ...FR.type.h2,
    fontWeight: '700',
  },
  section: {
    marginBottom: FR.space.x6,
  },
  sectionTitle: {
    ...FR.type.h2,
    fontWeight: '700',
    marginBottom: FR.space.x1,
  },
  sectionDescription: {
    ...FR.type.caption,
    marginBottom: FR.space.x3,
  },
  restoreSection: {
    alignItems: 'center',
    paddingVertical: FR.space.x4,
  },
  restoreText: {
    ...FR.type.body,
    fontWeight: '600',
  },
});
