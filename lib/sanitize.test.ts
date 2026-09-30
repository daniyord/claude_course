import { describe, expect, it } from 'vitest';
import { sanitizeLine, sanitizeMultiline } from '@/lib/sanitize';
import { BOM, LRE, LRI, RLO, ZWJ, ZWNJ, ZWSP } from '@/test/unicode';

describe('sanitizeLine', () => {
  it('collapses whitespace and trims', () => {
    expect(sanitizeLine('  hello \n\t world  ')).toBe('hello world');
  });

  it('strips control, zero-width and bidi override characters', () => {
    expect(sanitizeLine(`a\u0000b${ZWSP}c${RLO}d${BOM}e${LRI}f\u007F`)).toBe('abcdef');
  });

  it('normalizes to NFC', () => {
    const decomposed = 'café'.normalize('NFD');
    expect(sanitizeLine(decomposed)).toBe(decomposed.normalize('NFC'));
    expect(sanitizeLine(decomposed)).not.toBe(decomposed);
  });

  it('returns an empty string for input made only of unsafe characters', () => {
    expect(sanitizeLine(`${ZWSP}${ZWNJ} \u0007`)).toBe('');
  });
});

describe('sanitizeMultiline', () => {
  it('keeps newlines and tabs but normalizes line endings', () => {
    expect(sanitizeMultiline('a\r\nb\rc\n\td')).toBe('a\nb\nc\n\td');
  });

  it('does not collapse or trim whitespace', () => {
    expect(sanitizeMultiline('  a  b  ')).toBe('  a  b  ');
  });

  it('strips unsafe characters', () => {
    expect(sanitizeMultiline(`x\u0001y${ZWJ}z${LRE}`)).toBe('xyz');
  });
});
