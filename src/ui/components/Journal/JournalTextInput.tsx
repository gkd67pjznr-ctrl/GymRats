// src/ui/components/Journal/JournalTextInput.tsx
// Multiline text input with character count for journal entries

import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/ui/theme";

export interface JournalTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  showCharacterCount?: boolean;
}

export const JournalTextInput: React.FC<JournalTextInputProps> = ({
  value,
  onChangeText,
  placeholder = "How did your workout go? How are you feeling?",
  maxLength = 5000,
  disabled = false,
  autoFocus = false,
  showCharacterCount = true,
}) => {
  const colors = useThemeColors();

  const handleChangeText = (text: string) => {
    if (text.length <= maxLength) {
      onChangeText(text);
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={6}
        maxLength={maxLength}
        editable={!disabled}
        autoFocus={autoFocus}
        style={[
          styles.textInput,
          {
            color: colors.text,
            backgroundColor: colors.bg,
            borderColor: isOverLimit ? colors.danger : colors.border,
          },
        ]}
        textAlignVertical="top"
      />
      {showCharacterCount && (
        <View style={styles.characterCountContainer}>
          <Text
            style={[
              styles.characterCount,
              {
                color: isOverLimit
                  ? colors.danger
                  : isNearLimit
                  ? colors.warning
                  : colors.muted,
              },
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
          {isOverLimit && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              Character limit exceeded
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  textInput: {
    width: "100%",
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  characterCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default JournalTextInput;