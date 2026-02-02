import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeColors } from "../../../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useWorkoutSessions, useJournalEntriesForDate, useUser } from "../../../src/lib/stores";
import { startOfDayMs, formatDateShort, formatTimeShort, formatDuration, durationMs } from "../../../src/lib/workoutModel";
import { EXERCISES_V1 } from "../../../src/data/exercises";
import { kgToLb } from "../../../src/lib/units";
import JournalEntryCard from "../../../src/ui/components/Journal/JournalEntryCard";
import JournalEntryModal from "../../../src/ui/components/Journal/JournalEntryModal";
import { useState } from "react";
import { addJournalEntry } from "../../../src/lib/stores";
import { createJournalEntry, getDateFromTimestamp } from "../../../src/lib/journalModel";
import { MuscleId } from "../../../src/data/consolidatedMuscleGroups";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export default function DayDetail() {
  const c = useThemeColors();
  const { dayMs } = useLocalSearchParams<{ dayMs: string }>();
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const day = Number(dayMs);
  const sessions = useWorkoutSessions();
  const user = useUser();

  const dayStart = startOfDayMs(day);
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const dateStr = new Date(dayStart).toISOString().split("T")[0];

  const todays = sessions.filter((s) => s.startedAtMs >= dayStart && s.startedAtMs < dayEnd);
  const journalEntries = useJournalEntriesForDate(dateStr);

  const handleAddJournal = () => {
    setShowJournalModal(true);
  };

  const handleSaveJournal = async (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: MuscleId[];
    date?: string;
  }) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const journalEntry = createJournalEntry(
        user.id,
        data.date || dateStr,
        data.text,
        undefined, // No session ID for standalone journal entries
        data.mood,
        data.energy,
        data.soreness
      );
      addJournalEntry(journalEntry);
      setShowJournalModal(false);
    } catch (error) {
      console.error("Failed to save journal entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowJournalModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>
          {formatDateShort(dayStart)}
        </Text>

        {/* Add Journal Entry Button */}
        <TouchableOpacity
          onPress={handleAddJournal}
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            backgroundColor: c.card,
            padding: 16,
            alignItems: "center",
            borderStyle: "dashed",
          }}
        >
          <Text style={{ color: c.text, fontWeight: "600" }}>+ Add Journal Entry</Text>
          <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
            Track how you felt, energy levels, and soreness
          </Text>
        </TouchableOpacity>

        {/* Journal Entries */}
        {journalEntries.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
              Journal Entries
            </Text>
            {journalEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                compact={true}
                showDate={false}
                showSessionLink={true}
              />
            ))}
          </View>
        )}

        {/* Workout Sessions - temporarily simplified */}
        {todays.length === 0 ? (
          <Text style={{ color: c.muted }}>No workouts logged this day.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
              Workout Sessions
            </Text>
            {todays.map((s) => (
              <View key={s.id}>
                <Text style={{ color: c.text }}>
                  Workout at {formatTimeShort(s.startedAtMs)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Journal Entry Modal */}
      <JournalEntryModal
        visible={showJournalModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveJournal}
        title="Add Journal Entry"
        submitLabel="Save Entry"
        date={dateStr}
        allowDateChange={true}
        isLoading={isSaving}
      />
    </View>
  );
}
