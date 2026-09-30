import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseNoteContent } from "@/lib/note-content";
import { getNoteById } from "@/lib/notes";
import Header from "@/app/_components/header";
import EditNoteForm from "./_components/edit-note-form";

export default async function EditNotePage(props: PageProps<"/notes/[id]/edit">) {
  const user = await requireUser();
  const { id } = await props.params;
  const note = await getNoteById(user.id, id);
  if (!note) notFound();

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit note</h1>
        <EditNoteForm
          noteId={note.id}
          title={note.title}
          content={parseNoteContent(note.contentJson)}
        />
      </main>
    </div>
  );
}
