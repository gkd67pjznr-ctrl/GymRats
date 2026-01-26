// src/lib/uid.ts
// [NEW 2026-01-23] Centralized UID generation
// Previously duplicated across 7+ files

/**
 * Generate a unique identifier.
 * Format: {random}-{random} (hex strings)
 * Example: "a1b2c3d4e5f6-789abc012345"
 */
export function uid(): string {
  return (
    Math.random().toString(16).slice(2) +
    "-" +
    Math.random().toString(16).slice(2)
  );
}

/**
 * Generate a prefixed unique identifier.
 * Useful for typed IDs (e.g., "workout_abc123", "routine_xyz789")
 */
export function prefixedUid(prefix: string): string {
  return `${prefix}_${uid()}`;
}
