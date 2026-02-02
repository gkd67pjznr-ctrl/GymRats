// src/lib/forgerankScoring.ts
/**
 * Forgerank scoring (v1 foundation)
 *
 * Goals:
 * - Deterministic (same input -> same output)
 * - Plausible without backend
 * - Works with either "per set" data or a precomputed e1RM
 * - Provides: score, tier, confidence flags, and explainable breakdown
 *
 * Intentionally NO imports so this is safe to add immediately.
 */

export type UnitSystem = "lb" | "kg";

export type Sex = "male" | "female" | "unspecified";

export type Tier = "Iron" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Mythic";

export type ScoreReason =
  | "base_strength"
  | "rep_quality"
  | "volume_bonus"
  | "pr_bonus"
  | "consistency_bonus"
  | "anti_cheat_penalty"
  | "missing_bodyweight_penalty";

export type ScoreFlag =
  | "missing_bodyweight"
  | "implausible_jump"
  | "implausible_set"
  | "too_light_for_ranked"
  | "insufficient_data";

export type ScoringInput = {
  /** Exercise identifier (any stable string) */
  exerciseId: string;

  /** Working-set input (optional if e1rmKg is supplied) */
  weight: number;
  reps: number;

  /** Optional: perceived effort (0-10). If absent, we assume hard but not maximal. */
  rpe?: number;

  /** Unit system for weight */
  unit?: UnitSystem;

  /**
   * Optional: bodyweight for normalization.
   * If absent, we still score but apply a small penalty + add a flag.
   */
  bodyweightKg?: number;

  /** Optional: direct e1RM override (if you computed it elsewhere) */
  e1rmKg?: number;

  /**
   * Optional: prior best e1RM for PR detection.
   * If provided and current e1RM exceeds it, PR bonus can apply.
   */
  previousBestE1rmKg?: number;

  /**
   * Optional: how many sessions in last 14 days that included this exercise.
   * Helps build consistency without needing full history in this module.
   */
  sessionsInLast14Days?: number;

  /** Optional: sex (future calibration). v1 uses mild adjustment only. */
  sex?: Sex;
};

export type ScoreBreakdown = {
  total: number; // 0..1000
  tier: Tier;
  normalizedStrength: number; // 0..1
  e1rmKg: number;
  flags: ScoreFlag[];
  parts: { reason: ScoreReason; delta: number; note: string }[];
};

export type TierThreshold = {
  tier: Tier;
  minScore: number; // inclusive
};

export const DEFAULT_TIERS: TierThreshold[] = [
  { tier: "Iron", minScore: 0 },
  { tier: "Bronze", minScore: 180 },
  { tier: "Silver", minScore: 320 },
  { tier: "Gold", minScore: 470 },
  { tier: "Platinum", minScore: 620 },
  { tier: "Diamond", minScore: 770 },
  { tier: "Mythic", minScore: 900 },
];

/** ---------- Public API ---------- */

export function scoreForgerank(input: ScoringInput): ScoreBreakdown {
  const flags: ScoreFlag[] = [];
  const parts: ScoreBreakdown["parts"] = [];

  // Sanity + normalize
  const unit: UnitSystem = input.unit ?? "lb";
  const wKg = input.e1rmKg != null ? 0 : toKg(safeNum(input.weight), unit);
  const reps = clampInt(safeInt(input.reps), 1, 30);
  const rpe = clamp(safeNum(input.rpe ?? 8.5), 5, 10);

  // Compute e1RM
  const e1rmKg = input.e1rmKg != null ? safeNum(input.e1rmKg) : estimateE1rmKg(wKg, reps, rpe);

  // Guardrails: if e1RM is nonsense, nuke score
  if (!isFiniteNumber(e1rmKg) || e1rmKg <= 0) {
    flags.push("insufficient_data");
    return {
      total: 0,
      tier: "Iron",
      normalizedStrength: 0,
      e1rmKg: 0,
      flags,
      parts: [{ reason: "anti_cheat_penalty", delta: 0, note: "Invalid e1RM input." }],
    };
  }

  // Bodyweight normalization (optional)
  const bw = input.bodyweightKg != null ? safeNum(input.bodyweightKg) : null;
  if (!bw || bw <= 0) flags.push("missing_bodyweight");

  // Normalized strength ratio: e1RM / BW, with small sex adjustment
  const sex: Sex = input.sex ?? "unspecified";
  const sexAdj = sex === "female" ? 1.08 : sex === "male" ? 1.0 : 1.02;

  const ratio = bw ? (e1rmKg / bw) * sexAdj : null;

  // Base strength score (dominant term)
  // If we have BW: use ratio; else use raw e1RM scaled (penalized)
  const baseStrength = ratio != null ? strengthFromRatio(ratio) : strengthFromE1rmOnly(e1rmKg);
  parts.push({ reason: "base_strength", delta: baseStrength, note: ratio != null ? "Based on e1RM/BW." : "Based on e1RM only." });

  // Rep quality (higher reps at high load is impressive, but diminishing returns)
  const repQuality = repQualityBonus(reps, rpe);
  parts.push({ reason: "rep_quality", delta: repQuality, note: `Reps=${reps}, RPE≈${round1(rpe)}.` });

  // Volume bonus (tiny) — encourages real work, not one circus rep
  const volumeBonus = volumeBonusFromSet(wKg || (e1rmKg * 0.85), reps);
  parts.push({ reason: "volume_bonus", delta: volumeBonus, note: "Small volume reward." });

  // Consistency (sessions in last 14 days, capped)
  const s14 = clampInt(safeInt(input.sessionsInLast14Days ?? 0), 0, 14);
  const consistency = consistencyBonus(s14);
  if (consistency !== 0) parts.push({ reason: "consistency_bonus", delta: consistency, note: `${s14} sessions in last 14 days.` });

  // PR bonus
  const prev = input.previousBestE1rmKg != null ? safeNum(input.previousBestE1rmKg) : null;
  const pr = prBonus(e1rmKg, prev);
  if (pr !== 0) parts.push({ reason: "pr_bonus", delta: pr, note: prev ? `Prev best ${round1(prev)}kg.` : "No prior PR baseline." });

  // Penalty: missing BW (small; still allows usage)
  let missingBwPenalty = 0;
  if (ratio == null) {
    missingBwPenalty = -45;
    parts.push({ reason: "missing_bodyweight_penalty", delta: missingBwPenalty, note: "No bodyweight provided." });
  }

  // Anti-cheat heuristics (v1: light, explainable)
  // 1) implausible set inputs (e.g., 30 reps @ “max”)
  const setPlausible = isSetPlausible(wKg || (e1rmKg * 0.85), reps, rpe);
  if (!setPlausible) flags.push("implausible_set");

  // 2) implausible jump vs previous e1RM (if provided)
  const jumpPenalty = jumpPenaltyFromPrev(e1rmKg, prev);
  if (jumpPenalty !== 0) {
    flags.push("implausible_jump");
    parts.push({ reason: "anti_cheat_penalty", delta: jumpPenalty, note: "Unusually large jump vs previous best." });
  }

  // 3) too light to be “ranked” (prevents nonsense submissions)
  const tooLight = e1rmKg < 10; // basically impossible “real lift”
  if (tooLight) flags.push("too_light_for_ranked");

  // Total
  const rawTotal = parts.reduce((sum, p) => sum + p.delta, 0);

  // Clamp and finalize
  let total = clamp(Math.round(rawTotal), 0, 1000);

  // If set is implausible, cap score hard (v1)
  if (!setPlausible) {
    total = Math.min(total, 220);
    // reflect the cap in flags, not as another delta (keeps breakdown readable)
  }

  if (tooLight) total = 0;

  const tier = tierFromScore(total, DEFAULT_TIERS);

  return {
    total,
    tier,
    normalizedStrength: clamp01(baseStrength / 700), // rough normalization for UI visuals
    e1rmKg: round1(e1rmKg),
    flags,
    parts,
  };
}

/**
 * Convenience: score from a precomputed e1RM + BW only.
 * Useful for leaderboards or imported PRs.
 */
export function scoreFromE1rm(exerciseId: string, e1rmKg: number, bodyweightKg?: number, sex: Sex = "unspecified"): ScoreBreakdown {
  return scoreForgerank({
    exerciseId,
    weight: 0,
    reps: 1,
    rpe: 10,
    unit: "kg",
    e1rmKg,
    bodyweightKg,
    sex,
  });
}

/** ---------- Internal pieces ---------- */

// Epley-ish base with mild RPE adjustment (v1).
// This is not “scientific truth”—it’s stable + predictable and good enough to rank.
function estimateE1rmKg(weightKg: number, reps: number, rpe: number): number {
  const w = Math.max(0.1, weightKg);
  const r = clampInt(reps, 1, 30);

  // Epley: 1RM = w * (1 + reps/30)
  const epley = w * (1 + r / 30);

  // RPE adjustment: lower RPE means you had more reps in reserve -> slight bump down
  // rpe 10 => 1.00
  // rpe 9  => 0.97
  // rpe 8  => 0.93
  const rpeFactor = clamp(0.85 + (rpe - 5) * 0.03, 0.88, 1.02);

  return epley * rpeFactor;
}

// Convert ratio -> strength score (0..700-ish)
// ratio ~1.0 => novice, ~1.5 => intermediate, ~2.0 => strong, ~2.5+ => elite
function strengthFromRatio(ratio: number): number {
  const x = clamp(ratio, 0.2, 3.2);

  // Nonlinear curve: rewards strength, but compresses extremes
  // Map 0.2..3.2 => 0..1
  const t = (x - 0.2) / (3.2 - 0.2);
  const curved = Math.pow(t, 0.62); // accelerate early progression
  return Math.round(curved * 700);
}

// When BW is missing, score based on raw e1RM but compressed + penalized.
function strengthFromE1rmOnly(e1rmKg: number): number {
  const x = clamp(e1rmKg, 1, 350);

  // Map 1..350 => 0..1 with curve
  const t = (x - 1) / (350 - 1);
  const curved = Math.pow(t, 0.58);
  return Math.round(curved * 640);
}

function repQualityBonus(reps: number, rpe: number): number {
  // Higher reps adds a bit, but too high reps reduces “rank value”
  const r = clampInt(reps, 1, 30);
  const effort = clamp((rpe - 7) / 3, 0, 1); // 7..10 => 0..1
  const sweet = r <= 12 ? r : 12 - (r - 12) * 0.55; // diminishing after 12
  const bonus = clamp(sweet, 0, 12) * 6 * effort; // max ~72
  return Math.round(bonus);
}

function volumeBonusFromSet(weightKg: number, reps: number): number {
  const tonnage = Math.max(0, weightKg) * clampInt(reps, 1, 30);
  // Small: max around ~60
  return Math.round(clamp(Math.sqrt(tonnage) * 1.2, 0, 60));
}

function consistencyBonus(sessionsInLast14Days: number): number {
  const s = clampInt(sessionsInLast14Days, 0, 14);
  // Cap at +70 for very consistent
  return Math.round(clamp(Math.pow(s / 10, 0.9) * 70, 0, 70));
}

function prBonus(currentE1rmKg: number, previousBestE1rmKg: number | null): number {
  if (!previousBestE1rmKg || previousBestE1rmKg <= 0) return 0;
  const gain = (currentE1rmKg - previousBestE1rmKg) / previousBestE1rmKg; // fractional
  if (gain <= 0) return 0;

  // Score PRs modestly so people don’t chase fake spikes.
  // 1% PR => ~6 pts, 5% PR => ~28 pts, 10% PR => ~48 pts (capped)
  return Math.round(clamp(Math.sqrt(gain) * 150, 6, 55));
}

function jumpPenaltyFromPrev(currentE1rmKg: number, previousBestE1rmKg: number | null): number {
  if (!previousBestE1rmKg || previousBestE1rmKg <= 0) return 0;

  const gain = (currentE1rmKg - previousBestE1rmKg) / previousBestE1rmKg;

  // If jump is huge, apply penalty (v1 heuristic).
  // >12% in one go is suspicious without more context.
  if (gain <= 0.12) return 0;

  const over = gain - 0.12; // e.g. 0.20 gain => 0.08 over
  const penalty = -Math.round(clamp(over * 400, 15, 160)); // up to -160
  return penalty;
}

function isSetPlausible(weightKg: number, reps: number, rpe: number): boolean {
  // Very simple: high reps + high RPE at meaningful load is rare
  // (We don’t want to block; we want to cap.)
  const r = reps;
  const effort = rpe;

  // absurd reps at "max" effort
  if (r >= 20 && effort >= 9.5) return false;

  // extremely low load is not rankable
  if (weightKg < 2) return true;

  return true;
}

function tierFromScore(score: number, tiers: TierThreshold[]): Tier {
  let out: Tier = tiers[0]?.tier ?? "Iron";
  for (const t of tiers) {
    if (score >= t.minScore) out = t.tier;
  }
  return out;
}

function toKg(weight: number, unit: UnitSystem): number {
  const w = safeNum(weight);
  if (unit === "kg") return w;
  return w * 0.45359237;
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}
function clampInt(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, Math.trunc(n)));
}
function clamp01(n: number): number {
  return clamp(n, 0, 1);
}
function safeNum(n: any): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function safeInt(n: any): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function isFiniteNumber(n: number): boolean {
  return Number.isFinite(n);
}
