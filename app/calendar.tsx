import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { startOfDayMs } from "../src/lib/workoutModel";
import { hydrateWorkoutStore, useWorkoutSessions } from "../src/lib/workoutStore";
import { useThemeColors } from "../src/ui/theme";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default function Calendar() {
  const c = useThemeColors();
  const router = useRouter();
  const sessions = useWorkoutSessions();
  const [cursor, setCursor] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate workout data from AsyncStorage
    hydrateWorkoutStore()
      .catch((err) => {
        console.error('Failed to load calendar data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const workoutDays = useMemo(() => {
    const set = new Set<number>();
    for (const s of sessions) set.add(startOfDayMs(s.startedAtMs));
    return set;
  }, [sessions]);

  const { grid } = useMemo(() => {
    const d = new Date(cursor);
    d.setDate(1);
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 Sun..6 Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number | null; dayMs?: number }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null });

    for (let day = 1; day <= daysInMonth; day++) {
      const ms = new Date(year, month, day).getTime();
      cells.push({ day, dayMs: startOfDayMs(ms) });
    }

    while (cells.length % 7 !== 0) cells.push({ day: null });

    return { grid: cells };
  }, [cursor]);

  const monthLabel = useMemo(() => {
    const d = new Date(cursor);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [cursor]);

  const weekdays = [
    { key: "sun", label: "S" },
    { key: "mon", label: "M" },
    { key: "tue", label: "T" },
    { key: "wed", label: "W" },
    { key: "thu", label: "T" },
    { key: "fri", label: "F" },
    { key: "sat", label: "S" },
  ];

  // Show loading spinner while hydrating
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: c.bg, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.muted, marginTop: 12, fontSize: 14 }}>
          Loading calendar...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Calendar</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable
          onPress={() => {
            const d = new Date(cursor);
            d.setMonth(d.getMonth() - 1);
            setCursor(d);
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900" }}>◀</Text>
        </Pressable>

        <Text style={{ color: c.text, fontWeight: "900" }}>{monthLabel}</Text>

        <Pressable
          onPress={() => {
            const d = new Date(cursor);
            d.setMonth(d.getMonth() + 1);
            setCursor(d);
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900" }}>▶</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {weekdays.map((w) => (
          <Text
           key={w.key}
           style={{ width: "14.28%", textAlign: "center", color: c.muted, fontWeight: "800" }}
          >                
           {w.label}
         </Text>                                                                                  
      ))}
      </View>

      <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 10 }}>
        {Array.from({ length: grid.length / 7 }).map((_, row) => (
          <View key={`${monthKey(cursor)}-r${row}`} style={{ flexDirection: "row" }}>
            {grid.slice(row * 7, row * 7 + 7).map((cell, idx) => {
              const isEmpty = cell.day == null;
              const hasWorkout = cell.dayMs != null && workoutDays.has(cell.dayMs);

              return (
                <View
                  key={`${row}-${idx}`}
                  style={{
                    width: "14.28%",
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isEmpty ? 0 : 1,
                  }}
                >
                  <Pressable
                    disabled={isEmpty}
                    onPress={() => {
                      if (!cell.dayMs) return;
                      router.push(`/calendar/day/${cell.dayMs}`);
                    }}
                    style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: hasWorkout ? 1 : 0,
                      borderColor: c.border,
                      backgroundColor: hasWorkout ? c.bg : "transparent",
                    }}
                  >
                    <Text style={{ color: c.text, fontWeight: hasWorkout ? "900" : "600" }}>
                      {cell.day ?? ""}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={{ color: c.muted }}>
        Tap any day to open day detail. Highlighted days have workouts.
      </Text>
    </View>
  );
}
