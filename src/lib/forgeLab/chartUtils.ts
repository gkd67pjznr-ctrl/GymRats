/**
 * Forge Lab Chart Utilities - Helper functions for chart data processing
 */
import { ChartDataPoint, MuscleGroup } from './types';

/**
 * Process data for line charts
 */
export const processLineChartData = (data: ChartDataPoint[]): { labels: string[]; data: number[] } => {
  const labels = data.map(point => point.date);
  const values = data.map(point => point.value);
  return { labels, data: values };
};

/**
 * Process data for bar charts
 */
export const processBarChartData = (data: Record<string, number>): { labels: string[]; data: number[] } => {
  const labels = Object.keys(data);
  const values = Object.values(data);
  return { labels, data: values };
};

/**
 * Get color for muscle group
 */
export const getMuscleGroupColor = (muscleGroup: MuscleGroup): string => {
  const colorMap: Record<MuscleGroup, string> = {
    chest: '#FF6B6B',
    back: '#4ECDC4',
    shoulders: '#45B7D1',
    legs: '#96CEB4',
    arms: '#FFEAA7',
    core: '#DDA0DD',
    upper_chest: '#FF7675',
    lower_chest: '#FD79A8',
    front_delt: '#74B9FF',
    side_delt: '#0984E3',
    rear_delt: '#00B894',
    lats: '#00CEC9',
    mid_back: '#6C5CE7',
    traps: '#A29BFE',
    biceps: '#FDCB6E',
    triceps: '#E17055',
    forearms: '#636E72',
    quads: '#00B894',
    hamstrings: '#00CEC9',
    glutes: '#6C5CE7',
    calves: '#A29BFE',
    abs: '#FDCB6E',
    obliques: '#E17055'
  };

  return colorMap[muscleGroup] || '#95A5A6';
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format week for display
 */
export const formatWeek = (weekString: string): string => {
  // weekString format: "2026-W04"
  const [year, week] = weekString.split('-W');
  return `W${week} ${year}`;
};

/**
 * Get date range in days
 */
export const getDateRangeInDays = (range: string): number => {
  const ranges: Record<string, number> = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'ALL': 3650 // 10 years
  };

  return ranges[range] || 90;
};

/**
 * Filter data by date range
 */
export const filterDataByDateRange = (data: ChartDataPoint[], range: string): ChartDataPoint[] => {
  if (range === 'ALL') {
    return data;
  }

  const days = getDateRangeInDays(range);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter(point => new Date(point.date) >= cutoffDate);
};