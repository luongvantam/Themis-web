import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES } from '../src/services/judge0Service';
import { preprocessCode } from '../src/utils/preprocessor';

describe('Contestant Workspace Logic', () => {
  it('should generate correct default template for a given problem code', () => {
    const cppLang = SUPPORTED_LANGUAGES.find(l => l.id === 54)!;
    const tpl = cppLang.defaultTemplate.replace(/TASK/g, 'BAI1');
    expect(tpl).toContain('BAI1.INP');
    expect(tpl).toContain('BAI1.OUT');
  });

  it('should auto-redirect file I/O when preprocessed', () => {
    const cppLang = SUPPORTED_LANGUAGES.find(l => l.id === 54)!;
    const tpl = cppLang.defaultTemplate.replace(/TASK/g, 'BAI1');
    // Uncomment freopen to simulate student code
    const studentCode = tpl.replace(/\/\/ freopen/g, 'freopen');
    const processed = preprocessCode(studentCode, 'cpp', true);
    expect(processed).toContain('/* [ThemisWeb Auto-Redirect]');
  });
});

