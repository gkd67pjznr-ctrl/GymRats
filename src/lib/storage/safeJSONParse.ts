// src/lib/storage/safeJSONParse.ts
// Type-safe JSON parsing with fallback values for AsyncStorage operations

/**
 * Safely parse JSON string with fallback value
 *
 * This utility provides type-safe JSON parsing for AsyncStorage and other
 * string-based storage operations. It prevents crashes from malformed JSON
 * and ensures a default value is returned on error.
 *
 * @param raw - The JSON string to parse (can be null or undefined)
 * @param fallback - Default value to return if parsing fails
 * @returns Parsed value or fallback
 *
 * @example
 * ```ts
 * // Simple type inference
 * const data = safeJSONParse(raw, { count: 0 });
 * // data is inferred as { count: number }
 *
 * // Explicit type parameter
 * const user = safeJSONParse<UserType>(raw, null);
 * // user is typed as UserType | null
 * ```
 */
export function safeJSONParse<T>(raw: string | null | undefined, fallback: T): T {
  // Return fallback if raw is null/undefined/empty
  if (!raw || raw.trim() === '') {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    // Log error in development for debugging
    if (__DEV__) {
      console.warn('[safeJSONParse] Failed to parse JSON, using fallback:', {
        error: error instanceof Error ? error.message : String(error),
        rawLength: raw.length,
        rawPreview: raw.substring(0, 100),
        fallback,
      });
    }
    return fallback;
  }
}

/**
 * Safely parse JSON with runtime validation
 *
 * Similar to safeJSONParse but includes a runtime type guard to ensure
 * the parsed value matches expected structure. Useful for auth/session
 * data where structure validation is important.
 *
 * @param raw - The JSON string to parse
 * @param fallback - Default value if parsing or validation fails
 * @param guard - Type guard function to validate parsed structure
 * @returns Parsed and validated value, or fallback
 *
 * @example
 * ```ts
 * interface SessionData {
 *   userId: string;
 *   token: string;
 * }
 *
 * const session = safeJSONParseWithGuard(
 *   raw,
 *   null,
 *   (val): val is SessionData => {
 *     return typeof val === 'object' && val !== null &&
 *            'userId' in val && 'token' in val;
 *   }
 * );
 * ```
 */
export function safeJSONParseWithGuard<T>(
  raw: string | null | undefined,
  fallback: T,
  guard: (value: unknown) => value is T
): T {
  if (!raw || raw.trim() === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (guard(parsed)) {
      return parsed;
    }
    // Structure validation failed
    if (__DEV__) {
      console.warn('[safeJSONParseWithGuard] Structure validation failed, using fallback:', {
        parsed,
        fallback,
      });
    }
    return fallback;
  } catch (error) {
    if (__DEV__) {
      console.warn('[safeJSONParseWithGuard] Parse error, using fallback:', {
        error: error instanceof Error ? error.message : String(error),
        fallback,
      });
    }
    return fallback;
  }
}

/**
 * Safely stringify a value to JSON
 *
 * Prevents crashes from circular references or other non-serializable data.
 *
 * @param value - Value to stringify
 * @param fallback - Fallback string to return if stringification fails
 * @returns JSON string or fallback
 *
 * @example
 * ```ts
 * const json = safeJSONStringify({ count: 0 }, '{}');
 * // Returns '{"count":0}' or '{}' on error
 * ```
 */
export function safeJSONStringify(value: unknown, fallback: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    if (__DEV__) {
      console.warn('[safeJSONStringify] Failed to stringify, using fallback:', {
        error: error instanceof Error ? error.message : String(error),
        value,
        fallback,
      });
    }
    return fallback;
  }
}

/**
 * Parse array with type safety
 *
 * Specialized version for arrays that ensures the result is always an array.
 *
 * @param raw - JSON string containing an array
 * @returns Parsed array or empty array on error
 *
 * @example
 * ```ts
 * const items = safeJSONParseArray<ItemType>(raw);
 * // items is always ItemType[]
 * ```
 */
export function safeJSONParseArray<T>(raw: string | null | undefined): T[] {
  return safeJSONParse<T[]>(raw, []);
}

/**
 * Parse record (object) with type safety
 *
 * Specialized version for records/objects that ensures the result is always an object.
 *
 * @param raw - JSON string containing an object
 * @returns Parsed record or empty object on error
 *
 * @example
 * ```ts
 * const prefs = safeJSONParseRecord<PreferenceType>(raw);
 * // prefs is always Record<string, PreferenceType>
 * ```
 */
export function safeJSONParseRecord<T>(raw: string | null | undefined): Record<string, T> {
  return safeJSONParse<Record<string, T>>(raw, {});
}
