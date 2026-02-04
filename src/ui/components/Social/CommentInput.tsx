// src/ui/components/Social/CommentInput.tsx
// Enhanced comment input with send button and keyboard handling

import React, { useState, useCallback } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../theme';

interface CommentInputProps {
  onSubmit: (text: string) => void | Promise<void>;
  placeholder?: string;
  replyingTo?: string;
  onCancelReply?: () => void;
  autoFocus?: boolean;
}

export function CommentInput({
  onSubmit,
  placeholder = 'Write a comment...',
  replyingTo,
  onCancelReply,
  autoFocus = false,
}: CommentInputProps) {
  const c = useThemeColors();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await onSubmit(trimmed);
      setText('');
    } finally {
      setSubmitting(false);
    }
  }, [text, submitting, onSubmit]);

  const canSubmit = text.trim().length > 0 && !submitting;

  return (
    <View style={styles.container}>
      {/* Reply indicator */}
      {replyingTo && (
        <View style={[styles.replyBar, { backgroundColor: c.bg, borderColor: c.border }]}>
          <Text style={[styles.replyText, { color: c.muted }]} numberOfLines={1}>
            Replying to <Text style={{ fontWeight: '700', color: c.text }}>{replyingTo}</Text>
          </Text>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={c.muted} />
          </Pressable>
        </View>
      )}

      {/* Input row */}
      <View style={[styles.inputRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.text }]}
          multiline
          maxLength={500}
          autoFocus={autoFocus}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSubmit}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: canSubmit ? c.primary : c.bg,
              opacity: pressed && canSubmit ? 0.8 : canSubmit ? 1 : 0.5,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color={canSubmit ? '#fff' : c.muted} />
          )}
        </Pressable>
      </View>

      {/* Character count */}
      {text.length > 400 && (
        <Text style={[styles.charCount, { color: text.length > 480 ? '#ef4444' : c.muted }]}>
          {text.length}/500
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  replyText: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginRight: 4,
  },
});

export default CommentInput;
