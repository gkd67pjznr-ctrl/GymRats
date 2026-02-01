// app/profile/index.tsx
// Profile section index - redirects to main profile screen

import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useThemeColors } from "@/src/ui/theme";

export default function ProfileIndex() {
  const router = useRouter();
  const c = useThemeColors();

  useEffect(() => {
    // Redirect to the main profile screen
    router.replace("/(tabs)/profile");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={c.text} />
    </View>
  );
}