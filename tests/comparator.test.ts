import { describe, it, expect } from 'vitest';
import { compareOutput, normalizeOutput } from '../src/utils/comparator';

describe('Diff Comparator', () => {
  it('should normalize Windows CRLF and trailing spaces', () => {
    const raw = 'line 1   \r\nline 2\r\n\r\n';
    const normalized = normalizeOutput(raw);
    expect(normalized).toBe('line 1\nline 2');
  });

  it('should match identical outputs', () => {
    const res = compareOutput('42\n', '42\r\n');
    expect(res.matches).toBe(true);
  });

  it('should match outputs with different whitespace layouts if tokens match', () => {
    const actual = '1   2   3\n4 5\n';
    const expected = '1 2 3 4 5\n';
    const res = compareOutput(actual, expected);
    expect(res.matches).toBe(true);
  });

  it('should match floating point numbers within epsilon', () => {
    const actual = '3.14159265\n';
    const expected = '3.141593\n';
    const res = compareOutput(actual, expected, { floatEpsilon: 0.0001 });
    expect(res.matches).toBe(true);
  });

  it('should reject wrong answers', () => {
    const actual = '1 2 4\n';
    const expected = '1 2 3\n';
    const res = compareOutput(actual, expected);
    expect(res.matches).toBe(false);
    expect(res.message).toContain('Token mismatch');
  });
});

