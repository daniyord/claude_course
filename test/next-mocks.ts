import { vi } from 'vitest';

// next/navigation's redirect() and notFound() throw to abort rendering; mirror that
// so code after them is never reached in tests either.
export const nextNavigation = {
  redirect: vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn((): never => {
    throw new Error('NEXT_NOT_FOUND');
  }),
};

export const testUser = { id: 'user-1', name: 'Ada', email: 'ada@example.com' };

export const validContent = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
});

export function noteForm(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) formData.set(key, value);
  return formData;
}
