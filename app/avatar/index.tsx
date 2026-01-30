// app/avatar/index.tsx
// Avatar main screen route

import { View, StyleSheet } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import AvatarScreen from "../../src/ui/screens/AvatarScreen";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";

export default function AvatarRoute() {
  const c = useThemeColors();

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <AvatarScreen />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});