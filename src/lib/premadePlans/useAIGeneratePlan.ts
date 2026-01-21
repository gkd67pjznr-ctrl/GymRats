import { useState, useCallback } from "react";
import type { PremadePlan, PlanCategory, PlanDifficulty } from "./types";
import { addPlan } from "./store";

/**
 * AI plan generation parameters
 */
export interface AIGenerationParams {
  category: PlanCategory;
  difficulty: PlanDifficulty;
  daysPerWeek: number;
  durationWeeks: number;
  goals?: string; // User's custom goals/notes
  equipment?: string[]; // Available equipment
  injuries?: string; // Injuries or limitations
}

/**
 * Generation state
 */
export type GenerationState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; plan: PremadePlan }
  | { status: 'error'; error: string };

/**
 * Hook for AI plan generation
 * 
 * This uses Claude's API to generate custom workout plans
 * based on user parameters.
 */
export function useAIGeneratePlan() {
  const [state, setState] = useState<GenerationState>({ status: 'idle' });

  const generatePlan = useCallback(async (params: AIGenerationParams) => {
    setState({ status: 'loading' });

    try {
      const plan = await callAIGenerator(params);
      
      // Save generated plan to store
      addPlan(plan);
      
      setState({ status: 'success', plan });
      return plan;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to generate plan';
      setState({ status: 'error', error });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    state,
    generatePlan,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}

/**
 * Call AI to generate a workout plan
 * 
 * Uses Anthropic API (available in claude.ai artifacts)
 * This will work in your app since it runs in the Claude environment
 */
async function callAIGenerator(params: AIGenerationParams): Promise<PremadePlan> {
  const prompt = buildPrompt(params);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text from response
    const text = data.content
      .filter((item: any) => item.type === "text")
      .map((item: any) => item.text)
      .join("\n");

    // Parse JSON response
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const generatedData = JSON.parse(cleanText);

    // Convert to PremadePlan format
    const plan: PremadePlan = {
      id: `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: generatedData.name,
      category: params.category,
      description: generatedData.description,
      difficulty: params.difficulty,
      durationWeeks: params.durationWeeks,
      daysPerWeek: params.daysPerWeek,
      exercises: generatedData.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        targetSets: ex.sets,
        targetRepsMin: ex.repsMin,
        targetRepsMax: ex.repsMax,
        restSeconds: ex.restSeconds || 90,
        notes: ex.notes,
      })),
      tags: generatedData.tags || [],
      source: 'ai-generated',
      createdAtMs: Date.now(),
      aiPrompt: prompt,
      aiModel: 'claude-sonnet-4',
    };

    return plan;
  } catch (err) {
    console.error('AI generation error:', err);
    throw new Error('Failed to generate plan. Please try again.');
  }
}

/**
 * Build AI prompt for plan generation
 */
function buildPrompt(params: AIGenerationParams): string {
  const { category, difficulty, daysPerWeek, durationWeeks, goals, equipment, injuries } = params;

  return `You are an expert fitness coach. Generate a ${difficulty} ${category} workout plan.

REQUIREMENTS:
- Category: ${category}
- Difficulty: ${difficulty}
- Days per week: ${daysPerWeek}
- Duration: ${durationWeeks} weeks
${goals ? `- User goals: ${goals}` : ''}
${equipment ? `- Available equipment: ${equipment.join(', ')}` : ''}
${injuries ? `- Injuries/limitations: ${injuries}` : ''}

EXERCISE IDs (use these exact IDs):
- bench-press, squat, deadlift, overhead-press, bent-over-row
- pull-up, push-up, dip, lat-pulldown, leg-press
- incline-dumbbell-press, bicep-curl, tricep-pushdown, lateral-raise
- crunch, plank, leg-raise, russian-twist, bicycle-crunch
- treadmill-run, rowing-machine, assault-bike, battle-ropes, burpee
- kettlebell-swing, box-jump, jump-rope, mountain-climber

RESPONSE FORMAT (JSON only, no markdown):
{
  "name": "Plan name (max 40 chars)",
  "description": "Detailed description (2-3 sentences)",
  "exercises": [
    {
      "exerciseId": "bench-press",
      "sets": 4,
      "repsMin": 8,
      "repsMax": 12,
      "restSeconds": 90,
      "notes": "Optional coaching cue"
    }
  ],
  "tags": ["tag1", "tag2"]
}

Generate a complete, balanced ${category} plan for ${daysPerWeek} days/week. Include 5-8 exercises per workout day.`;
}
