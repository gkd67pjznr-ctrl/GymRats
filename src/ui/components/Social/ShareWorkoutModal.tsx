// src/ui/components/Social/ShareWorkoutModal.tsx
// Modal for sharing a completed workout to the social feed

import { useRef, useState } from 'react';
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
import { ShareableWorkoutCard } from './ShareableWorkoutCard';
import { shareWorkoutAsImage } from '@/src/lib/sharing/workoutCardGenerator';
import { calculateBestTierForSession } from '@/src/lib/workoutPostGenerator';
import { useSettingsStore } from '@/src/lib/stores/settingsStore';

interface ShareWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
  onShared?: (postId: string) => void;
}

type ShareTab = 'feed' | 'image';

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

// Base suggested captions
const BASE_CAPTIONS = [
  'Just crushed it! 💪',
  'Progress, not perfection. 🔥',
  'One step closer to my goals. ⚡',
  'The grind never stops. 🏋️',
];

// Milestone-specific captions
const MILESTONE_CAPTIONS = {
  weight_pr: [
    'New weight PR! 🏋️',
    'Lifting heavier than ever! ⚡',
    'Strength gains unlocked! 💪',
  ],
  rep_pr: [
    'Rep PR unlocked! 🔥',
    'More reps, more gains! 💪',
    'Pushing the limits! ⚡',
  ],
  e1rm_pr: [
    'New estimated max! 📈',
    'Getting stronger every day! 💪',
    'Progress in the making! 🔥',
  ],
  multi_pr: [
    'Multiple PRs today! 🏆',
    'Unstoppable! PRs falling! 🔥',
    'PR city! 💎',
  ],
  streak: [
    'Consistency is key! 🔥',
    'Streak mode activated! ⚡',
    'Building the habit! 💪',
  ],
};

// Generate suggested captions based on milestones
function generateMilestoneCaptions(session: WorkoutSession): string[] {
  const captions: string[] = [];

  const totalPRs = (session.prCount ?? 0);
  const weightPRs = session.weightPRs ?? 0;
  const repPRs = session.repPRs ?? 0;
  const e1rmPRs = session.e1rmPRs ?? 0;

  // Multiple PRs
  if (totalPRs >= 2) {
    captions.push(...MILESTONE_CAPTIONS.multi_pr);
  } else {
    // Single PR type
    if (weightPRs > 0) {
      captions.push(MILESTONE_CAPTIONS.weight_pr[0]);
    }
    if (repPRs > 0) {
      captions.push(MILESTONE_CAPTIONS.rep_pr[0]);
    }
    if (e1rmPRs > 0) {
      captions.push(MILESTONE_CAPTIONS.e1rm_pr[0]);
    }
  }

  // Add base captions
  captions.push(...BASE_CAPTIONS);

  // Return unique captions, limit to 8
  return [...new Set(captions)].slice(0, 8);
}

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
  const cardRef = useRef<View>(null);

  // Get privacy settings - private accounts default to friends-only posts
  const privacySettings = useSettingsStore((state) => state.privacy);
  const defaultPrivacy: PrivacyLevel = privacySettings?.privateAccount ? 'friends' : 'public';

  const [activeTab, setActiveTab] = useState<ShareTab>('feed');
  const [caption, setCaption] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyLevel>(defaultPrivacy);
  const [photos, setPhotos] = useState<string[]>([]);
  const [sharing, setSharing] = useState(false);

  if (!session) return null;

  // Format workout summary
  const exerciseCount = new Set(session.sets.map((s) => s.exerciseId)).size;
  const setCount = session.sets.length;
  const durationMin = Math.round((session.endedAtMs - session.startedAtMs) / 60000);
  const bestTier = calculateBestTierForSession(session);
  const totalVolume = session.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);

  // Milestone data
  const totalPRs = session.prCount ?? 0;
  const weightPRs = session.weightPRs ?? 0;
  const repPRs = session.repPRs ?? 0;
  const e1rmPRs = session.e1rmPRs ?? 0;
  const hasMilestones = totalPRs > 0;

  // Generate dynamic captions based on milestones
  const suggestedCaptions = generateMilestoneCaptions(session);

  const handleShareToFeed = async () => {
    if (!user) return;

    setSharing(true);
    try {
      const post = createPostFromWorkout({
        session,
        authorUserId: user.id,
        authorDisplayName: user.displayName || 'You',
        authorAvatarUrl: user.avatarUrl ?? undefined,
        privacy: selectedPrivacy,
        caption: caption.trim() || undefined,
      });

      // If photos were attached, update the post with photo URLs
      if (photos.length > 0) {
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

  const handleShareAsImage = async () => {
    if (!cardRef.current) return;

    setSharing(true);
    try {
      await shareWorkoutAsImage(
        {
          session,
          userName: user?.displayName ?? undefined,
          bestTier: bestTier ?? 'Iron',
          totalVolume,
        },
        cardRef
      );
    } catch (error) {
      console.error('[ShareWorkoutModal] Failed to share as image:', error);
    } finally {
      setSharing(false);
    }
  };

  const TabButton = ({ tab, label }: { tab: ShareTab; label: string }) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tab ? ds.tone.accent : c.bg,
          borderColor: activeTab === tab ? ds.tone.accent : c.border,
        },
      ]}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: activeTab === tab ? c.bg : c.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

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

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TabButton tab="feed" label="Post to Feed" />
            <TabButton tab="image" label="Share Image" />
          </View>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'feed' ? (
              <>
                {/* Workout Summary */}
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: c.bg, borderColor: hasMilestones ? ds.tone.accent : c.border },
                  ]}
                >
                  <Text style={[styles.summaryTitle, { color: c.text }]}>
                    {session.routineName || `${exerciseCount} Exercise Workout`}
                  </Text>

                  {/* Milestone Badges */}
                  {hasMilestones && (
                    <View style={styles.milestoneBadges}>
                      {weightPRs > 0 && (
                        <View style={[styles.milestoneBadge, { backgroundColor: alpha(ds.tone.accent, 0.2) }]}>
                          <Text style={[styles.milestoneBadgeText, { color: ds.tone.accent }]}>
                            🏋️ {weightPRs} Weight PR{weightPRs > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                      {repPRs > 0 && (
                        <View style={[styles.milestoneBadge, { backgroundColor: alpha(ds.tone.accent, 0.2) }]}>
                          <Text style={[styles.milestoneBadgeText, { color: ds.tone.accent }]}>
                            💪 {repPRs} Rep PR{repPRs > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                      {e1rmPRs > 0 && (
                        <View style={[styles.milestoneBadge, { backgroundColor: alpha(ds.tone.accent, 0.2) }]}>
                          <Text style={[styles.milestoneBadgeText, { color: ds.tone.accent }]}>
                            📈 {e1rmPRs} e1RM PR{e1rmPRs > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

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
                    {hasMilestones ? 'Celebrate Your PRs' : 'Quick Add'}
                  </Text>
                  <View style={styles.suggestionsGrid}>
                    {suggestedCaptions.map((suggested) => (
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
              </>
            ) : (
              <>
                {/* Card Preview */}
                <View style={styles.cardPreviewSection}>
                  <Text style={[styles.label, { color: c.text, marginBottom: 12 }]}>
                    Card Preview
                  </Text>
                  <View style={styles.cardPreviewContainer}>
                    <ShareableWorkoutCard
                      ref={cardRef}
                      session={session}
                      userName={user?.displayName ?? undefined}
                      bestTier={bestTier ?? 'Iron'}
                      totalVolume={totalVolume}
                    />
                  </View>
                  <Text style={[styles.previewHint, { color: c.muted }]}>
                    This card will be shared as an image to other apps
                  </Text>
                </View>
              </>
            )}
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
              onPress={activeTab === 'feed' ? handleShareToFeed : handleShareAsImage}
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
                {sharing
                  ? 'Sharing...'
                  : activeTab === 'feed'
                  ? 'Post to Feed'
                  : 'Share Image'}
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
    maxHeight: '85%',
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
  tabRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingTop: 8,
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
  milestoneBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  milestoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  milestoneBadgeText: {
    fontSize: 13,
    fontWeight: '700',
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
  cardPreviewSection: {
    alignItems: 'center',
  },
  cardPreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewHint: {
    fontSize: 12,
    textAlign: 'center',
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
