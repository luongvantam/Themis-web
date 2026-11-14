/**
 * Preprocesses submitted source code to ensure compatibility with Judge0's
 * standard I/O execution environment.
 *
 * In Vietnam, Themis tasks often use file-based I/O:
 * - C/C++: freopen("TASK.INP", "r", stdin); freopen("TASK.OUT", "w", stdout);
 * - Pascal: assign(f, 'TASK.INP'); reset(f); assign(g, 'TASK.OUT'); rewrite(g);
 * - Python: sys.stdin = open('TASK.INP', 'r'); sys.stdout = open('TASK.OUT', 'w')
 *
 * This preprocessor neutralizes the file open calls so the code reads from
 * stdin and writes to stdout transparently, avoiding File Not Found runtime crashes.
 */

export function preprocessCode(
  code: string,
  language: string,
  autoRedirect: boolean = true
): string {
  if (!autoRedirect || !code) return code;

  const lang = language.toLowerCase();

  if (lang.includes('c++') || lang.includes('cpp') || lang === 'c') {
    return preprocessCpp(code);
  }

  if (lang.includes('pascal') || lang.includes('pas')) {
    return preprocessPascal(code);
  }

  if (lang.includes('python') || lang.includes('py')) {
    return preprocessPython(code);
  }

  return code;
}

function preprocessCpp(code: string): string {
  // Replace freopen calls:
  // e.g. freopen("BAI1.INP", "r", stdin); -> /* freopen("BAI1.INP", "r", stdin); */
  const freopenRegex = /([ \t]*)(freopen\s*\([^;]+\)\s*;)/gi;
  return code.replace(freopenRegex, '$1/* [ThemisWeb Auto-Redirect] $2 */');
}

function preprocessPascal(code: string): string {
  // Comment out assign, reset, rewrite, close calls pointing to files
  // e.g. assign(f, 'BAI1.INP'); -> { [ThemisWeb] assign(f, 'BAI1.INP'); }
  const pascalRegex = /([ \t]*)(assign\s*\([^;]+\)\s*;|reset\s*\([^;]+\)\s*;|rewrite\s*\([^;]+\)\s*;|close\s*\([^;]+\)\s*;)/gi;
  return code.replace(pascalRegex, '$1{ [ThemisWeb Auto-Redirect] $2 }');
}

function preprocessPython(code: string): string {
  // Comment out sys.stdin = open(...) and sys.stdout = open(...)
  const pyRegex = /([ \t]*)(sys\.std(in|out)\s*=\s*open\s*\([^)]+\))/gi;
  return code.replace(pyRegex, '$1# [ThemisWeb Auto-Redirect] $2');
}

