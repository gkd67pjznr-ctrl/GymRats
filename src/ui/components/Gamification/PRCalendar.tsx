/**
 * PRCalendar Component
 *
 * GitHub-style contribution calendar showing PR activity over the last 12 weeks.
 * Color intensity represents number of PRs achieved that day.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type { WorkoutSession } from '@/src/lib/workoutModel';

interface PRCalendarProps {
  sessions: WorkoutSession[];
  weeks?: number;
  cellSize?: number;
  style?: any;
  onDayPress?: (date: string, prCount: number) => void;
}

// Gold-themed colors for PR intensity (0 = none, 4 = many PRs)
const PR_INTENSITY_COLORS: Record<number, string> = {
  0: '#1A1A1F',   // No PRs - dark
  1: '#3D2E1A',   // 1 PR - bronze tint
  2: '#5C4A2A',   // 2 PRs - gold tint
  3: '#7B663A',   // 3 PRs - bright gold
  4: '#FFD700',   // 4+ PRs - pure gold
};

interface DayData {
  date: string;
  prCount: number;
  intensity: number;
}

/**
 * Calculate PR intensity level (0-4) based on PR count
 */
function getPRIntensity(prCount: number): number {
  if (prCount === 0) return 0;
  if (prCount === 1) return 1;
  if (prCount === 2) return 2;
  if (prCount <= 4) return 3;
  return 4;
}

/**
 * Generate calendar grid from workout sessions
 */
function generatePRCalendarGrid(sessions: WorkoutSession[], weeks: number): DayData[][] {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (weeks * 7) + 1);

  // Build a map of date -> PR count
  const prByDate: Record<string, number> = {};

  for (const session of sessions) {
    const date = new Date(session.startedAtMs);
    const dateKey = date.toISOString().split('T')[0];
    const prCount = session.prCount ?? 0;
    prByDate[dateKey] = (prByDate[dateKey] ?? 0) + prCount;
  }

  // Generate grid (weeks x 7 days)
  const grid: DayData[][] = [];
  const currentDate = new Date(startDate);

  // Adjust to start on Monday
  const dayOfWeek = currentDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + mondayOffset);

  for (let week = 0; week < weeks; week++) {
    const weekData: DayData[] = [];

    for (let day = 0; day < 7; day++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const prCount = prByDate[dateKey] ?? 0;

      weekData.push({
        date: dateKey,
        prCount,
        intensity: getPRIntensity(prCount),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    grid.push(weekData);
  }

  return grid;
}

export function PRCalendar({
  sessions,
  weeks = 12,
  cellSize = 12,
  style,
  onDayPress,
}: PRCalendarProps) {
  const ds = makeDesignSystem('dark', 'toxic');

  const grid = useMemo(() => {
    return generatePRCalendarGrid(sessions, weeks);
  }, [sessions, weeks]);

  // Calculate total PRs in period
  const totalPRs = useMemo(() => {
    return grid.flat().reduce((sum, day) => sum + day.prCount, 0);
  }, [grid]);

  // Count days with PRs
  const daysWithPRs = useMemo(() => {
    return grid.flat().filter(day => day.prCount > 0).length;
  }, [grid]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: ds.tone.muted }]}>
          PR Activity • Last {weeks} weeks
        </Text>
        <Text style={[styles.statsText, { color: '#FFD700' }]}>
          {totalPRs} PRs on {daysWithPRs} days
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
                  const bgColor = PR_INTENSITY_COLORS[intensity];

                  return (
                    <Pressable
                      key={`${weekIndex}-${dayIndex}`}
                      onPress={() => onDayPress?.(day.date, day.prCount)}
                      style={[
                        styles.cell,
                        {
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: bgColor,
                          marginRight: dayIndex === 6 ? 4 : 2,
                          borderWidth: day.prCount > 0 ? 1 : 0,
                          borderColor: day.prCount >= 3 ? '#FFD700' : '#5C4A2A',
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
                backgroundColor: PR_INTENSITY_COLORS[level],
                borderWidth: level > 0 ? 1 : 0,
                borderColor: level >= 3 ? '#FFD700' : '#5C4A2A',
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

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 6,
    justifyContent: 'space-around',
  },
  dayLabel: {
    height: 12,
    textAlignVertical: 'center',
  },
  weeksContainer: {
    flexDirection: 'row',
  },
  week: {
    flexDirection: 'column',
  },
  cell: {
    borderRadius: 2,
    marginBottom: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  legendLabel: {
    marginHorizontal: 4,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

export default PRCalendar;
