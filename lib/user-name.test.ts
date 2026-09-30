import { APIError } from 'better-auth/api';
import { describe, expect, it } from 'vitest';
import { cleanUserName, MAX_NAME_LENGTH } from '@/lib/user-name';
import { RLO, ZWSP } from '@/test/unicode';

describe('cleanUserName', () => {
  it('returns the sanitized name', () => {
    expect(cleanUserName(`  Ada ${ZWSP} Lovelace `)).toBe('Ada Lovelace');
  });

  it('accepts a name at the maximum length', () => {
    const name = 'a'.repeat(MAX_NAME_LENGTH);
    expect(cleanUserName(name)).toBe(name);
  });

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
    ['invisible characters only', `${ZWSP}${RLO}`],
    ['too long', 'a'.repeat(MAX_NAME_LENGTH + 1)],
    ['not a string', 42],
    ['undefined', undefined],
  ])('rejects a name that is %s', (_label, name) => {
    expect(() => cleanUserName(name)).toThrow(APIError);
  });
});
