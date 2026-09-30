import { get, query, run } from "@/lib/db";

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

export type NoteSummary = Pick<Note, "id" | "title" | "isPublic" | "updatedAt">;

type NoteSummaryRow = {
  id: string;
  title: string;
  is_public: number;
  updated_at: string;
};

export async function getNotesByUser(userId: string): Promise<NoteSummary[]> {
  const rows = query<NoteSummaryRow>(
    `SELECT id, title, is_public, updated_at
     FROM notes
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    isPublic: row.is_public === 1,
    updatedAt: row.updated_at,
  }));
}

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export async function getNoteById(userId: string, noteId: string): Promise<Note | null> {
  const row = get<NoteRow>(
    `SELECT id, user_id, title, content_json, is_public, public_slug, created_at, updated_at
     FROM notes
     WHERE id = ? AND user_id = ?`,
    [noteId, userId],
  );
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateNote(
  userId: string,
  noteId: string,
  { title, contentJson }: { title: string; contentJson: string },
): Promise<boolean> {
  const changes = run(
    `UPDATE notes
     SET title = ?, content_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [title, contentJson, new Date().toISOString(), noteId, userId],
  );
  return changes > 0;
}

export async function deleteNote(userId: string, noteId: string): Promise<boolean> {
  const changes = run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]);
  return changes > 0;
}
