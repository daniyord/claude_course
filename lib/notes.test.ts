import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from '@/lib/db';
import {
  createNote,
  deleteNote,
  getNoteById,
  getNoteByPublicSlug,
  getNotesByUser,
  updateNote,
} from '@/lib/notes';

// Runs against the real SQLite schema; vitest.config.ts points DB_PATH at an in-memory database.

const ALICE = 'user-alice';
const BOB = 'user-bob';
const content = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

beforeEach(() => {
  run('DELETE FROM notes');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createNote', () => {
  it('creates a private note with defaults', async () => {
    const note = await createNote(ALICE);
    expect(note).toMatchObject({
      userId: ALICE,
      title: 'Untitled note',
      contentJson: JSON.stringify({ type: 'doc', content: [] }),
      isPublic: false,
      publicSlug: null,
    });
    expect(await getNoteById(ALICE, note.id)).toEqual(note);
  });

  it('generates a public slug of at least 16 characters for public notes', async () => {
    const note = await createNote(ALICE, { title: 'Shared', contentJson: content, isPublic: true });
    expect(note.publicSlug?.length).toBeGreaterThanOrEqual(16);
    expect(await getNoteByPublicSlug(note.publicSlug!)).toEqual(note);
  });

  it('generates unique ids and slugs', async () => {
    const a = await createNote(ALICE, { isPublic: true });
    const b = await createNote(ALICE, { isPublic: true });
    expect(a.id).not.toBe(b.id);
    expect(a.publicSlug).not.toBe(b.publicSlug);
  });
});

describe('getNotesByUser', () => {
  it("returns only the user's notes, most recently updated first", async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const older = await createNote(ALICE, { title: 'Older' });
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));
    const newer = await createNote(ALICE, { title: 'Newer', isPublic: true });
    await createNote(BOB, { title: "Bob's" });

    expect(await getNotesByUser(ALICE)).toEqual([
      { id: newer.id, title: 'Newer', isPublic: true, updatedAt: newer.updatedAt },
      { id: older.id, title: 'Older', isPublic: false, updatedAt: older.updatedAt },
    ]);
  });

  it('returns an empty list for a user without notes', async () => {
    expect(await getNotesByUser('nobody')).toEqual([]);
  });
});

describe('getNoteById', () => {
  it("does not return another user's note", async () => {
    const note = await createNote(ALICE);
    expect(await getNoteById(BOB, note.id)).toBeNull();
  });

  it('returns null for an unknown id', async () => {
    expect(await getNoteById(ALICE, 'missing')).toBeNull();
  });
});

describe('getNoteByPublicSlug', () => {
  it('returns null for an unknown slug', async () => {
    expect(await getNoteByPublicSlug('does-not-exist')).toBeNull();
  });

  it('does not return a note that is no longer public', async () => {
    const note = await createNote(ALICE, { isPublic: true });
    run('UPDATE notes SET is_public = 0 WHERE id = ?', [note.id]);
    expect(await getNoteByPublicSlug(note.publicSlug!)).toBeNull();
  });
});

describe('updateNote', () => {
  const edit = (isPublic: boolean) => ({ title: 'Edited', contentJson: content, isPublic });

  it('updates title, content and updated_at', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const note = await createNote(ALICE);
    vi.setSystemTime(new Date('2026-02-01T00:00:00Z'));

    expect(await updateNote(ALICE, note.id, edit(false))).toBe(true);
    expect(await getNoteById(ALICE, note.id)).toMatchObject({
      title: 'Edited',
      contentJson: content,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    });
  });

  it('issues a slug when a note is made public', async () => {
    const note = await createNote(ALICE);
    await updateNote(ALICE, note.id, edit(true));
    const updated = await getNoteById(ALICE, note.id);
    expect(updated?.isPublic).toBe(true);
    expect(updated?.publicSlug?.length).toBeGreaterThanOrEqual(16);
  });

  it('keeps the existing slug while the note stays public', async () => {
    const note = await createNote(ALICE, { isPublic: true });
    await updateNote(ALICE, note.id, edit(true));
    expect((await getNoteById(ALICE, note.id))?.publicSlug).toBe(note.publicSlug);
  });

  it('clears the slug when sharing is disabled, and issues a new one when re-shared', async () => {
    const note = await createNote(ALICE, { isPublic: true });

    await updateNote(ALICE, note.id, edit(false));
    expect(await getNoteById(ALICE, note.id)).toMatchObject({ isPublic: false, publicSlug: null });
    expect(await getNoteByPublicSlug(note.publicSlug!)).toBeNull();

    await updateNote(ALICE, note.id, edit(true));
    const reshared = await getNoteById(ALICE, note.id);
    expect(reshared?.publicSlug).toBeTruthy();
    expect(reshared?.publicSlug).not.toBe(note.publicSlug);
  });

  it("does not update another user's note", async () => {
    const note = await createNote(ALICE, { title: 'Original' });
    expect(await updateNote(BOB, note.id, edit(true))).toBe(false);
    expect(await getNoteById(ALICE, note.id)).toEqual(note);
  });
});

describe('deleteNote', () => {
  it('deletes the note', async () => {
    const note = await createNote(ALICE);
    expect(await deleteNote(ALICE, note.id)).toBe(true);
    expect(await getNoteById(ALICE, note.id)).toBeNull();
  });

  it("does not delete another user's note", async () => {
    const note = await createNote(ALICE);
    expect(await deleteNote(BOB, note.id)).toBe(false);
    expect(await getNoteById(ALICE, note.id)).not.toBeNull();
  });

  it('returns false for an unknown id', async () => {
    expect(await deleteNote(ALICE, 'missing')).toBe(false);
  });
});
