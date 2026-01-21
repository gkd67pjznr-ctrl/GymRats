export type PlanCategory = 
  | 'bodybuilding'
  | 'calisthenics' 
  | 'cardio'
  | 'core'
  | 'strength';

export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type PlanSource = 'curated' | 'ai-generated' | 'user-created';

export interface PlanExercise {
  exerciseId: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds?: number;
  notes?: string;
}

export interface PremadePlan {
  id: string;
  name: string;
  category: PlanCategory;
  description: string;
  difficulty: PlanDifficulty;
  
  // Plan structure
  durationWeeks: number;
  daysPerWeek: number;
  exercises: PlanExercise[];
  
  // Metadata
  tags: string[];
  source: PlanSource;
  authorName?: string;
  createdAtMs: number;
  
  // AI-specific (optional)
  aiPrompt?: string;
  aiModel?: string;
}

export interface CategoryInfo {
  id: PlanCategory;
  name: string;
  description: string;
  icon: string; // emoji
  color: string; // hex color for UI theming
  tagline: string;
}
