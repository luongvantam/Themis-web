import { describe, it, expect } from 'vitest';
import { 
  mapJudge0StatusToVerdict, 
  SUPPORTED_LANGUAGES, 
  utf8ToBase64, 
  base64ToUtf8 
} from '../src/services/judge0Service';

describe('Judge0 Service & Mappings', () => {
  it('should map Judge0 status codes to correct Themis verdicts', () => {
    expect(mapJudge0StatusToVerdict(3)).toBe('AC'); // Accepted
    expect(mapJudge0StatusToVerdict(4)).toBe('WA'); // Wrong Answer
    expect(mapJudge0StatusToVerdict(5)).toBe('TLE'); // Time Limit Exceeded
    expect(mapJudge0StatusToVerdict(6)).toBe('CE'); // Compilation Error
    expect(mapJudge0StatusToVerdict(7)).toBe('RTE'); // SIGSEGV
    expect(mapJudge0StatusToVerdict(11)).toBe('RTE'); // NZEC
  });

  it('should include standard competitive programming languages with C++, Python and Pascal', () => {
    const langNames = SUPPORTED_LANGUAGES.map(l => l.name);
    expect(langNames.some(n => n.includes('C++'))).toBe(true);
    expect(langNames.some(n => n.includes('Python'))).toBe(true);
    expect(langNames.some(n => n.includes('Pascal'))).toBe(true);
  });

  it('should correctly encode and decode UTF-8 with GCC quotes and Vietnamese accents for Judge0 base64 mode', () => {
    const gccError = `main.cpp: In function ‘int main()’:\nmain.cpp:2:14: error: ‘syntax’ was not declared in this scope\n    2 | int main() { syntax error; }\n      |              ^~~~~~`;
    const encoded = utf8ToBase64(gccError);
    expect(encoded).toBeTypeOf('string');
    const decoded = base64ToUtf8(encoded);
    expect(decoded).toBe(gccError);

    const vietnameseStr = 'Thí sinh: Nguyễn Văn Phúc Lai - Lỗi cú pháp';
    expect(base64ToUtf8(utf8ToBase64(vietnameseStr))).toBe(vietnameseStr);
  });
});

