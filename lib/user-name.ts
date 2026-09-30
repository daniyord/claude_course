import { APIError } from 'better-auth/api';
import { sanitizeLine } from '@/lib/sanitize';

export const MAX_NAME_LENGTH = 100;

export function cleanUserName(name: unknown): string {
  const cleaned = typeof name === 'string' ? sanitizeLine(name) : '';
  if (cleaned.length < 1 || cleaned.length > MAX_NAME_LENGTH) {
    throw new APIError('BAD_REQUEST', {
      code: 'INVALID_NAME',
      message: `Name must be between 1 and ${MAX_NAME_LENGTH} characters`,
    });
  }
  return cleaned;
}
