import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "../src/ui/theme";
import { useWorkoutSessions } from "../src/lib/workoutStore";
import { startOfDayMs } from "../src/lib/workoutModel";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default function Calendar() {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();
  const [cursor, setCursor] = useState(() => new Date());

  const workoutDays = useMemo(() => {
    const set = new Set<number>();
