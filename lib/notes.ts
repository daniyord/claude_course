import { run } from "@/lib/db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

export async function createNote(
  userId: string,
  { title, contentJson }: { title?: string; contentJson?: string } = {},
): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    userId,
    title: title || "Untitled note",
    contentJson: contentJson ?? EMPTY_DOC,
    isPublic: false,
    publicSlug: null,
    createdAt: now,
    updatedAt: now,
  };

  run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, NULL, ?, ?)`,
    [note.id, note.userId, note.title, note.contentJson, now, now],
  );

  return note;
}
