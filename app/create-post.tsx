// app/create-post.tsx
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View, Image, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../src/lib/stores/authStore";
import { createPost, type PostVisibility } from "../src/lib/stores/feedStore";
import { uploadPostPhoto } from "../src/lib/supabase/storage";
import type { ID } from "../src/lib/socialModel";
import { useThemeColors } from "../src/ui/theme";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";
import { KeyboardAwareScrollView } from "../src/ui/components/KeyboardAwareScrollView";

const ME: ID = "u_demo_me";

export default function CreatePostScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useUser();

  const userId = user?.id ?? ME;
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const remaining = useMemo(() => 240 - text.length, [text.length]);
  const canPublish = (text.trim().length >= 1 || photoUri) && remaining >= 0 && !isUploading;

  async function handlePickPhoto() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to add a photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick photo");
    }
  }

  function handleRemovePhoto() {
    setPhotoUri(null);
  }

  async function onPublish() {
    const clean = text.trim();
    if (!clean && !photoUri) return;

    setError(null);
    setIsUploading(true);

    try {
      let photoUrl: string | undefined;

      // Upload photo if present
      if (photoUri && user) {
        const uploadResult = await uploadPostPhoto(photoUri, user.id);
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || "Failed to upload photo");
        }
        photoUrl = uploadResult.url;
      }

      // Create post with or without photo
      createPost({
        authorUserId: userId,
        text: clean || "",
        visibility,
        photoUrl,
      });

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish post.");
      setIsUploading(false);
    }
  }

  return (
    <>
      <ScreenHeader
        title="Create Post"
        rightAction={
          <Pressable onPress={onPublish} disabled={!canPublish} style={{ paddingHorizontal: 8, paddingVertical: 4, opacity: canPublish ? 1 : 0.45 }}>
            <Text style={{ color: c.text, fontWeight: "900" }}>Post</Text>
          </Pressable>
        }
      />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
          {/* Photo Upload */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 18,
              padding: 14,
              gap: 10,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Photo</Text>

            {photoUri ? (
              <View style={{ gap: 10 }}>
                <Image
                  source={{ uri: photoUri }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                  }}
                />
                <Pressable
                  onPress={handleRemovePhoto}
                  style={{
                    alignSelf: "flex-start",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: "#fee2e2",
                    borderWidth: 1,
                    borderColor: "#fca5a5",
                  }}
                >
                  <Text style={{ color: "#991b1b", fontWeight: "700", fontSize: 12 }}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickPhoto}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.bg,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                  gap: 8,
                })}
              >
                <Text style={{ color: c.muted, fontSize: 24 }}>📷</Text>
                <Text style={{ color: c.text, fontWeight: "700" }}>Add Photo</Text>
              </Pressable>
            )}
          </View>

          {/* Visibility toggle */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 18,
              padding: 14,
              gap: 10,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Visibility</Text>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => setVisibility("public")}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: visibility === "public" ? c.bg : c.card,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: c.text, fontWeight: "900" }}>Public</Text>
              </Pressable>

              <Pressable
                onPress={() => setVisibility("friends")}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: visibility === "friends" ? c.bg : c.card,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: c.text, fontWeight: "900" }}>Friends</Text>
              </Pressable>
            </View>

            <Text style={{ color: c.muted, fontWeight: "700" }}>
              {visibility === "public"
                ? "Anyone can view and like (unless blocked)."
                : "Only friends can view and like. Perfect for training logs."}
            </Text>
          </View>

          {/* Composer */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 18,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Post</Text>
              <Text style={{ color: remaining < 0 ? c.text : c.muted, fontWeight: "900", fontSize: 12 }}>
                {remaining}
              </Text>
            </View>

            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="What's the move today?"
                placeholderTextColor={c.muted}
                style={{ color: c.text, fontWeight: "700", minHeight: 120 }}
                multiline
                autoCorrect
              />
            </View>

            {error ? <Text style={{ color: c.text, fontWeight: "900" }}>{error}</Text> : null}

            <Pressable
              onPress={onPublish}
              disabled={!canPublish}
              style={({ pressed }) => ({
                alignSelf: "flex-end",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
                opacity: !canPublish ? 0.45 : pressed ? 0.7 : 1,
              })}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={c.text} />
              ) : (
                <Text style={{ color: c.text, fontWeight: "900" }}>Publish</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </>
  );
}
