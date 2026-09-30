import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseNoteContent } from "@/lib/note-content";
import { getNoteById } from "@/lib/notes";
import Header from "../../_components/header";
import NoteRenderer from "../../_components/note-renderer";
import DeleteNoteButton from "./_components/delete-note-button";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function NotePage(props: PageProps<"/notes/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const note = await getNoteById(user.id, id);
  if (!note) notFound();

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="rounded-md text-sm text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            &larr; Back to notes
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/notes/${note.id}/edit`}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Edit
            </Link>
            <DeleteNoteButton noteId={note.id} title={note.title} />
          </div>
        </div>
        <article className="mt-4">
          <header className="mb-6 border-b border-foreground/10 pb-4">
            <h1 className="text-3xl font-semibold tracking-tight break-words">{note.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-foreground/60">
              <span>
                Updated{" "}
                <time dateTime={note.updatedAt}>
                  {dateFormatter.format(new Date(note.updatedAt))}
                </time>
              </span>
              {note.isPublic && (
                <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Public
                </span>
              )}
            </p>
          </header>
          <NoteRenderer content={parseNoteContent(note.contentJson)} />
        </article>
      </main>
    </div>
  );
}
