// src/ui/components/GlobalTopBar/TopBarAvatar.tsx
// Avatar + Level badge composite for top bar

import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useUser } from '@/src/lib/stores/authStore';
import { useCurrentLevel } from '@/src/lib/stores/gamificationStore';

interface TopBarAvatarProps {
  onPress?: () => void;
}

/**
 * TopBarAvatar Component
 *
 * Displays user avatar (32px) with a level badge overlay.
 * Taps navigate to profile.
 */
export function TopBarAvatar({ onPress }: TopBarAvatarProps) {
  const router = useRouter();
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const user = useUser();
  const level = useCurrentLevel();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  // Avatar size for top bar
  const AVATAR_SIZE = 32;
  const BADGE_SIZE = 16;

  // Get tier color based on level
  const tierColor = getTierColor(level, ds);

  // Get initials for placeholder
  const initials = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {/* Avatar circle */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            backgroundColor: c.card,
            borderWidth: 2,
            borderColor: tierColor,
          },
        ]}
      >
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={[
              styles.avatarImage,
              {
                width: AVATAR_SIZE - 4,
                height: AVATAR_SIZE - 4,
                borderRadius: (AVATAR_SIZE - 4) / 2,
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                width: AVATAR_SIZE - 4,
                height: AVATAR_SIZE - 4,
                borderRadius: (AVATAR_SIZE - 4) / 2,
                backgroundColor: c.card2,
              },
            ]}
          >
            <Text style={[styles.initialsText, { color: c.text }]}>
              {initials}
            </Text>
          </View>
        )}

        {/* Level badge overlay (bottom-right) */}
        <View
          style={[
            styles.levelBadge,
            {
              width: BADGE_SIZE,
              height: BADGE_SIZE,
              borderRadius: BADGE_SIZE / 2,
              backgroundColor: tierColor,
              borderWidth: 1.5,
              borderColor: c.bg,
            },
          ]}
        >
          <Text style={styles.levelText}>{level}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Get tier color based on level
 */
function getTierColor(level: number, ds: ReturnType<typeof makeDesignSystem>): string {
  if (level <= 5) return ds.tone.iron;
  if (level <= 10) return ds.tone.bronze;
  if (level <= 15) return ds.tone.silver;
  if (level <= 20) return ds.tone.gold;
  if (level <= 30) return ds.tone.platinum;
  return ds.tone.mythic;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarImage: {
    // Positioned inside the border
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0A0A0D',
    letterSpacing: -0.2,
  },
});
