// src/ui/components/Journal/JournalEntryModal.tsx
// Modal for creating/editing journal entries

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { JournalEntry } from "@/src/lib/journalModel";
import { validateJournalEntry, isJournalEntryValid } from "@/src/lib/validators/journal";
import JournalTextInput from "./JournalTextInput";
import StarRating from "./StarRating";
import SorenessPicker from "./SorenessPicker";
import { MuscleId } from "@/src/data/consolidatedMuscleGroups";

export interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: MuscleId[];
    date?: string;
  }) => Promise<void>;
  initialData?: Partial<JournalEntry>;
  title?: string;
  submitLabel?: string;
  date?: string;
  allowDateChange?: boolean;
  isLoading?: boolean;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  title = "Journal Entry",
  submitLabel = "Save",
  date,
  allowDateChange = false,
  isLoading = false,
}) => {
  const colors = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Form state
  const [text, setText] = useState(initialData?.text || "");
  const [mood, setMood] = useState<number | undefined>(initialData?.mood);
  const [energy, setEnergy] = useState<number | undefined>(initialData?.energy);
  const [soreness, setSoreness] = useState<MuscleId[]>(
    (initialData?.soreness as MuscleId[]) || []
  );
  const [selectedDate, setSelectedDate] = useState(date || "");

  // Validation
  const [validation, setValidation] = useState(
    validateJournalEntry({ text, mood, energy, soreness, date: selectedDate })
  );

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setText(initialData.text || "");
      setMood(initialData.mood);
      setEnergy(initialData.energy);
      setSoreness((initialData.soreness as MuscleId[]) || []);
    }
  }, [initialData]);

  // Update validation when form changes
  useEffect(() => {
    setValidation(
      validateJournalEntry({
        text,
        mood,
        energy,
        soreness,
        date: selectedDate,
      })
    );
  }, [text, mood, energy, soreness, selectedDate]);

  const handleSubmit = async () => {
    if (!isJournalEntryValid(validation)) {
      Alert.alert("Validation Error", "Please check your journal entry");
      return;
    }

    try {
      await onSubmit({
        text: validation.text.value as string,
        mood: mood,
        energy: energy,
        soreness: soreness.length > 0 ? soreness : undefined,
        date: selectedDate,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to submit journal entry:", error);
      Alert.alert("Error", "Failed to save journal entry");
    }
  };

  const handleClose = () => {
    // Reset form
    setText("");
    setMood(undefined);
    setEnergy(undefined);
    setSoreness([]);
    setSelectedDate(date || "");
    onClose();
  };

  const handleMuscleToggle = (muscleId: MuscleId) => {
    setSoreness((current) => {
      if (current.includes(muscleId)) {
        return current.filter((id) => id !== muscleId);
      } else {
        return [...current, muscleId];
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.muted }]}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Date input (if allowed) */}
            {allowDateChange && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>
                  Date
                </Text>
                <TextInput
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.dateInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.bg,
                      borderColor: validation.date?.valid
                        ? colors.border
                        : colors.danger,
                    },
                  ]}
                />
                {validation.date?.error && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {validation.date.error}
                  </Text>
                )}
              </View>
            )}

            {/* Journal text */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Notes
              </Text>
              <JournalTextInput
                value={text}
                onChangeText={setText}
                placeholder="How did your workout go? How are you feeling?"
                autoFocus={!initialData}
                showCharacterCount
              />
              {validation.text.error && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {validation.text.error}
                </Text>
              )}
            </View>

            {/* Mood rating */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Mood
              </Text>
              <StarRating
                rating={mood}
                onRatingChange={setMood}
                label="How are you feeling?"
              />
            </View>

            {/* Energy rating */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Energy Level
              </Text>
              <StarRating
                rating={energy}
                onRatingChange={setEnergy}
                label="How much energy do you have?"
              />
            </View>

            {/* Soreness picker */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Soreness
              </Text>
              <SorenessPicker
                selectedMuscles={soreness}
                onMuscleToggle={handleMuscleToggle}
                disabled={isLoading}
              />
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  opacity: isLoading ? 0.5 : 1,
                },
              ]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !isJournalEntryValid(validation)}
              style={[
                styles.submitButton,
                {
                  backgroundColor: isLoading
                    ? colors.border
                    : isJournalEntryValid(validation)
                    ? ds.tone.accent
                    : colors.muted,
                  opacity: isLoading || !isJournalEntryValid(validation) ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  { color: isLoading ? colors.text : colors.bg },
                ]}
              >
                {isLoading ? "Saving..." : submitLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Need to import TextInput from react-native
import { TextInput } from "react-native";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "300",
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default JournalEntryModal;