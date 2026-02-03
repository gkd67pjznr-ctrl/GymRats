// src/lib/uid.ts
// [NEW 2026-01-23] Centralized UID generation
// [UPDATED 2026-02-02] Generate proper v4 UUIDs for database compatibility

/**
 * Generate a v4 UUID.
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Compatible with PostgreSQL uuid columns.
 */
export function uid(): string {
  const hex = '0123456789abcdef';
  let uuid = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4'; // version 4
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | 8]; // variant bits: 8, 9, a, or b
    } else {
      uuid += hex[(Math.random() * 16) | 0];
    }
  }
  return uuid;
}

/**
 * Generate a prefixed unique identifier.
 * Useful for typed IDs (e.g., "workout_abc123", "routine_xyz789")
 */
export function prefixedUid(prefix: string): string {
  return `${prefix}_${uid()}`;
}

/**
 * Check if a string is a valid UUID format.
 * Accepts v4 UUIDs: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}
