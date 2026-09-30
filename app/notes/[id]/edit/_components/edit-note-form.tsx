'use client';

import { useActionState, useRef } from 'react';
import Link from 'next/link';
import type { JSONContent } from '@tiptap/react';
import NoteEditor from '@/app/_components/note-editor';
import { updateNoteAction, type EditNoteState } from '../../actions';

type EditNoteFormProps = {
  noteId: string;
  title: string;
  content: JSONContent;
  isPublic: boolean;
};

// React resets uncontrolled inputs after a form action, so the submitted
// values are kept in state and fed back as defaults when saving fails.
type EditNoteFormState = EditNoteState & { title?: string; isPublic?: boolean };

const initialState: EditNoteFormState = { error: null };

export default function EditNoteForm({ noteId, title, content, isPublic }: EditNoteFormProps) {
  const contentRef = useRef<JSONContent>(content);

  const [state, formAction, isPending] = useActionState(
    async (prevState: EditNoteFormState, formData: FormData): Promise<EditNoteFormState> => {
      formData.set('content', JSON.stringify(contentRef.current));
      const result = await updateNoteAction(noteId, prevState, formData);
      return {
        ...result,
        title: String(formData.get('title') ?? ''),
        isPublic: formData.get('isPublic') === 'on',
      };
    },
    initialState,
  );

  return (
    <form action={formAction} className='flex flex-col gap-6'>
      <label className='flex flex-col gap-1 text-sm font-medium'>
        Title
        <input
          type='text'
          name='title'
          placeholder='Untitled note'
          maxLength={200}
          defaultValue={state.title ?? title}
          className='rounded-md border border-foreground/20 bg-background px-3 py-2 text-base font-normal focus-visible:border-foreground/50 focus-visible:outline-none'
        />
      </label>

      <div className='flex flex-col gap-1'>
        <span id='note-content-label' className='text-sm font-medium'>
          Content
        </span>
        <NoteEditor
          content={content}
          onChange={(json) => {
            contentRef.current = json;
          }}
          labelId='note-content-label'
        />
      </div>

      <label className='flex items-center gap-2 text-sm font-medium'>
        <input type='checkbox' name='isPublic' defaultChecked={state.isPublic ?? isPublic} className='size-4' />
        Share publicly (anyone with the link can view)
      </label>

      {state.error && (
        <p role='alert' className='text-sm text-red-600'>
          {state.error}
        </p>
      )}

      <div className='flex items-center justify-end gap-3'>
        <Link
          href={`/notes/${noteId}`}
          className='rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50'
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
