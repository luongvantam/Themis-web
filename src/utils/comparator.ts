export interface CompareOptions {
  floatEpsilon?: number;
  ignoreTrailingWhitespace?: boolean;
}

export interface CompareResult {
  matches: boolean;
  message?: string;
  diffDetails?: {
    line: number;
    expected: string;
    actual: string;
  };
}

/**
 * Normalizes output strings by stripping \r and trimming trailing whitespace.
 */
export function normalizeOutput(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trimEnd();
}

/**
 * Tokenizes text by whitespace.
 */
function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(t => t.length > 0);
}

/**
 * Compares two tokens, with floating-point tolerance if applicable.
 */
function areTokensEqual(t1: string, t2: string, epsilon: number): boolean {
  if (t1 === t2) return true;

  const n1 = parseFloat(t1);
  const n2 = parseFloat(t2);

  if (!isNaN(n1) && !isNaN(n2)) {
    // Both are numbers, check epsilon difference
    return Math.abs(n1 - n2) <= epsilon;
  }

  return false;
}

/**
 * Standard competitive programming output comparator.
 * Matches Themis diff behavior.
 */
export function compareOutput(
  actual: string,
  expected: string,
  options: CompareOptions = {}
): CompareResult {
  const epsilon = options.floatEpsilon ?? 0.000001;

  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  // Exact match after normalization
  if (normActual === normExpected) {
    return { matches: true };
  }

  // Token-by-token comparison
  const actualTokens = tokenize(normActual);
  const expectedTokens = tokenize(normExpected);

  if (actualTokens.length !== expectedTokens.length) {
    return {
      matches: false,
      message: `Token count mismatch: expected ${expectedTokens.length} tokens, got ${actualTokens.length} tokens`,
    };
  }

  for (let i = 0; i < expectedTokens.length; i++) {
    const expTok = expectedTokens[i];
    const actTok = actualTokens[i];

    if (!areTokensEqual(actTok, expTok, epsilon)) {
      return {
        matches: false,
        message: `Token mismatch at token #${i + 1}: expected "${expTok}", got "${actTok}"`,
      };
    }
  }

  return { matches: true };
}

