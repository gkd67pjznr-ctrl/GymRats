// src/ui/components/Hangout/CreateRoomModal.tsx
// Modal for creating a new hangout room

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import type { RoomTheme } from "../../../lib/hangout/hangoutTypes";

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, theme: string) => Promise<boolean>;
  loading?: boolean;
}

// Available room themes
const ROOM_THEMES: RoomTheme[] = [
  {
    id: "default",
    name: "Default Gym",
    description: "Classic dark gym aesthetic",
    backgroundColor: "#0a0a0a",
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "Cyberpunk-inspired neon lights",
    backgroundColor: "#0a0a1a",
  },
  {
    id: "nature",
    name: "Zen Garden",
    description: "Peaceful natural retreat",
    backgroundColor: "#0a1a0a",
  },
  {
    id: "industrial",
    name: "Iron Factory",
    description: "Raw industrial warehouse",
    backgroundColor: "#0d0d0d",
  },
];

export function CreateRoomModal(props: CreateRoomModalProps) {
  const { visible, onClose, onCreateRoom, loading = false } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const [roomName, setRoomName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(ROOM_THEMES[0].id);

  const handleCreateRoom = async () => {
    if (roomName.trim().length === 0) return;

    const success = await onCreateRoom(roomName.trim(), selectedTheme);
    if (success) {
      setRoomName("");
      setSelectedTheme(ROOM_THEMES[0].id);
      onClose();
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
              Create Your Hangout
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: c.muted }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Room Name Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>Room Name</Text>
              <TextInput
                value={roomName}
                onChangeText={setRoomName}
                placeholder="My Gym Hangout"
                placeholderTextColor={c.muted}
                maxLength={30}
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
                {roomName.length}/30 characters
              </Text>
            </View>

            {/* Theme Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.text }]}>Theme</Text>
              <View style={styles.themesGrid}>
                {ROOM_THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <Pressable
                      key={theme.id}
                      onPress={() => setSelectedTheme(theme.id)}
                      style={[
                        styles.themeCard,
                        {
                          backgroundColor: isSelected
                            ? ds.tone.accent
                            : c.bg,
                          borderColor: isSelected
                            ? ds.tone.accent
                            : c.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.themePreview,
                          { backgroundColor: theme.backgroundColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.themeName,
                          {
                            color: isSelected ? c.bg : c.text,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {theme.name}
                      </Text>
                      <Text
                        style={[
                          styles.themeDescription,
                          {
                            color: isSelected ? c.bg : c.muted,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {theme.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Info Text */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: c.bg, borderColor: c.border },
              ]}
            >
              <Text style={[styles.infoText, { color: c.muted }]}>
                Your hangout room is where your avatar lives. Friends can visit
                and you can decorate it together!
              </Text>
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
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCreateRoom}
              style={[
                styles.button,
                styles.buttonPrimary,
                {
                  backgroundColor: ds.tone.accent,
                  opacity: roomName.trim().length === 0 || loading ? 0.5 : 1,
                },
              ]}
              disabled={roomName.trim().length === 0 || loading}
            >
              <Text style={[styles.buttonText, { color: c.bg }]}>
                {loading ? "Creating..." : "Create Room"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  helper: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  themesGrid: {
    gap: 12,
  },
  themeCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  themePreview: {
    height: 60,
    borderRadius: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "700",
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonSecondary: {},
  buttonPrimary: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
