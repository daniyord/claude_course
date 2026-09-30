'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { parseNoteFormData } from '@/lib/note-schema';
import { createNote } from '@/lib/notes';

export type NewNoteState = { error: string | null };

const GENERIC_SAVE_ERROR = "We couldn't save your note right now. Please try again in a moment.";

export async function createNoteAction(
  _prevState: NewNoteState,
  formData: FormData,
): Promise<NewNoteState> {
  const user = await requireUser();

  const parsed = parseNoteFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_SAVE_ERROR };
  }

  try {
    await createNote(user.id, {
      title: parsed.data.title,
      contentJson: JSON.stringify(parsed.data.content),
      isPublic: parsed.data.isPublic,
    });
  } catch (error) {
    console.error('Failed to create note', { userId: user.id, error });
    return { error: GENERIC_SAVE_ERROR };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
