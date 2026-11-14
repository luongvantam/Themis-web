import { describe, it, expect } from 'vitest';
import { preprocessCode } from '../src/utils/preprocessor';

describe('Themis I/O Preprocessor', () => {
  it('should neutralize freopen in C++ code', () => {
    const cppCode = `
#include <iostream>
using namespace std;
int main() {
    freopen("BAI1.INP", "r", stdin);
    freopen("BAI1.OUT", "w", stdout);
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`;
    const processed = preprocessCode(cppCode, 'cpp');
    expect(processed).toContain('/* [ThemisWeb Auto-Redirect] freopen("BAI1.INP", "r", stdin); */');
    expect(processed).toContain('/* [ThemisWeb Auto-Redirect] freopen("BAI1.OUT", "w", stdout); */');
    expect(processed).toContain('cin >> a >> b;');
  });

  it('should neutralize assign and reset in Pascal code', () => {
    const pasCode = `
var a, b: integer;
begin
    assign(input, 'BAI1.INP'); reset(input);
    assign(output, 'BAI1.OUT'); rewrite(output);
    read(a, b);
    write(a + b);
end.
`;
    const processed = preprocessCode(pasCode, 'pascal');
    expect(processed).toContain('{ [ThemisWeb Auto-Redirect] assign(input, \'BAI1.INP\'); }');
    expect(processed).toContain('{ [ThemisWeb Auto-Redirect] reset(input); }');
    expect(processed).toContain('read(a, b);');
  });

  it('should neutralize sys.stdin in Python code', () => {
    const pyCode = `
import sys
sys.stdin = open('BAI1.INP', 'r')
sys.stdout = open('BAI1.OUT', 'w')
a, b = map(int, input().split())
print(a + b)
`;
    const processed = preprocessCode(pyCode, 'python');
    expect(processed).toContain("# [ThemisWeb Auto-Redirect] sys.stdin = open('BAI1.INP', 'r')");
    expect(processed).toContain("# [ThemisWeb Auto-Redirect] sys.stdout = open('BAI1.OUT', 'w')");
    expect(processed).toContain('print(a + b)');
  });

  it('should leave code unchanged if autoRedirect is false', () => {
    const code = 'freopen("TEST.INP", "r", stdin);';
    const processed = preprocessCode(code, 'cpp', false);
    expect(processed).toBe(code);
  });
});

