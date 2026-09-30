import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireUser } from '@/lib/auth';
import { deleteNote, updateNote } from '@/lib/notes';
import { revalidatePath } from 'next/cache';
import { deleteNoteAction, updateNoteAction } from '@/app/notes/[id]/actions';
import { nextNavigation, noteForm, testUser, validContent } from '@/test/next-mocks';

vi.mock('next/navigation', async () => (await import('@/test/next-mocks')).nextNavigation);
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireUser: vi.fn() }));
vi.mock('@/lib/notes', () => ({ updateNote: vi.fn(), deleteNote: vi.fn() }));

const NOTE_ID = 'note-1';
const initialState = { error: null };

beforeEach(() => {
  vi.mocked(requireUser).mockResolvedValue(testUser as never);
  vi.mocked(updateNote).mockResolvedValue(true);
  vi.mocked(deleteNote).mockResolvedValue(true);
});

describe('updateNoteAction', () => {
  it("updates the user's note, revalidates and redirects to it", async () => {
    const form = noteForm({ title: 'Edited', content: validContent });

    await expect(updateNoteAction(NOTE_ID, initialState, form)).rejects.toThrow(
      `NEXT_REDIRECT:/notes/${NOTE_ID}`,
    );

    expect(updateNote).toHaveBeenCalledWith(testUser.id, NOTE_ID, {
      title: 'Edited',
      contentJson: validContent,
      isPublic: false,
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith(`/notes/${NOTE_ID}`);
  });

  it('passes the sharing toggle through', async () => {
    const form = noteForm({ title: 'Edited', content: validContent, isPublic: 'on' });
    await expect(updateNoteAction(NOTE_ID, initialState, form)).rejects.toThrow();
    expect(vi.mocked(updateNote).mock.calls[0][2].isPublic).toBe(true);
  });

  it('responds 404 when the note does not belong to the user', async () => {
    vi.mocked(updateNote).mockResolvedValue(false);
    const form = noteForm({ title: 'Edited', content: validContent });

    await expect(updateNoteAction(NOTE_ID, initialState, form)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns the validation message for invalid input', async () => {
    const result = await updateNoteAction(NOTE_ID, initialState, noteForm({ title: 'x' }));
    expect(result.error).toBeTruthy();
    expect(updateNote).not.toHaveBeenCalled();
  });

  it('returns a generic error when saving fails', async () => {
    vi.mocked(updateNote).mockRejectedValue(new Error('locked'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await updateNoteAction(
      NOTE_ID,
      initialState,
      noteForm({ title: 'x', content: validContent }),
    );
    expect(result.error).toMatch(/couldn't save your note/);
  });

  it('requires authentication', async () => {
    vi.mocked(requireUser).mockImplementation(() => nextNavigation.redirect('/authenticate'));
    await expect(
      updateNoteAction(NOTE_ID, initialState, noteForm({ title: 'x', content: validContent })),
    ).rejects.toThrow('NEXT_REDIRECT:/authenticate');
    expect(updateNote).not.toHaveBeenCalled();
  });
});

describe('deleteNoteAction', () => {
  it("deletes the user's note and redirects to the dashboard", async () => {
    await expect(deleteNoteAction(NOTE_ID)).rejects.toThrow('NEXT_REDIRECT:/dashboard');
    expect(deleteNote).toHaveBeenCalledWith(testUser.id, NOTE_ID);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('requires authentication', async () => {
    vi.mocked(requireUser).mockImplementation(() => nextNavigation.redirect('/authenticate'));
    await expect(deleteNoteAction(NOTE_ID)).rejects.toThrow('NEXT_REDIRECT:/authenticate');
    expect(deleteNote).not.toHaveBeenCalled();
  });
});
