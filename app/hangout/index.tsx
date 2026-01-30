// app/hangout/index.tsx
// Hangout room screen route

import { View, StyleSheet } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import HangoutScreen from "../../src/ui/screens/HangoutScreen";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";

export default function HangoutRoute() {
  const c = useThemeColors();

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <HangoutScreen />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});