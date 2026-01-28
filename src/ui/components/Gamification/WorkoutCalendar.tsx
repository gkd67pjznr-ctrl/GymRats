/**
 * WorkoutCalendar Component
 *
 * GitHub-style contribution calendar showing workout activity over the last 12 weeks.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type { WorkoutCalendarEntry } from '@/src/lib/gamification/types';
import { getWorkoutIntensity } from '@/src/lib/gamification/streak/tracker';

interface WorkoutCalendarProps {
  calendar: WorkoutCalendarEntry[];
  weeks?: number;
  cellSize?: number;
  style?: any;
}

const INTENSITY_COLORS: Record<number, string> = {
  0: '#1A1A1F',
  1: '#1B3A25',
  2: '#205B35',
  3: '#257C45',
  4: '#2A9D55',
};

export function WorkoutCalendar({
  calendar,
  weeks = 12,
  cellSize = 12,
  style,
}: WorkoutCalendarProps) {
  const ds = makeDesignSystem('dark', 'toxic');

  const grid = useMemo(() => {
    return generateCalendarGrid(calendar, weeks);
  }, [calendar, weeks]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: ds.tone.muted }]}>
          Last {weeks} weeks
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
              <Text
                key={i}
                style={[styles.dayLabel, { color: ds.tone.muted, fontSize: 9 }]}
              >
                {label}
              </Text>
            ))}
          </View>

          {/* Calendar cells */}
          <View style={styles.weeksContainer}>
            {grid.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {week.map((day, dayIndex) => {
                  const intensity = day.intensity;
                  const bgColor = INTENSITY_COLORS[intensity];

                  return (
                    <View
                      key={`${weekIndex}-${dayIndex}`}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: bgColor,
                          marginRight: dayIndex === 6 ? 4 : 2,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: ds.tone.muted, fontSize: 10 }]}>
          Less
        </Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.legendCell,
              {
                backgroundColor: INTENSITY_COLORS[level],
                width: 10,
                height: 10,
              },
            ]}
          />
        ))}
        <Text style={[styles.legendLabel, { color: ds.tone.muted, fontSize: 10 }]}>
          More
        </Text>
      </View>
    </View>
  );
}

interface DayCell {
  intensity: 0 | 1 | 2 | 3 | 4;
}

function generateCalendarGrid(
  calendar: WorkoutCalendarEntry[],
  weeks: number
): DayCell[][] {
  const today = new Date();
  const grid: DayCell[][] = [];

  // Create a map of date -> intensity for quick lookup
  const calendarMap = new Map<string, { count: number; xp: number }>();
  for (const entry of calendar) {
    calendarMap.set(entry.date, { count: entry.count, xp: entry.xp });
  }

  // Start from (weeks * 7) days ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7) - 1);
  startDate.setHours(0, 0, 0, 0);

  // Adjust to previous Monday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  // Generate grid: 7 days x N weeks
  for (let week = 0; week < weeks; week++) {
    const weekDays: DayCell[] = [];

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7 + day);

      const dateStr = currentDate.toISOString().split('T')[0];
      const entry = calendarMap.get(dateStr);

      const intensity = entry
        ? getWorkoutIntensity(entry.count, entry.xp)
        : 0;

      weekDays.push({ intensity });
    }

    grid.push(weekDays);
  }

  return grid;
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    marginBottom: 4,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  grid: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 8,
    gap: 2,
  },
  dayLabel: {
    height: 12,
    lineHeight: 12,
    fontWeight: '600',
  },
  weeksContainer: {
    flexDirection: 'row',
  },
  week: {
    gap: 2,
  },
  cell: {
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  legendLabel: {
    fontWeight: '600',
  },
  legendCell: {
    borderRadius: 2,
  },
});
