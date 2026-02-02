// src/ui/components/Social/PostOptions.tsx
// More options menu for posts (report, block, etc.)

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';
import { ReportModal } from './ReportModal';
import { useUser } from '@/src/lib/stores/authStore';
import { useSocialStore } from '@/src/lib/stores/socialStore';
import type { WorkoutPost } from '@/src/lib/socialModel';
import { displayName } from '@/src/lib/userDirectory';

interface PostOptionsProps {
  visible: boolean;
  onClose: () => void;
  post: WorkoutPost;
}

export function PostOptions({ visible, onClose, post }: PostOptionsProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const user = useUser();
  const socialStore = useSocialStore();

  const [showReportPost, setShowReportPost] = useState(false);
  const [showReportUser, setShowReportUser] = useState(false);

  const isOwnPost = user?.id === post.authorUserId;
  const authorName = displayName(post.authorUserId);

  const handleReportPost = () => {
    onClose();
    setShowReportPost(true);
  };

  const handleReportUser = () => {
    onClose();
    setShowReportUser(true);
  };

  const handleBlockUser = async () => {
    onClose();

    // Confirm block action - proceed with the block
    try {
      await socialStore.blockUser(post.authorUserId);
    } catch (error) {
      console.error('[PostOptions] Failed to block user:', error);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            style={[styles.menu, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.menuContent}>
              {/* Header */}
              <View style={[styles.menuHeader, { borderBottomColor: c.border }]}>
                <Text style={[styles.menuTitle, { color: c.text }]}>
                  More options
                </Text>
              </View>

              {/* Options */}
              <View style={styles.options}>
                {/* Report Post */}
                <Pressable
                  onPress={handleReportPost}
                  style={({ pressed }) => [
                    styles.option,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[styles.optionIcon, { color: c.warn }]}>⚠️</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionLabel, { color: c.text }]}>
                      Report post
                    </Text>
                    <Text style={[styles.optionDescription, { color: c.muted }]}>
                      Report this post for violating community guidelines
                    </Text>
                  </View>
                </Pressable>

                {/* Report User */}
                {!isOwnPost && (
                  <Pressable
                    onPress={handleReportUser}
                    style={({ pressed }) => [
                      styles.option,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={[styles.optionIcon, { color: c.warn }]}>🚩</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionLabel, { color: c.text }]}>
                        Report {authorName}
                      </Text>
                      <Text style={[styles.optionDescription, { color: c.muted }]}>
                        Report this user for violating community guidelines
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* Block User */}
                {!isOwnPost && (
                  <Pressable
                    onPress={handleBlockUser}
                    style={({ pressed }) => [
                      styles.option,
                      styles.dangerOption,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={[styles.optionIcon, { color: ds.tone.danger }]}>🚫</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionLabel, { color: ds.tone.danger }]}>
                        Block {authorName}
                      </Text>
                      <Text style={[styles.optionDescription, { color: c.muted }]}>
                        You won&apos;t see their content anymore
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* Cancel */}
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.option,
                    styles.cancelOption,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[styles.cancelText, { color: c.text }]}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Report Post Modal */}
      <ReportModal
        visible={showReportPost}
        onClose={() => setShowReportPost(false)}
        postId={post.id}
        type="post"
      />

      {/* Report User Modal */}
      <ReportModal
        visible={showReportUser}
        onClose={() => setShowReportUser(false)}
        userId={post.authorUserId}
        userDisplayName={authorName}
        type="user"
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 34, // Safe area for bottom
  },
  menuContent: {
    gap: 0,
  },
  menuHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  options: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  dangerOption: {
    // Additional styling for dangerous actions
  },
  cancelOption: {
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },
  optionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
