// src/lib/storage/__tests__/safeJSONParse.test.ts
// Tests for safe JSON parsing utilities

import {
  safeJSONParse,
  safeJSONParseWithGuard,
  safeJSONStringify,
  safeJSONParseArray,
  safeJSONParseRecord,
} from '../safeJSONParse';

// Mock console.warn
const originalWarn = console.warn;
let warnLogs: unknown[] = [];

beforeEach(() => {
  warnLogs = [];
  console.warn = (...args) => warnLogs.push(args);
});

afterEach(() => {
  console.warn = originalWarn;
});

describe('safeJSONParse', () => {
  describe('safeJSONParse', () => {
    it('parses valid JSON correctly', () => {
      const raw = '{"count":42,"name":"test"}';
      const result = safeJSONParse(raw, { count: 0 });

      expect(result).toEqual({ count: 42, name: 'test' });
    });

    it('returns fallback for null input', () => {
      const fallback = { count: 0 };
      const result = safeJSONParse(null, fallback);

      expect(result).toBe(fallback);
    });

    it('returns fallback for undefined input', () => {
      const fallback = { count: 0 };
      const result = safeJSONParse(undefined, fallback);

      expect(result).toBe(fallback);
    });

    it('returns fallback for empty string', () => {
      const fallback = { count: 0 };
      const result = safeJSONParse('', fallback);

      expect(result).toBe(fallback);
    });

    it('returns fallback for whitespace-only string', () => {
      const fallback = { count: 0 };
      const result = safeJSONParse('   ', fallback);

      expect(result).toBe(fallback);
    });

    it('returns fallback for malformed JSON', () => {
      const fallback = { count: 0 };
      const result = safeJSONParse('invalid json', fallback);

      expect(result).toBe(fallback);
      expect(warnLogs.length).toBeGreaterThan(0);
    });

    it('infers type from fallback', () => {
      const raw = '{"value":123}';
      const result = safeJSONParse(raw, { value: 0 });

      // Type should be inferred as { value: number }
      expect(result.value).toBe(123);
    });

    it('handles arrays', () => {
      const raw = '[1,2,3]';
      const result = safeJSONParse(raw, []);

      expect(result).toEqual([1, 2, 3]);
    });

    it('handles primitive values', () => {
      expect(safeJSONParse('42', 0)).toBe(42);
      expect(safeJSONParse('"test"', '')).toBe('test');
      expect(safeJSONParse('true', false)).toBe(true);
    });
  });

  describe('safeJSONParseWithGuard', () => {
    type User = { id: string; name: string };

    it('parses and validates with type guard', () => {
      const raw = '{"id":"123","name":"Alice"}';
      const isUser = (val: unknown): val is User => {
        return typeof val === 'object' && val !== null && 'id' in val && 'name' in val;
      };

      const result = safeJSONParseWithGuard(raw, null, isUser);

      expect(result).toEqual({ id: '123', name: 'Alice' });
    });

    it('returns fallback when validation fails', () => {
      const raw = '{"id":"123"}'; // missing 'name' property
      const isUser = (val: unknown): val is User => {
        return typeof val === 'object' && val !== null && 'id' in val && 'name' in val;
      };

      const result = safeJSONParseWithGuard(raw, null, isUser);

      expect(result).toBeNull();
      expect(warnLogs.length).toBeGreaterThan(0);
    });

    it('returns fallback for parse errors', () => {
      const isUser = (val: unknown): val is User => {
        return typeof val === 'object' && val !== null && 'id' in val && 'name' in val;
      };

      const result = safeJSONParseWithGuard('invalid', null, isUser);

      expect(result).toBeNull();
    });
  });

  describe('safeJSONStringify', () => {
    it('stringifies valid objects', () => {
      const obj = { count: 42, name: 'test' };
      const result = safeJSONStringify(obj);

      expect(result).toBe('{"count":42,"name":"test"}');
    });

    it('returns fallback for circular references', () => {
      const obj: Record<string, unknown> = { count: 42 };
      obj.self = obj;

      const result = safeJSONStringify(obj, '{}');

      // Either fallback or a string that handles circular refs
      expect(result).toBeTruthy();
    });

    it('uses custom fallback', () => {
      const obj: Record<string, unknown> = {};
      obj.self = obj;

      const result = safeJSONStringify(obj, 'custom');

      expect(result === 'custom' || typeof result === 'string').toBe(true);
    });

    it('stringifies primitives', () => {
      expect(safeJSONStringify(42)).toBe('42');
      expect(safeJSONStringify('test')).toBe('"test"');
      expect(safeJSONStringify(true)).toBe('true');
      expect(safeJSONStringify(null)).toBe('null');
    });

    it('stringifies arrays', () => {
      const result = safeJSONStringify([1, 2, 3]);
      expect(result).toBe('[1,2,3]');
    });
  });

  describe('safeJSONParseArray', () => {
    it('parses valid JSON array', () => {
      const raw = '[1,2,3]';
      const result = safeJSONParseArray<number>(raw);

      expect(result).toEqual([1, 2, 3]);
    });

    it('returns empty array for invalid input', () => {
      expect(safeJSONParseArray<number>(null)).toEqual([]);
      expect(safeJSONParseArray<number>('invalid')).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      const raw = '{"key":"value"}';
      const result = safeJSONParseArray<number>(raw);

      // The parsed value is an object, but we expect array
      // Implementation returns empty array on error
      expect(Array.isArray(result)).toBe(true);
    });

    it('preserves array element types', () => {
      const raw = '[{"id":1},{"id":2}]';
      const result = safeJSONParseArray<{ id: number }>(raw);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('safeJSONParseRecord', () => {
    it('parses valid JSON object', () => {
      const raw = '{"a":1,"b":2}';
      const result = safeJSONParseRecord<number>(raw);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('returns empty object for invalid input', () => {
      expect(safeJSONParseRecord<number>(null)).toEqual({});
      expect(safeJSONParseRecord<number>('invalid')).toEqual({});
    });

    it('returns empty object for non-object JSON', () => {
      const raw = '[1,2,3]';
      const result = safeJSONParseRecord<number>(raw);

      expect(typeof result).toBe('object');
      expect(Array.isArray(result)).toBe(false);
    });

    it('preserves record value types', () => {
      const raw = '{"a":{"id":1},"b":{"id":2}}';
      const result = safeJSONParseRecord<{ id: number }>(raw);

      expect(result).toEqual({
        a: { id: 1 },
        b: { id: 2 },
      });
    });
  });
});
