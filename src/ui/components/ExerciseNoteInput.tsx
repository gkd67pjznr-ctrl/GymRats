// src/ui/components/ExerciseNoteInput.tsx
// Self-contained exercise note component with icon toggle and expandable input
// Notes persist across workouts and are tied to exerciseId

import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useThemeColors } from "../theme";
import { FR } from "../GrStyle";
import {
  useExerciseNote,
  useExerciseNotesStore,
  MAX_NOTE_LENGTH,
} from "../../lib/stores/exerciseNotesStore";

export interface ExerciseNoteInputProps {
  exerciseId: string;
  /** Show only the icon (for header placement) */
  iconOnly?: boolean;
  /** Callback when note is expanded/collapsed */
  onToggleExpand?: (expanded: boolean) => void;
  /** Custom icon size */
  iconSize?: number;
}

/**
 * ExerciseNoteInput - Per-exercise note attachment component
 *
 * Features:
 * - Note icon that shows filled/empty state
 * - Tap to expand text input below
 * - Truncated preview when collapsed (if note exists)
 * - 200 character limit with live counter
 * - Debounced persistence to AsyncStorage
 *
 * Usage:
 * ```tsx
 * <ExerciseNoteInput exerciseId="bench" />
 * ```
 *
 * For header-only icon (expand handled externally):
 * ```tsx
 * <ExerciseNoteInput exerciseId="bench" iconOnly onToggleExpand={setExpanded} />
 * ```
 */
export function ExerciseNoteInput({
  exerciseId,
  iconOnly = false,
  onToggleExpand,
  iconSize = 18,
}: ExerciseNoteInputProps) {
  const c = useThemeColors();
  const note = useExerciseNote(exerciseId);
  const setNote = useExerciseNotesStore((state) => state.setNote);

  const [isExpanded, setIsExpanded] = useState(false);
  const [localNote, setLocalNote] = useState(note);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Sync local note with store when it changes externally
  useEffect(() => {
    if (!isExpanded) {
      setLocalNote(note);
    }
  }, [note, isExpanded]);

  // Handle expand/collapse animation
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (isExpanded) {
      // Focus input when expanded
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded, expandAnim]);

  const hasNote = !!note.trim();

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleToggle = useCallback(() => {
    triggerHaptic();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpand?.(newExpanded);

    if (!newExpanded) {
      // Closing - save note to store
      Keyboard.dismiss();
    }
  }, [isExpanded, onToggleExpand, triggerHaptic]);

  const handleNoteChange = useCallback(
    (text: string) => {
      // Enforce character limit
      const trimmed = text.slice(0, MAX_NOTE_LENGTH);
      setLocalNote(trimmed);
      // Debounced save happens in store
      setNote(exerciseId, trimmed);
    },
    [exerciseId, setNote]
  );

  const handleClearNote = useCallback(() => {
    triggerHaptic();
    setLocalNote("");
    setNote(exerciseId, "");
  }, [exerciseId, setNote, triggerHaptic]);

  // Truncate note for preview (max ~50 chars)
  const truncatedNote =
    note.length > 50 ? note.slice(0, 47) + "..." : note;

  // Icon-only mode: just render the toggle icon
  if (iconOnly) {
    return (
      <Pressable
        onPress={handleToggle}
        hitSlop={8}
        style={({ pressed }) => [
          styles.iconButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Ionicons
          name={hasNote ? "document-text" : "document-text-outline"}
          size={iconSize}
          color={hasNote ? c.primary : c.muted}
        />
      </Pressable>
    );
  }

  // Full mode: icon + expandable input + preview
  return (
    <View style={styles.container}>
      {/* Header row with icon and preview */}
      <Pressable
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.headerRow,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={hasNote ? "document-text" : "document-text-outline"}
            size={iconSize}
            color={hasNote ? c.primary : c.muted}
          />
        </View>

        {/* Preview text (only when collapsed and has note) */}
        {!isExpanded && hasNote && (
          <Text
            style={[styles.previewText, { color: c.muted }]}
            numberOfLines={1}
          >
            {truncatedNote}
          </Text>
        )}

        {/* Expand/collapse indicator */}
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={c.muted}
          style={styles.chevron}
        />
      </Pressable>

      {/* Expandable input area */}
      <Animated.View
        style={[
          styles.expandableContainer,
          {
            maxHeight: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 150],
            }),
            opacity: expandAnim,
            marginTop: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, FR.space.x2],
            }),
          },
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: c.bg,
              borderColor: c.border,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={localNote}
            onChangeText={handleNoteChange}
            placeholder="Add a note for this exercise..."
            placeholderTextColor={c.muted}
            multiline
            numberOfLines={3}
            maxLength={MAX_NOTE_LENGTH}
            style={[styles.input, { color: c.text }]}
            textAlignVertical="top"
          />

          {/* Footer: character count + clear button */}
          <View style={styles.inputFooter}>
            <Text style={[styles.charCount, { color: c.muted }]}>
              {localNote.length}/{MAX_NOTE_LENGTH}
            </Text>

            {localNote.length > 0 && (
              <Pressable
                onPress={handleClearNote}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.clearButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Ionicons name="close-circle" size={16} color={c.muted} />
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Standalone note icon button for placement in exercise headers
 * Shows filled icon when note exists, outline when empty
 */
export function ExerciseNoteIcon({
  exerciseId,
  onPress,
  size = 18,
}: {
  exerciseId: string;
  onPress: () => void;
  size?: number;
}) {
  const c = useThemeColors();
  const note = useExerciseNote(exerciseId);
  const hasNote = !!note.trim();

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handlePress = useCallback(() => {
    triggerHaptic();
    onPress();
  }, [onPress, triggerHaptic]);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons
        name={hasNote ? "document-text" : "document-text-outline"}
        size={size}
        color={hasNote ? c.primary : c.muted}
      />
    </Pressable>
  );
}

/**
 * Note preview text for displaying in collapsed state
 * Returns null if no note exists
 */
export function ExerciseNotePreview({
  exerciseId,
  maxLength = 50,
}: {
  exerciseId: string;
  maxLength?: number;
}) {
  const c = useThemeColors();
  const note = useExerciseNote(exerciseId);

  if (!note.trim()) return null;

  const truncated =
    note.length > maxLength ? note.slice(0, maxLength - 3) + "..." : note;

  return (
    <Text
      style={[styles.previewText, { color: c.muted }]}
      numberOfLines={1}
    >
      {truncated}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: FR.space.x1,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
  },
  iconButton: {
    padding: FR.space.x1,
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: FR.space.x2,
  },
  chevron: {
    marginLeft: FR.space.x1,
  },
  expandableContainer: {
    overflow: "hidden",
  },
  inputContainer: {
    borderRadius: FR.radius.soft,
    borderWidth: 1,
    padding: FR.space.x2,
  },
  input: {
    fontSize: 13,
    fontWeight: "500",
    minHeight: 60,
    maxHeight: 80,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: FR.space.x1,
  },
  charCount: {
    fontSize: 11,
    fontWeight: "500",
  },
  clearButton: {
    padding: FR.space.x1,
  },
});

export default ExerciseNoteInput;
