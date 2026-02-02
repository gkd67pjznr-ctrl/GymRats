// src/ui/components/Social/ShareWorkoutModal.tsx
// Modal for sharing a completed workout to the social feed

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';
import type { WorkoutSession } from '@/src/lib/workoutModel';
import { useSocialStore } from '@/src/lib/stores/socialStore';
import { useUser } from '@/src/lib/stores/authStore';
import type { PrivacyLevel } from '@/src/lib/socialModel';
import { PhotoAttachment } from './PhotoAttachment';

interface ShareWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
  onShared?: (postId: string) => void;
}

// Privacy options
const PRIVACY_OPTIONS: Array<{ value: PrivacyLevel; label: string; description: string }> = [
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to everyone',
  },
  {
    value: 'friends',
    label: 'Friends Only',
    description: 'Only friends can see',
  },
];

// Suggested captions
const SUGGESTED_CAPTIONS = [
  'Just crushed it! 💪',
  'Progress, not perfection. 🔥',
  'One step closer to my goals. ⚡',
  'The grind never stops. 🏋️',
  'New PRs today! 🏆',
  'Leg day complete. 🦵',
  'Upper body gains. 💪',
  'Rest day earned. 😴',
];

export function ShareWorkoutModal({
  visible,
  onClose,
  session,
  onShared,
}: ShareWorkoutModalProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const user = useUser();
  const createPostFromWorkout = useSocialStore((state) => state.createPostFromWorkout);

  const [caption, setCaption] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyLevel>('public');
  const [photos, setPhotos] = useState<string[]>([]);
  const [sharing, setSharing] = useState(false);

  if (!session) return null;

  // Format workout summary
  const exerciseCount = new Set(session.sets.map((s) => s.exerciseId)).size;
  const setCount = session.sets.length;
  const durationMin = Math.round((session.endedAtMs - session.startedAtMs) / 60000);

  const handleShare = async () => {
    if (!user) return;

    setSharing(true);
    try {
      const post = createPostFromWorkout({
        session,
        authorUserId: user.id,
        authorDisplayName: user.displayName || 'You',
        authorAvatarUrl: user.avatarUrl,
        privacy: selectedPrivacy,
        caption: caption.trim() || undefined,
      });

      // If photos were attached, update the post with photo URLs
      if (photos.length > 0) {
        // Note: In a real implementation, you would upload photos to storage first
        // and then update the post with the URLs. For now, we'll use local URIs.
        useSocialStore.getState().updatePost?.(post.id, {
          photoUrls: photos,
        });
      }

      onShared?.(post.id);
      setCaption('');
      setSelectedPrivacy('public');
      setPhotos([]);
      onClose();
    } catch (error) {
      console.error('[ShareWorkoutModal] Failed to share workout:', error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>
              Share Workout
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: c.muted }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Workout Summary */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: c.bg, borderColor: c.border },
              ]}
            >
              <Text style={[styles.summaryTitle, { color: c.text }]}>
                {session.routineName || `${exerciseCount} Exercise Workout`}
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: ds.tone.accent }]}>
                    {exerciseCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>
                    Exercises
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: ds.tone.accent }]}>
                    {setCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>
                    Sets
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: ds.tone.accent }]}>
                    {durationMin}m
                  </Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>
                    Duration
                  </Text>
                </View>
              </View>
            </View>

            {/* Privacy Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>Privacy</Text>
              <View style={styles.privacyGrid}>
                {PRIVACY_OPTIONS.map((option) => {
                  const isSelected = selectedPrivacy === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedPrivacy(option.value)}
                      style={[
                        styles.privacyCard,
                        {
                          backgroundColor: isSelected
                            ? alpha(ds.tone.accent, 0.15)
                            : c.bg,
                          borderColor: isSelected
                            ? ds.tone.accent
                            : c.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.privacyLabel,
                          { color: isSelected ? ds.tone.accent : c.text },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.privacyDescription,
                          { color: c.muted },
                        ]}
                      >
                        {option.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Caption Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>
                Caption (optional)
              </Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption..."
                placeholderTextColor={c.muted}
                multiline
                numberOfLines={3}
                maxLength={280}
                style={[
                  styles.input,
                  {
                    backgroundColor: c.bg,
                    color: c.text,
                    borderColor: c.border,
                  },
                ]}
              />
              <Text style={[styles.helper, { color: c.muted }]}>
                {caption.length}/280
              </Text>
            </View>

            {/* Photo Attachment */}
            <PhotoAttachment
              photos={photos}
              onAddPhotos={(uris) => setPhotos([...photos, ...uris])}
              onRemovePhoto={(uri) => setPhotos(photos.filter((p) => p !== uri))}
              disabled={sharing}
            />

            {/* Suggested Captions */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>
                Quick Add
              </Text>
              <View style={styles.suggestionsGrid}>
                {SUGGESTED_CAPTIONS.map((suggested) => (
                  <TouchableOpacity
                    key={suggested}
                    onPress={() => setCaption(suggested)}
                    style={[
                      styles.suggestionChip,
                      { backgroundColor: c.bg, borderColor: c.border },
                    ]}
                  >
                    <Text style={[styles.suggestionText, { color: c.text }]}>
                      {suggested}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: c.border }]}>
            <Pressable
              onPress={onClose}
              style={[
                styles.button,
                styles.buttonSecondary,
                { borderColor: c.border },
              ]}
              disabled={sharing}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={[
                styles.button,
                styles.buttonPrimary,
                {
                  backgroundColor: ds.tone.accent,
                  opacity: sharing ? 0.5 : 1,
                },
              ]}
              disabled={sharing}
            >
              <Text style={[styles.buttonText, { color: c.bg }]}>
                {sharing ? 'Sharing...' : 'Share Workout'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper function to add alpha to hex color
function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  privacyGrid: {
    gap: 10,
  },
  privacyCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    gap: 4,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  privacyDescription: {
    fontSize: 13,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  suggestionsGrid: {
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonSecondary: {},
  buttonPrimary: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
