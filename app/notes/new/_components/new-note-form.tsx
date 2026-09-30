'use client';

import { useActionState, useRef } from 'react';
import Link from 'next/link';
import type { JSONContent } from '@tiptap/react';
import NoteEditor from '@/app/_components/note-editor';
import { createNoteAction, type NewNoteState } from '../actions';

// React resets uncontrolled inputs after a form action, so the submitted
// values are kept in state and fed back as defaults when saving fails.
type NewNoteFormState = NewNoteState & { title?: string; isPublic?: boolean };

const initialState: NewNoteFormState = { error: null };

export default function NewNoteForm() {
  // The document never affects rendering, so it lives in a ref rather than
  // state: typing doesn't re-render the form, and it's read once on submit.
  const contentRef = useRef<JSONContent | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: NewNoteFormState, formData: FormData): Promise<NewNoteFormState> => {
      formData.set('content', JSON.stringify(contentRef.current ?? { type: 'doc' }));
      const result = await createNoteAction(prevState, formData);
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
          maxLength={200}
          autoFocus
          placeholder='Untitled note'
          defaultValue={state.title}
          className='rounded-md border border-foreground/20 bg-background px-3 py-2 text-base font-normal focus-visible:border-foreground/50 focus-visible:outline-none'
        />
      </label>

      <div className='flex flex-col gap-1'>
        <span id='note-content-label' className='text-sm font-medium'>
          Content
        </span>
        <NoteEditor
          onChange={(json) => {
            contentRef.current = json;
          }}
          labelId='note-content-label'
        />
      </div>

      <label className='flex items-center gap-2 text-sm font-medium'>
        <input
          type='checkbox'
          name='isPublic'
          defaultChecked={state.isPublic}
          className='size-4'
        />
        Share publicly (anyone with the link can view)
      </label>

      {state.error && (
        <p role='alert' className='text-sm text-red-600'>
          {state.error}
        </p>
      )}

      <div className='flex items-center justify-end gap-3'>
        <Link
          href='/dashboard'
          className='rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50'
        >
          {isPending ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </form>
  );
}
