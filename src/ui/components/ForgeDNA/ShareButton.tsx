import * as React from "react";
import { View, Text, Pressable, StyleSheet, Alert, Modal, TextInput } from "react-native";
import { makeDesignSystem } from "../../../ui/designSystem";
import { useThemeColors } from "../../../ui/theme";

interface ShareButtonProps {
  onShare: (caption: string, privacy: 'public' | 'friends') => Promise<void>;
  isSharing: boolean;
  shareError: string | null;
}

export function ShareButton({ onShare, isSharing, shareError }: ShareButtonProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const [showShareModal, setShowShareModal] = React.useState(false);
  const [caption, setCaption] = React.useState("Check out my Forge DNA! 🧬");
  const [privacy, setPrivacy] = React.useState<'public' | 'friends'>('public');

  const handleSharePress = () => {
    setShowShareModal(true);
  };

  const handleShareSubmit = async () => {
    await onShare(caption, privacy);
    setShowShareModal(false);
    setCaption("Check out my Forge DNA! 🧬");
    setPrivacy('public');
  };

  const handleCancel = () => {
    setShowShareModal(false);
    setCaption("Check out my Forge DNA! 🧬");
    setPrivacy('public');
  };

  React.useEffect(() => {
    if (shareError) {
      Alert.alert("Error", shareError);
    }
  }, [shareError]);

  return (
    <>
      <Pressable
        onPress={handleSharePress}
        disabled={isSharing}
        style={[
          styles.shareButton,
          {
            backgroundColor: isSharing ? c.border : ds.tone.accent,
            opacity: isSharing ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.shareButtonText, { color: c.bg }]}>
          {isSharing ? "Sharing..." : "Share to Feed"}
        </Text>
      </Pressable>

      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Share to Feed</Text>

            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={c.muted}
              multiline
              numberOfLines={3}
              style={[styles.captionInput, {
                color: c.text,
                backgroundColor: c.bg,
                borderColor: c.border,
              }]}
            />

            <View style={styles.privacySection}>
              <Text style={[styles.privacyLabel, { color: c.text }]}>Privacy:</Text>
              <View style={styles.privacyOptions}>
                <Pressable
                  onPress={() => setPrivacy('public')}
                  style={[
                    styles.privacyOption,
                    privacy === 'public' && { backgroundColor: ds.tone.accent },
                  ]}
                >
                  <Text style={[
                    styles.privacyOptionText,
                    {
                      color: privacy === 'public' ? c.bg : c.text
                    }
                  ]}>
                    Public
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setPrivacy('friends')}
                  style={[
                    styles.privacyOption,
                    privacy === 'friends' && { backgroundColor: ds.tone.accent },
                  ]}
                >
                  <Text style={[
                    styles.privacyOptionText,
                    {
                      color: privacy === 'friends' ? c.bg : c.text
                    }
                  ]}>
                    Friends
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleCancel}
                style={[styles.cancelButton, { backgroundColor: c.bg, borderColor: c.border }]}
              >
                <Text style={[styles.cancelButtonText, { color: c.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleShareSubmit}
                disabled={isSharing}
                style={[
                  styles.shareButtonModal,
                  {
                    backgroundColor: isSharing ? c.border : ds.tone.accent,
                    opacity: isSharing ? 0.5 : 1,
                  }
                ]}
              >
                <Text style={[styles.shareButtonModalText, { color: c.bg }]}>
                  {isSharing ? "Sharing..." : "Share"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
    minHeight: 80,
  },
  privacySection: {
    marginBottom: 20,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  privacyOptions: {
    flexDirection: "row",
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  privacyOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  shareButtonModal: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  shareButtonModalText: {
    fontSize: 16,
    fontWeight: "700",
  },
});