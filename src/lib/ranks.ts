// src/lib/ranks.ts
import type { VerifiedTop } from "../data/rankTops";

export type RankConfig = {
  ranksCount: number; // e.g. 20
  curve: number; // >1 makes early ranks easier, late ranks harder (recommended 1.6–2.0)
};

export const DEFAULT_RANK_CONFIG: RankConfig = {
  ranksCount: 20,
  curve: 1.75,
};

/**
 * Debug/app-friendly ladder shape (what the debug screen wants).
 * scoreThresholds are 0..1, ascending, length=numRanks (last should be 1).
 */
export type RankLadder = {
  exerciseId: string;
  version: number;
  numRanks: number;
  topStandardE1RMKg: number;
  scoreThresholds: number[];
};

/**
 * Minimal PR summary shape the scorer needs.
 * (Matches what your app tends to track: best e1RM.)
 */
export type ExercisePRSummary = {
  userId: string;
  exerciseId: string;
  bestE1RMKg: number;
  bestWeightKg?: number;
  bestRepsAtWeight?: Record<string, number>;
  lastUpdatedMs?: number;
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * Returns an array of thresholds in kg, length = ranksCount.
 * Index 0 = Rank 1 threshold (lowest)
 * Index ranksCount-1 = top rank threshold (highest) ~= topE1RMKg
 */
export function buildRankThresholdsKg(topE1RMKg: number, cfg: RankConfig = DEFAULT_RANK_CONFIG): number[] {
  const n = cfg.ranksCount;
  const gamma = cfg.curve;

  // Rank i (1..n) threshold:
  // top * (i/n)^gamma
  const out: number[] = [];
  for (let i = 1; i <= n; i++) {
    const t = topE1RMKg * Math.pow(i / n, gamma);
    out.push(t);
  }
  return out;
}

/**
 * Given an achieved e1RM (kg), returns:
 * - rankIndex: 0..n-1 (0 = Rank 1, n-1 = top rank)
 * - progressToNext: 0..1 (how close you are to next rank)
 */
export function getRankFromE1RMKg(e1rmKg: number, thresholdsKg: number[]) {
  const n = thresholdsKg.length;

  if (e1rmKg <= thresholdsKg[0]) {
    const prog = clamp01(e1rmKg / thresholdsKg[0]);
    return { rankIndex: 0, progressToNext: prog };
  }

  for (let i = 0; i < n; i++) {
    if (e1rmKg < thresholdsKg[i]) {
      const prev = thresholdsKg[i - 1];
      const next = thresholdsKg[i];
      const prog = clamp01((e1rmKg - prev) / (next - prev));
      return { rankIndex: i - 1, progressToNext: prog };
    }
  }

  // At or above top
  return { rankIndex: n - 1, progressToNext: 1 };
}

/**
 * Convenience: build thresholds for every verified top lift.
 */
export function buildAllThresholds(tops: VerifiedTop[], cfg: RankConfig = DEFAULT_RANK_CONFIG) {
  const map: Record<string, number[]> = {};
  for (const t of tops) map[t.liftId] = buildRankThresholdsKg(t.topE1RMKg, cfg);
  return map;
}

/* ================================
   New: debug/app-facing helpers
   ================================ */

/**
 * A simple default score-threshold ladder: linear 0..1.
 * (Used by debug screen; you can swap later to something fancier.)
 */
export function generateDefaultScoreThresholds(numRanks: number): number[] {
  const n = Math.max(1, Math.floor(numRanks));
  const out: number[] = [];
  for (let i = 1; i <= n; i++) out.push(i / n);
  return out;
}

/**
 * Compute a normalized score 0..1 from a PR summary + ladder.
 * Right now it's just e1RM/topStandard.
 */
export function computeExerciseScore(args: {
  summary: ExercisePRSummary;
  ladder: RankLadder;
  userUnit: "lb" | "kg";
}): number {
  const { summary, ladder } = args;
  const top = ladder.topStandardE1RMKg || 1;
  return clamp01(summary.bestE1RMKg / top);
}

/**
 * Convert score -> rank and progress based on ladder.scoreThresholds.
 */
export function scoreToRank(scoreRaw: number, ladder: RankLadder): { rank: number; progressToNext: number } {
  const score = clamp01(scoreRaw);
  const t = ladder.scoreThresholds;
  const n = Math.max(1, ladder.numRanks);

  // Find first threshold >= score
  let idx = t.findIndex((x) => score <= x);
  if (idx === -1) idx = n - 1;

  const rank = idx + 1;
  const prevT = idx === 0 ? 0 : t[idx - 1];
  const nextT = t[idx] ?? 1;

  const span = Math.max(1e-9, nextT - prevT);
  const progressToNext = clamp01((score - prevT) / span);

  return { rank, progressToNext };
}

/**
 * Optional helper: build a ladder from an exercise top + config.
 * scoreThresholds is derived from the kg thresholds by dividing by top.
 */
export function buildRankLadderFromTop(args: {
  exerciseId: string;
  topE1RMKg: number;
  cfg?: RankConfig;
  version?: number;
}): RankLadder {
  const { exerciseId, topE1RMKg, cfg = DEFAULT_RANK_CONFIG, version = 1 } = args;
  const thresholdsKg = buildRankThresholdsKg(topE1RMKg, cfg);
  const scoreThresholds = thresholdsKg.map((kg) => clamp01(kg / (topE1RMKg || 1)));
  // Ensure last is exactly 1
  if (scoreThresholds.length) scoreThresholds[scoreThresholds.length - 1] = 1;

  return {
    exerciseId,
    version,
    numRanks: cfg.ranksCount,
    topStandardE1RMKg: topE1RMKg,
    scoreThresholds,
  };
}
