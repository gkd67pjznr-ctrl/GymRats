// app/journal-entry/[id].tsx
// Journal entry detail and edit screen

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
import { makeDesignSystem } from "../../src/ui/designSystem";
import { useJournalEntry, useUser, updateJournalEntry, removeJournalEntry } from "../../src/lib/stores";
import { formatJournalDate } from "../../src/lib/journalModel";
import { MUSCLE_GROUPS } from "../../src/data/consolidatedMuscleGroups";
import JournalEntryModal from "../../src/ui/components/Journal/JournalEntryModal";

export default function JournalEntryDetail() {
  const colors = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const entry = useJournalEntry(id || "");
  const user = useUser();

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.notFoundText, { color: colors.muted }]}>
          Journal entry not found
        </Text>
      </View>
    );
  }

  const getMuscleDisplayName = (muscleId: string) => {
    const muscle = MUSCLE_GROUPS.find((m) => m.id === muscleId);
    return muscle ? muscle.displayName : muscleId;
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSave = async (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: string[];
    date?: string;
  }) => {
    setIsSaving(true);
    try {
      updateJournalEntry(entry.id, {
        text: data.text,
        mood: data.mood,
        energy: data.energy,
        soreness: data.soreness,
      });
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update journal entry:", error);
      Alert.alert("Error", "Failed to update journal entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Journal Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              removeJournalEntry(entry.id);
              router.back();
            } catch (error) {
              console.error("Failed to delete journal entry:", error);
              Alert.alert("Error", "Failed to delete journal entry");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  const handleViewWorkout = () => {
    if (entry.sessionId) {
      router.push(`/workout/${entry.sessionId}`);
    }
  };

  const renderRating = (value: number | undefined, label: string) => {
    if (value === undefined) return null;

    return (
      <View style={styles.ratingSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{label}</Text>
        <View style={styles.ratingContainer}>
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
      </View>
    );
  };

  const renderSoreness = () => {
    if (!entry.soreness || entry.soreness.length === 0) return null;

    return (
      <View style={styles.sorenessSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Sore Muscles
        </Text>
        <View style={styles.sorenessChips}>
          {entry.soreness.map((muscleId, index) => (
            <View
              key={index}
              style={[styles.sorenessChip, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sorenessChipText, { color: colors.text }]}>
                {getMuscleDisplayName(muscleId)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.date, { color: colors.muted }]}>
            {formatJournalDate(entry.date)}
          </Text>
          {entry.sessionId && (
            <TouchableOpacity
              onPress={handleViewWorkout}
              style={[styles.workoutButton, { backgroundColor: ds.tone.accent }]}
            >
              <Text style={[styles.workoutButtonText, { color: colors.bg }]}>
                View Workout
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Journal Text */}
        <View style={styles.textSection}>
          <Text style={[styles.text, { color: colors.text }]}>{entry.text}</Text>
        </View>

        {/* Ratings */}
        {(entry.mood !== undefined || entry.energy !== undefined) && (
          <View style={styles.ratingsContainer}>
            {renderRating(entry.mood, "Mood")}
            {renderRating(entry.energy, "Energy Level")}
          </View>
        )}

        {/* Soreness */}
        {renderSoreness()}

        {/* Metadata */}
        <View style={styles.metadataSection}>
          <Text style={[styles.metadataLabel, { color: colors.muted }]}>
            Created: {new Date(entry.createdAt).toLocaleDateString()}
          </Text>
          {entry.updatedAt && (
            <Text style={[styles.metadataLabel, { color: colors.muted }]}>
              Updated: {new Date(entry.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleEdit}
          disabled={isSaving || isDeleting}
          style={[
            styles.editButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: isSaving || isDeleting ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[styles.editButtonText, { color: colors.text }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={isSaving || isDeleting}
          style={[
            styles.deleteButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.danger,
              opacity: isSaving || isDeleting ? 0.5 : 1,
            },
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
              Delete
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <JournalEntryModal
        visible={showEditModal}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        initialData={entry}
        title="Edit Journal Entry"
        submitLabel="Save Changes"
        date={entry.date}
        allowDateChange={false}
        isLoading={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
  },
  workoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  workoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  textSection: {
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  ratingsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  ratingSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 4,
  },
  ratingStar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  sorenessSection: {
    marginBottom: 24,
    gap: 8,
  },
  sorenessChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sorenessChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sorenessChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  metadataSection: {
    marginTop: 24,
    gap: 4,
  },
  metadataLabel: {
    fontSize: 14,
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  notFoundText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});