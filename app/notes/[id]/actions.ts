'use server';

import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { parseNoteFormData } from '@/lib/note-schema';
import { deleteNote, updateNote } from '@/lib/notes';

export type EditNoteState = { error: string | null };

const GENERIC_SAVE_ERROR = "We couldn't save your note right now. Please try again in a moment.";

export async function updateNoteAction(
  noteId: string,
  _prevState: EditNoteState,
  formData: FormData,
): Promise<EditNoteState> {
  const user = await requireUser();

  const parsed = parseNoteFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_SAVE_ERROR };
  }

  let updated: boolean;
  try {
    updated = await updateNote(user.id, noteId, {
      title: parsed.data.title,
      contentJson: JSON.stringify(parsed.data.content),
      isPublic: parsed.data.isPublic,
    });
  } catch (error) {
    console.error('Failed to update note', { userId: user.id, noteId, error });
    return { error: GENERIC_SAVE_ERROR };
  }
  if (!updated) notFound();

  revalidatePath('/dashboard');
  revalidatePath(`/notes/${noteId}`);
  redirect(`/notes/${noteId}`);
}

export async function deleteNoteAction(noteId: string): Promise<void> {
  const user = await requireUser();
  await deleteNote(user.id, noteId);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}
