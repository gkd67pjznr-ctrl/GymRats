import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { makeDesignSystem } from "../designSystem";

export interface PresenceUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  currentExercise?: string;
  lastActivityTime?: number;
}

export interface PresenceIndicatorProps {
  users: PresenceUser[];
  maxVisible?: number;
}

export function PresenceIndicator(props: PresenceIndicatorProps) {
  const ds = makeDesignSystem("dark", "toxic");
  const { users, maxVisible = 5 } = props;

  // Show only active users, limited by maxVisible
  const visibleUsers = users.filter(user => user.isActive).slice(0, maxVisible);
  const additionalCount = users.filter(user => user.isActive).length - visibleUsers.length;

  if (visibleUsers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.indicatorsContainer}>
        {visibleUsers.map((user, index) => (
          <View key={user.id} style={[styles.userIndicator, {
            zIndex: visibleUsers.length - index,
            marginLeft: index === 0 ? 0 : -8
          }]}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, {
                backgroundColor: getAvatarColor(user.id, ds)
              }]}>
                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
              </View>
            )}
            {user.currentExercise && (
              <View style={styles.exerciseBadge}>
                <Text style={styles.exerciseText} numberOfLines={1} ellipsizeMode="tail">
                  {user.currentExercise}
                </Text>
              </View>
            )}
          </View>
        ))}

        {additionalCount > 0 && (
          <View style={[styles.userIndicator, styles.additionalIndicator, {
            marginLeft: -8
          }]}>
            <View style={styles.additionalAvatar}>
              <Text style={styles.additionalText}>+{additionalCount}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.label}>
        {visibleUsers.length} {visibleUsers.length === 1 ? 'person' : 'people'} working out
      </Text>
    </View>
  );
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(userId: string, ds: ReturnType<typeof makeDesignSystem>): string {
  // Generate a consistent color based on user ID
  const colors = [
    ds.tone.accent,
    ds.tone.accent2,
    ds.tone.success,
    ds.tone.warn,
    ds.tone.info,
    ds.tone.gold
  ];

  // Simple hash function to get consistent index
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIndicator: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0A0A0D',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0A0A0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },
  exerciseBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    right: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#111118',
  },
  exerciseText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  additionalIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#26263A',
    borderWidth: 2,
    borderColor: '#0A0A0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },
  label: {
    color: '#A9AEC7',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});