import { describe, expect, it, vi } from 'vitest';
import { getNoteByPublicSlug } from '@/lib/notes';
import PublicNotePage, { generateMetadata } from '@/app/p/[slug]/page';

vi.mock('next/navigation', async () => (await import('@/test/next-mocks')).nextNavigation);
vi.mock('@/lib/notes', () => ({ getNoteByPublicSlug: vi.fn() }));

const props = (slug: string) => ({ params: Promise.resolve({ slug }) }) as never;

const sharedNote = {
  id: 'n1',
  userId: 'u1',
  title: 'Shared recipe',
  contentJson: '{"type":"doc","content":[]}',
  isPublic: true,
  publicSlug: 'abcdefghijklmnopqrstu',
  createdAt: '',
  updatedAt: '',
};

describe('PublicNotePage', () => {
  it('looks the note up by slug and renders it', async () => {
    vi.mocked(getNoteByPublicSlug).mockResolvedValue(sharedNote);
    await expect(PublicNotePage(props(sharedNote.publicSlug))).resolves.toBeTruthy();
    expect(getNoteByPublicSlug).toHaveBeenCalledWith(sharedNote.publicSlug);
  });

  it('404s for an unknown or unshared slug', async () => {
    vi.mocked(getNoteByPublicSlug).mockResolvedValue(null);
    await expect(PublicNotePage(props('nope'))).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe('generateMetadata', () => {
  it('uses the note title and blocks indexing', async () => {
    vi.mocked(getNoteByPublicSlug).mockResolvedValue(sharedNote);
    await expect(generateMetadata(props('s'))).resolves.toEqual({
      title: 'Shared recipe',
      robots: { index: false, follow: false },
    });
  });

  it('falls back when the note does not exist', async () => {
    vi.mocked(getNoteByPublicSlug).mockResolvedValue(null);
    expect((await generateMetadata(props('s'))).title).toBe('Note not found');
  });
});
