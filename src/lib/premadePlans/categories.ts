import type { CategoryInfo, PlanCategory } from './types';

export const PLAN_CATEGORIES: Record<PlanCategory, CategoryInfo> = {
  bodybuilding: {
    id: 'bodybuilding',
    name: 'Bodybuilding',
    description: 'Hypertrophy-focused programs for muscle growth and aesthetics',
    icon: '💪',
    color: '#FF6B6B',
    tagline: 'Build muscle, sculpt your physique',
  },
  
  calisthenics: {
    id: 'calisthenics',
    name: 'Calisthenics',
    description: 'Bodyweight training for strength, control, and mobility',
    icon: '🤸',
    color: '#4ECDC4',
    tagline: 'Master your bodyweight',
  },
  
  cardio: {
    id: 'cardio',
    name: 'Cardio',
    description: 'Conditioning and endurance training programs',
    icon: '🏃',
    color: '#45B7D1',
    tagline: 'Build your engine',
  },
  
  core: {
    id: 'core',
    name: 'Core',
    description: 'Targeted abdominal and core stability training',
    icon: '🔥',
    color: '#FFA07A',
    tagline: 'Forge an iron core',
  },
  
  strength: {
    id: 'strength',
    name: 'Strength',
    description: 'Progressive overload programs for maximal strength',
    icon: '⚡',
    color: '#9B59B6',
    tagline: 'Get brutally strong',
  },
};

export function getCategoryInfo(category: PlanCategory): CategoryInfo {
  return PLAN_CATEGORIES[category];
}

export function getAllCategories(): CategoryInfo[] {
  return Object.values(PLAN_CATEGORIES);
}
