"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteNoteAction } from "../actions";

type DeleteNoteButtonProps = {
  noteId: string;
  title: string;
};

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export default function DeleteNoteButton({ noteId, title }: DeleteNoteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md border border-red-600/40 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600/10 dark:text-red-400"
      >
        Delete
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-note-title"
        aria-describedby="delete-note-description"
        closedby="any"
        className="m-auto w-full max-w-md rounded-lg border border-foreground/10 bg-background p-6 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <h2 id="delete-note-title" className="text-lg font-semibold">
          Delete note?
        </h2>
        <p id="delete-note-description" className="mt-2 text-sm text-foreground/70">
          &ldquo;<span className="break-words">{title}</span>&rdquo; will be permanently deleted.
          This can&rsquo;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              Cancel
            </button>
          </form>
          <form action={deleteNoteAction.bind(null, noteId)}>
            <ConfirmDeleteButton />
          </form>
        </div>
      </dialog>
    </>
  );
}
