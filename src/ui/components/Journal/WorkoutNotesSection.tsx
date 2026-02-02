// src/ui/components/Journal/WorkoutNotesSection.tsx
// Integrated notes section for workout summary

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { JournalEntry } from "@/src/lib/journalModel";
import JournalEntryCard from "./JournalEntryCard";
import JournalEntryModal from "./JournalEntryModal";
import { MuscleId } from "@/src/data/consolidatedMuscleGroups";

export interface WorkoutNotesSectionProps {
  sessionId: string;
  sessionDate: string;
  userId: string;
  existingEntry?: JournalEntry;
  onSave: (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: MuscleId[];
  }) => Promise<void>;
  onEdit?: () => void;
  compact?: boolean;
}

export const WorkoutNotesSection: React.FC<WorkoutNotesSectionProps> = ({
  sessionId,
  sessionDate,
  userId,
  existingEntry,
  onSave,
  onEdit,
  compact = false,
}) => {
  const colors = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNotes = () => {
    setShowModal(true);
  };

  const handleEditNotes = () => {
    if (onEdit) {
      onEdit();
    } else {
      setShowModal(true);
    }
  };

  const handleSave = async (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: MuscleId[];
  }) => {
    setIsSaving(true);
    try {
      await onSave(data);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save workout notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (existingEntry) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Workout Notes
          </Text>
          <TouchableOpacity onPress={handleEditNotes}>
            <Text style={[styles.editButton, { color: ds.tone.accent }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
        <JournalEntryCard
          entry={existingEntry}
          onPress={handleEditNotes}
          compact={compact}
          showDate={false}
          showSessionLink={false}
        />
        <JournalEntryModal
          visible={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSave}
          initialData={existingEntry}
          title="Edit Workout Notes"
          submitLabel="Save Changes"
          date={sessionDate}
          allowDateChange={false}
          isLoading={isSaving}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Workout Notes
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleAddNotes}
        style={[
          styles.addNotesButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.addNotesContent}>
          <Text style={[styles.addNotesIcon, { color: ds.tone.accent }]}>
            +
          </Text>
          <Text style={[styles.addNotesText, { color: colors.text }]}>
            Add notes about your workout
          </Text>
          <Text style={[styles.addNotesSubtext, { color: colors.muted }]}>
            Track how you felt, energy levels, and soreness
          </Text>
        </View>
      </TouchableOpacity>
      <JournalEntryModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        title="Add Workout Notes"
        submitLabel="Save Notes"
        date={sessionDate}
        allowDateChange={false}
        isLoading={isSaving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  editButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  addNotesButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 20,
  },
  addNotesContent: {
    alignItems: "center",
  },
  addNotesIcon: {
    fontSize: 32,
    fontWeight: "300",
    marginBottom: 8,
  },
  addNotesText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  addNotesSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default WorkoutNotesSection;