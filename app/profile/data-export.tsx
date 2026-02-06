// app/profile/data-export.tsx
// Data Export/Import screen for workout data portability

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

import { useThemeColors } from "@/src/ui/theme";
import {
  exportAndShareCurrentUserWorkouts,
  type FileExportResult,
} from "@/src/lib/csvExport";
import { pickAndImportCSV } from "@/src/lib/csvImport";
import type { CSVImportResult } from "@/src/lib/csvSchema";
import {
  getWorkoutSessions,
  getImportedWorkoutSessions,
  getNativeWorkoutSessions,
} from "@/src/lib/stores/workoutStore";
import { rebuildPRsFromHistory } from "@/src/lib/stores/prStore";

type OperationStatus = "idle" | "loading" | "success" | "error";

export default function DataExportScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [exportStatus, setExportStatus] = useState<OperationStatus>("idle");
  const [importStatus, setImportStatus] = useState<OperationStatus>("idle");
  const [lastExportResult, setLastExportResult] = useState<FileExportResult | null>(null);
  const [lastImportResult, setLastImportResult] = useState<CSVImportResult | null>(null);

  // Get session counts for display
  const allSessions = getWorkoutSessions();
  const nativeSessions = getNativeWorkoutSessions();
  const importedSessions = getImportedWorkoutSessions();

  const totalSets = allSessions.reduce((acc, s) => acc + s.sets.length, 0);
  const nativeSets = nativeSessions.reduce((acc, s) => acc + s.sets.length, 0);

  const handleExport = async () => {
    setExportStatus("loading");
    setLastExportResult(null);

    try {
      const result = await exportAndShareCurrentUserWorkouts();
      setLastExportResult(result);
      setExportStatus(result.success ? "success" : "error");

      if (!result.success) {
        Alert.alert("Export Failed", result.error || "Unknown error occurred");
      }
    } catch (err) {
      setExportStatus("error");
      Alert.alert(
        "Export Error",
        err instanceof Error ? err.message : "Failed to export data"
      );
    }
  };

  const handleImport = async () => {
    // Confirm with user
    Alert.alert(
      "Import Workout Data",
      "Select a CSV file to import. Imported workouts will appear in your history but will NOT affect your ranks or PR detection.\n\nSupported formats:\n- GymRats CSV export\n- Strong app export\n- Hevy app export",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select File",
          onPress: async () => {
            setImportStatus("loading");
            setLastImportResult(null);

            try {
              const result = await pickAndImportCSV();
              setLastImportResult(result);
              setImportStatus(result.success ? "success" : "error");

              if (result.success && result.sessionsImported > 0) {
                // Rebuild PR baselines after import (they'll filter out imported sessions)
                rebuildPRsFromHistory();

                Alert.alert(
                  "Import Complete",
                  `Successfully imported ${result.sessionsImported} workouts with ${result.setsImported} sets.${
                    result.sessionsSkipped > 0
                      ? `\n\nSkipped ${result.sessionsSkipped} duplicate sessions.`
                      : ""
                  }${
                    result.warnings.length > 0
                      ? `\n\nNotes:\n${result.warnings.slice(0, 3).join("\n")}`
                      : ""
                  }`
                );
              } else if (!result.success) {
                const errorMsg = result.errors.length > 0
                  ? result.errors.map(e => `Line ${e.line}: ${e.message}`).slice(0, 3).join("\n")
                  : "Unknown error";
                Alert.alert("Import Failed", errorMsg);
              } else {
                Alert.alert(
                  "No Data Imported",
                  result.warnings.length > 0
                    ? result.warnings.join("\n")
                    : "The file contained no valid workout data"
                );
              }
            } catch (err) {
              setImportStatus("error");
              Alert.alert(
                "Import Error",
                err instanceof Error ? err.message : "Failed to import data"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Data Export & Import",
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 32,
          gap: 20,
        }}
      >
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: "900" }}>
            Your Data, Your Control
          </Text>
          <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20 }}>
            Export your workout history as a portable CSV file, or import data
            from other apps. You should never feel trapped in any app.
          </Text>
        </View>

        {/* Stats Overview */}
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
            gap: 12,
          }}
        >
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
            Your Data Summary
          </Text>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: c.accent, fontSize: 28, fontWeight: "900" }}>
                {nativeSessions.length}
              </Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>
                Native Workouts
              </Text>
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: c.accent, fontSize: 28, fontWeight: "900" }}>
                {nativeSets}
              </Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>Total Sets</Text>
            </View>

            {importedSessions.length > 0 && (
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: c.muted, fontSize: 28, fontWeight: "900" }}>
                  {importedSessions.length}
                </Text>
                <Text style={{ color: c.muted, fontSize: 12 }}>
                  Imported
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Export Section */}
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
            gap: 12,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "700" }}>
              Export Data
            </Text>
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 18 }}>
              Download all your workout data as a CSV file. Compatible with
              spreadsheet apps and can be re-imported later.
            </Text>
          </View>

          <Pressable
            onPress={handleExport}
            disabled={exportStatus === "loading" || allSessions.length === 0}
            style={({ pressed }) => ({
              backgroundColor: allSessions.length === 0 ? c.muted : c.accent,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            {exportStatus === "loading" ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "900" }}>
                {allSessions.length === 0
                  ? "No Data to Export"
                  : "Export All Workouts"}
              </Text>
            )}
          </Pressable>

          {lastExportResult && lastExportResult.success && (
            <View
              style={{
                backgroundColor: c.bg,
                borderRadius: 8,
                padding: 12,
                gap: 4,
              }}
            >
              <Text style={{ color: c.accent, fontSize: 14, fontWeight: "600" }}>
                Export Successful
              </Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                {lastExportResult.sessionsExported} workouts,{" "}
                {lastExportResult.setsExported} sets exported
              </Text>
            </View>
          )}
        </View>

        {/* Import Section */}
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
            gap: 12,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "700" }}>
              Import Data
            </Text>
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 18 }}>
              Import workout data from CSV files. Supports GymRats exports,
              Strong, and Hevy formats.
            </Text>
          </View>

          <Pressable
            onPress={handleImport}
            disabled={importStatus === "loading"}
            style={({ pressed }) => ({
              backgroundColor: c.bg,
              borderWidth: 2,
              borderColor: c.accent,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            {importStatus === "loading" ? (
              <ActivityIndicator color={c.accent} />
            ) : (
              <Text style={{ color: c.accent, fontSize: 16, fontWeight: "900" }}>
                Select CSV File
              </Text>
            )}
          </Pressable>

          {lastImportResult && lastImportResult.success && lastImportResult.sessionsImported > 0 && (
            <View
              style={{
                backgroundColor: c.bg,
                borderRadius: 8,
                padding: 12,
                gap: 4,
              }}
            >
              <Text style={{ color: c.accent, fontSize: 14, fontWeight: "600" }}>
                Import Successful
              </Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                {lastImportResult.sessionsImported} workouts,{" "}
                {lastImportResult.setsImported} sets imported
              </Text>
            </View>
          )}
        </View>

        {/* Important Notes */}
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
            gap: 12,
          }}
        >
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
            Important Notes
          </Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: c.accent }}>1.</Text>
              <Text style={{ color: c.muted, fontSize: 13, flex: 1, lineHeight: 18 }}>
                <Text style={{ fontWeight: "600", color: c.text }}>
                  Imported data is flagged separately.
                </Text>{" "}
                It appears in your workout history but does NOT count towards
                your ranks, PRs, or gamification progress.
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: c.accent }}>2.</Text>
              <Text style={{ color: c.muted, fontSize: 13, flex: 1, lineHeight: 18 }}>
                <Text style={{ fontWeight: "600", color: c.text }}>
                  Your ranks are earned honestly.
                </Text>{" "}
                Only workouts you log directly in GymRats count towards your
                GymRank scores and leaderboard position.
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: c.accent }}>3.</Text>
              <Text style={{ color: c.muted, fontSize: 13, flex: 1, lineHeight: 18 }}>
                <Text style={{ fontWeight: "600", color: c.text }}>
                  Duplicate prevention.
                </Text>{" "}
                If you try to import the same data twice, duplicate sessions will
                be automatically skipped.
              </Text>
            </View>
          </View>
        </View>

        {/* Supported Formats */}
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
            gap: 12,
          }}
        >
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>
            Supported Import Formats
          </Text>

          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: c.accent,
                }}
              />
              <Text style={{ color: c.text, fontSize: 14, fontWeight: "600" }}>
                GymRats CSV
              </Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                (full round-trip support)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: c.accent,
                }}
              />
              <Text style={{ color: c.text, fontSize: 14, fontWeight: "600" }}>
                Strong App
              </Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                (Date, Exercise, Weight, Reps)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: c.accent,
                }}
              />
              <Text style={{ color: c.text, fontSize: 14, fontWeight: "600" }}>
                Hevy App
              </Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                (similar to Strong format)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
