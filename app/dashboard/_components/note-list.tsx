import Link from "next/link";
import type { NoteSummary } from "@/lib/notes";

type NoteListProps = {
  notes: NoteSummary[];
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-foreground/20 px-6 py-12 text-center">
        <p className="font-medium">No notes yet</p>
        <p className="mt-1 text-sm text-foreground/60">
          Create your first note to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-foreground/10 overflow-hidden rounded-lg border border-foreground/10">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{note.title}</p>
              <p className="text-sm text-foreground/60">
                Updated{" "}
                <time dateTime={note.updatedAt}>
                  {dateFormatter.format(new Date(note.updatedAt))}
                </time>
              </p>
            </div>
            {note.isPublic && (
              <span className="shrink-0 rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                Public
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
