import { requireUser } from "@/lib/auth";
import Header from "@/app/_components/header";
import NewNoteForm from "./_components/new-note-form";

export default async function NewNotePage() {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Header userEmail={user.email} />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">New note</h1>
        <NewNoteForm />
      </main>
    </div>
  );
}
