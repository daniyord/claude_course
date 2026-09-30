import { describe, expect, it } from 'vitest';
import { noteInputSchema, parseNoteFormData } from '@/lib/note-schema';
import { ZWSP } from '@/test/unicode';

const validContent = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }],
});

const parse = (input: Record<string, unknown>) =>
  noteInputSchema.safeParse({ title: 'Note', content: validContent, isPublic: false, ...input });

const firstError = (result: ReturnType<typeof parse>) => result.error?.issues[0]?.message;

describe('noteInputSchema', () => {
  it('parses valid input and returns sanitized content', () => {
    const result = parse({ title: `  My${ZWSP} note `, isPublic: true });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: 'My note',
      content: JSON.parse(validContent),
      isPublic: true,
    });
  });

  it('defaults a blank title to "Untitled note"', () => {
    expect(parse({ title: `  ${ZWSP} ` }).data?.title).toBe('Untitled note');
  });

  it('rejects a title longer than 200 characters after sanitizing', () => {
    expect(firstError(parse({ title: 'a'.repeat(201) }))).toBe(
      'Title must be 200 characters or fewer',
    );
  });

  it('accepts a long raw title that collapses to 200 characters or fewer', () => {
    expect(parse({ title: `a${' '.repeat(500)}b` }).data?.title).toBe('a b');
  });

  it('rejects a raw title over 1000 characters before sanitizing', () => {
    expect(parse({ title: ' '.repeat(1_001) }).success).toBe(false);
  });

  it('rejects a missing title', () => {
    expect(firstError(parse({ title: undefined }))).toBe('Please enter a title.');
  });

  it('rejects content that is not valid JSON', () => {
    expect(firstError(parse({ content: '{oops' }))).toMatch(/formatting we can't save/);
  });

  it('rejects content with disallowed nodes', () => {
    const content = JSON.stringify({ type: 'doc', content: [{ type: 'image' }] });
    expect(firstError(parse({ content }))).toMatch(/formatting we can't save/);
  });

  it('rejects oversized content', () => {
    expect(firstError(parse({ content: 'x'.repeat(500_001) }))).toMatch(/too long to save/);
  });

  it('rejects non-string content', () => {
    expect(firstError(parse({ content: 123 }))).toMatch(/couldn't read your note's content/);
  });
});

describe('parseNoteFormData', () => {
  const form = (entries: Record<string, string>) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(entries)) formData.set(key, value);
    return formData;
  };

  it('maps a checked isPublic checkbox to true', () => {
    const result = parseNoteFormData(form({ title: 'T', content: validContent, isPublic: 'on' }));
    expect(result.data?.isPublic).toBe(true);
  });

  it('maps a missing isPublic checkbox to false', () => {
    const result = parseNoteFormData(form({ title: 'T', content: validContent }));
    expect(result.data?.isPublic).toBe(false);
  });

  it('treats a missing title as blank', () => {
    expect(parseNoteFormData(form({ content: validContent })).data?.title).toBe('Untitled note');
  });

  it('fails when content is missing', () => {
    expect(parseNoteFormData(form({ title: 'T' })).success).toBe(false);
  });
});
