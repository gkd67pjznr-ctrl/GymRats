// app/journal.tsx
// Journal history and search screen

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "../src/ui/theme";
import { makeDesignSystem } from "../src/ui/designSystem";
import { useJournalEntries, useUser , addJournalEntry } from "../src/lib/stores";
import JournalEntryCard from "../src/ui/components/Journal/JournalEntryCard";
import JournalEntryModal from "../src/ui/components/Journal/JournalEntryModal";
import { createJournalEntry, getTodayDate } from "../src/lib/journalModel";

export default function JournalScreen() {
  const colors = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();

  const { entries, hydrated } = useJournalEntries();
  const user = useUser();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState({
    mood: undefined as { min?: number; max?: number } | undefined,
    energy: undefined as { min?: number; max?: number } | undefined,
    dateRange: undefined as { start: string; end: string } | undefined,
  });

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    if (!hydrated) return [];

    let result = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.text.toLowerCase().includes(query) ||
          entry.date.includes(query)
      );
    }

    // Mood filter
    if (filters.mood) {
      const { min, max } = filters.mood;
      result = result.filter((entry) => {
        if (entry.mood === undefined) return false;
        if (min !== undefined && entry.mood < min) return false;
        if (max !== undefined && entry.mood > max) return false;
        return true;
      });
    }

    // Energy filter
    if (filters.energy) {
      const { min, max } = filters.energy;
      result = result.filter((entry) => {
        if (entry.energy === undefined) return false;
        if (min !== undefined && entry.energy < min) return false;
        if (max !== undefined && entry.energy > max) return false;
        return true;
      });
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();

      result = result.filter((entry) => {
        const entryDate = new Date(entry.date).getTime();
        return entryDate >= startTime && entryDate <= endTime;
      });
    }

    return result;
  }, [entries, hydrated, searchQuery, filters]);

  // Statistics
  const statistics = useMemo(() => {
    const entriesWithMood = entries.filter((e) => e.mood !== undefined);
    const entriesWithEnergy = entries.filter((e) => e.energy !== undefined);
    const entriesWithSoreness = entries.filter(
      (e) => e.soreness && e.soreness.length > 0
    );

    const totalMood = entriesWithMood.reduce((sum, e) => sum + (e.mood || 0), 0);
    const totalEnergy = entriesWithEnergy.reduce(
      (sum, e) => sum + (e.energy || 0),
      0
    );

    return {
      totalEntries: entries.length,
      averageMood: entriesWithMood.length > 0 ? totalMood / entriesWithMood.length : 0,
      averageEnergy:
        entriesWithEnergy.length > 0 ? totalEnergy / entriesWithEnergy.length : 0,
      entriesWithSoreness: entriesWithSoreness.length,
    };
  }, [entries]);

  const handleAddEntry = () => {
    setShowModal(true);
  };

  const handleSaveEntry = async (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: string[];
    date?: string;
  }) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const journalEntry = createJournalEntry(
        user.id,
        data.date || getTodayDate(),
        data.text,
        undefined,
        data.mood,
        data.energy,
        data.soreness
      );
      addJournalEntry(journalEntry);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save journal entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({
      mood: undefined,
      energy: undefined,
      dateRange: undefined,
    });
  };

  const handleEntryPress = (entryId: string) => {
    router.push(`/journal-entry/${entryId}`);
  };

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Training Journal</Text>
        <TouchableOpacity onPress={handleAddEntry} style={styles.addButton}>
          <Text style={[styles.addButtonText, { color: ds.tone.accent }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {statistics.totalEntries}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Entries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {statistics.averageMood.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Avg Mood</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {statistics.averageEnergy.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Avg Energy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {statistics.entriesWithSoreness}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Soreness</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search journal entries..."
          placeholderTextColor={colors.muted}
          style={[
            styles.searchInput,
            {
              color: colors.text,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        />
        {(searchQuery || filters.mood || filters.energy || filters.dateRange) && (
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: colors.muted }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters (simplified for now) */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.filtersLabel, { color: colors.muted }]}>
          Filters: {searchQuery ? "Search" : ""}{" "}
          {filters.mood ? "Mood" : ""}{" "}
          {filters.energy ? "Energy" : ""}{" "}
          {filters.dateRange ? "Date Range" : ""}
          {!searchQuery && !filters.mood && !filters.energy && !filters.dateRange
            ? "None"
            : ""}
        </Text>
      </View>

      {/* Entries List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.muted }]}>
              {entries.length === 0
                ? "No journal entries yet. Add your first entry!"
                : "No entries match your search."}
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {filteredEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onPress={() => handleEntryPress(entry.id)}
                compact={false}
                showDate={true}
                showSessionLink={true}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Entry Modal */}
      <JournalEntryModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveEntry}
        title="New Journal Entry"
        submitLabel="Save Entry"
        date={getTodayDate()}
        allowDateChange={true}
        isLoading={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  entriesList: {
    gap: 12,
  },
});