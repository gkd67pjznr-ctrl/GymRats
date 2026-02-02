// src/ui/components/Social/ReportModal.tsx
// Modal for reporting inappropriate content or blocking users

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';
import { useSocialStore } from '@/src/lib/stores/socialStore';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'misinformation'
  | 'other';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  postId?: string;
  userId?: string;
  userDisplayName?: string;
  type: 'post' | 'user';
}

const REPORT_REASONS: Array<{ value: ReportReason; label: string; description: string }> = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repeated unwanted content or promotion',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying, threats, or targeted attacks',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'NSFW or offensive content',
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else that violates community guidelines',
  },
];

export function ReportModal({
  visible,
  onClose,
  postId,
  userId,
  userDisplayName,
  type,
}: ReportModalProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [includeBlock, setIncludeBlock] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isUserReport = type === 'user';

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Select a reason', 'Please select a reason for your report.');
      return;
    }

    setSubmitting(true);
    try {
      if (isUserReport && userId) {
        // Report and optionally block user
        await useSocialStore.getState().reportUser({
          reportedUserId: userId,
          reason: selectedReason,
          additionalInfo,
        });

        if (includeBlock) {
          await useSocialStore.getState().blockUser(userId);
        }

        Alert.alert(
          'User reported',
          includeBlock
            ? `Thanks for looking out. ${userDisplayName || 'This user'} has been reported and blocked.`
            : `Thanks for looking out. ${userDisplayName || 'This user'} has been reported.`
        );
      } else if (postId) {
        // Report post
        await useSocialStore.getState().reportPost({
          postId,
          reason: selectedReason,
          additionalInfo,
        });

        Alert.alert('Post reported', 'Thanks for looking out. Our team will review this post.');
      }

      // Reset form
      setSelectedReason(null);
      setAdditionalInfo('');
      setIncludeBlock(false);
      onClose();
    } catch (error) {
      console.error('[ReportModal] Failed to submit report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
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
              Report {isUserReport ? 'User' : 'Post'}
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
            {/* Info Text */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: alpha(c.warn, 0.15), borderColor: c.warn },
              ]}
            >
              <Text style={[styles.infoText, { color: c.warn }]}>
                {isUserReport && userDisplayName
                  ? `Report ${userDisplayName} for violating community guidelines.`
                  : 'Report this content for violating community guidelines.'}
              </Text>
            </View>

            {/* Report Reasons */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>Reason</Text>
              <View style={styles.reasonsGrid}>
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason.value;
                  return (
                    <Pressable
                      key={reason.value}
                      onPress={() => setSelectedReason(reason.value)}
                      style={[
                        styles.reasonCard,
                        {
                          backgroundColor: isSelected
                            ? alpha(ds.tone.danger, 0.15)
                            : c.bg,
                          borderColor: isSelected
                            ? ds.tone.danger
                            : c.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reasonLabel,
                          { color: isSelected ? ds.tone.danger : c.text },
                        ]}
                      >
                        {reason.label}
                      </Text>
                      <Text
                        style={[styles.reasonDescription, { color: c.muted }]}
                        numberOfLines={2}
                      >
                        {reason.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>
                Additional details (optional)
              </Text>
              <Pressable
                style={[
                  styles.textArea,
                  { backgroundColor: c.bg, borderColor: c.border },
                ]}
              >
                <Text
                  style={[styles.textAreaText, { color: additionalInfo ? c.text : c.muted }]}
                  onPress={() => {}}
                >
                  {additionalInfo || 'Add any context that might help...'}
                </Text>
              </Pressable>
            </View>

            {/* Block Option (for user reports) */}
            {isUserReport && (
              <Pressable
                onPress={() => setIncludeBlock(!includeBlock)}
                style={[
                  styles.blockOption,
                  {
                    backgroundColor: includeBlock
                      ? alpha(ds.tone.danger, 0.15)
                      : c.bg,
                    borderColor: includeBlock
                      ? ds.tone.danger
                      : c.border,
                  },
                ]}
              >
                <View style={styles.blockCheckbox}>
                  {includeBlock && (
                    <View style={[styles.checkboxChecked, { backgroundColor: ds.tone.danger }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.blockTextContainer}>
                  <Text style={[styles.blockLabel, { color: c.text }]}>
                    Block this user
                  </Text>
                  <Text style={[styles.blockDescription, { color: c.muted }]}>
                    You won&apos;t see their content and they won&apos;t be able to interact with you.
                  </Text>
                </View>
              </Pressable>
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
              disabled={submitting}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[
                styles.button,
                styles.buttonPrimary,
                {
                  backgroundColor: ds.tone.danger,
                  opacity: !selectedReason || submitting ? 0.5 : 1,
                },
              ]}
              disabled={!selectedReason || submitting}
            >
              <Text style={[styles.buttonText, { color: c.bg }]}>
                {submitting ? 'Submitting...' : 'Submit Report'}
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
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 20,
  },
  infoBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  reasonsGrid: {
    gap: 10,
  },
  reasonCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    gap: 4,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  reasonDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
  },
  textAreaText: {
    fontSize: 15,
    fontWeight: '600',
  },
  blockOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    gap: 12,
  },
  blockCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  blockTextContainer: {
    flex: 1,
    gap: 2,
  },
  blockLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  blockDescription: {
    fontSize: 13,
    lineHeight: 18,
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
