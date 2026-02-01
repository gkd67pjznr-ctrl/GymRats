// src/ui/components/Journal/JournalEntryCard.tsx
// Display component for journal entries

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { JournalEntry } from "@/src/lib/journalModel";
import { formatJournalDateShort } from "@/src/lib/journalModel";
import { MUSCLE_GROUPS } from "@/src/data/consolidatedMuscleGroups";

export interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress?: () => void;
  onEdit?: () => void;
  compact?: boolean;
  showDate?: boolean;
  showSessionLink?: boolean;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  onEdit,
  compact = false,
  showDate = true,
  showSessionLink = true,
}) => {
  const colors = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const handlePress = () => {
    if (onPress) onPress();
  };

  const handleEditPress = (e: any) => {
    e?.stopPropagation?.();
    if (onEdit) onEdit();
  };

  const getMuscleDisplayName = (muscleId: string) => {
    const muscle = MUSCLE_GROUPS.find((m) => m.id === muscleId);
    return muscle ? muscle.displayName : muscleId;
  };

  const renderRating = (value: number | undefined, label: string) => {
    if (value === undefined) return null;

    return (
      <View style={styles.ratingContainer}>
        <Text style={[styles.ratingLabel, { color: colors.muted }]}>
          {label}:
        </Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <View
              key={star}
              style={[
                styles.ratingStar,
                {
                  backgroundColor:
                    star <= value ? ds.tone.accent : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.ratingValue, { color: colors.text }]}>
          {value}/5
        </Text>
      </View>
    );
  };

  const renderSoreness = () => {
    if (!entry.soreness || entry.soreness.length === 0) return null;

    const displayNames = entry.soreness.map(getMuscleDisplayName);

    return (
      <View style={styles.sorenessContainer}>
        <Text style={[styles.sorenessLabel, { color: colors.muted }]}>
          Soreness:
        </Text>
        <View style={styles.sorenessChips}>
          {displayNames.slice(0, compact ? 2 : 3).map((name, index) => (
            <View
              key={index}
              style={[styles.sorenessChip, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sorenessChipText, { color: colors.text }]}>
                {name}
              </Text>
            </View>
          ))}
          {displayNames.length > (compact ? 2 : 3) && (
            <View
              style={[styles.sorenessChip, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sorenessChipText, { color: colors.muted }]}>
                +{displayNames.length - (compact ? 2 : 3)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (compact) {
      return (
        <Text
          style={[styles.textCompact, { color: colors.text }]}
          numberOfLines={2}
        >
          {entry.text || "No notes"}
        </Text>
      );
    }

    return (
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={4}>
        {entry.text || "No notes"}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.container,
        compact ? styles.containerCompact : styles.containerRegular,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        {showDate && (
          <Text style={[styles.date, { color: colors.muted }]}>
            {formatJournalDateShort(entry.date)}
          </Text>
        )}
        {showSessionLink && entry.sessionId && (
          <View style={styles.sessionBadge}>
            <Text style={[styles.sessionBadgeText, { color: ds.tone.accent }]}>
              Workout
            </Text>
          </View>
        )}
        {onEdit && (
          <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
            <Text style={[styles.editButtonText, { color: colors.muted }]}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {renderContent()}

      {(entry.mood !== undefined || entry.energy !== undefined) && (
        <View style={styles.ratingsContainer}>
          {renderRating(entry.mood, "Mood")}
          {renderRating(entry.energy, "Energy")}
        </View>
      )}

      {renderSoreness()}

      {!compact && entry.text.length > 200 && (
        <View style={styles.readMore}>
          <Text style={[styles.readMoreText, { color: ds.tone.accent }]}>
            Read more
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  containerCompact: {
    padding: 12,
  },
  containerRegular: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
  },
  sessionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  textCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  ratingsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  ratingStars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingStar: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  sorenessContainer: {
    marginTop: 8,
  },
  sorenessLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  sorenessChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sorenessChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sorenessChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  readMore: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default JournalEntryCard;