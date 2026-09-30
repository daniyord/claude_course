import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireUser } from '@/lib/auth';
import { createNote } from '@/lib/notes';
import { revalidatePath } from 'next/cache';
import { createNoteAction } from '@/app/notes/new/actions';
import { nextNavigation, noteForm, testUser, validContent } from '@/test/next-mocks';

vi.mock('next/navigation', async () => (await import('@/test/next-mocks')).nextNavigation);
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireUser: vi.fn() }));
vi.mock('@/lib/notes', () => ({ createNote: vi.fn() }));

const initialState = { error: null };

beforeEach(() => {
  vi.mocked(requireUser).mockResolvedValue(testUser as never);
  vi.mocked(createNote).mockResolvedValue({} as never);
});

describe('createNoteAction', () => {
  it('creates the note for the current user and redirects to the dashboard', async () => {
    const form = noteForm({ title: ' Groceries ', content: validContent, isPublic: 'on' });

    await expect(createNoteAction(initialState, form)).rejects.toThrow('NEXT_REDIRECT:/dashboard');

    expect(createNote).toHaveBeenCalledWith(testUser.id, {
      title: 'Groceries',
      contentJson: validContent,
      isPublic: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('requires authentication before doing anything', async () => {
    vi.mocked(requireUser).mockImplementation(() => nextNavigation.redirect('/authenticate'));

    await expect(
      createNoteAction(initialState, noteForm({ title: 'x', content: validContent })),
    ).rejects.toThrow('NEXT_REDIRECT:/authenticate');
    expect(createNote).not.toHaveBeenCalled();
  });

  it('returns the validation message for invalid input', async () => {
    const result = await createNoteAction(initialState, noteForm({ title: 'x', content: '{bad' }));

    expect(result.error).toMatch(/formatting we can't save/);
    expect(createNote).not.toHaveBeenCalled();
  });

  it('returns a generic error when saving fails', async () => {
    vi.mocked(createNote).mockRejectedValue(new Error('disk full'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createNoteAction(
      initialState,
      noteForm({ title: 'x', content: validContent }),
    );

    expect(result.error).toMatch(/couldn't save your note/);
    expect(nextNavigation.redirect).not.toHaveBeenCalled();
  });
});
