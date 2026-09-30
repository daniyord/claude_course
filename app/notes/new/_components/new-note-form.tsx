"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import NoteEditor from "@/app/_components/note-editor";
import { createNoteAction, type NewNoteState } from "../actions";

const initialState: NewNoteState = { error: null };

export default function NewNoteForm() {
  const [state, formAction, isPending] = useActionState(createNoteAction, initialState);
  const [content, setContent] = useState<JSONContent>({ type: "doc", content: [] });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          autoFocus
          placeholder="Untitled note"
          className="rounded-md border border-foreground/20 bg-background px-3 py-2 text-base font-normal focus-visible:border-foreground/50 focus-visible:outline-none"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span id="note-content-label" className="text-sm font-medium">
          Content
        </span>
        <NoteEditor content={content} onChange={setContent} labelId="note-content-label" />
        <input type="hidden" name="content" value={JSON.stringify(content)} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/dashboard"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save note"}
        </button>
      </div>
    </form>
  );
}
