import { describe, expect, it } from 'vitest';
import { InvalidNoteContentError, parseNoteContent, sanitizeNoteContent } from '@/lib/note-content';
import { RLO, ZWSP } from '@/test/unicode';

const doc = (...content: unknown[]) => ({ type: 'doc', content });
const paragraph = (text: string, marks?: unknown[]) => ({
  type: 'paragraph',
  content: [{ type: 'text', text, ...(marks && { marks }) }],
});

describe('sanitizeNoteContent', () => {
  it('returns a valid document unchanged', () => {
    const input = doc(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
      paragraph('bold', [{ type: 'bold' }]),
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [paragraph('item')] }],
      },
    );
    expect(sanitizeNoteContent(input)).toEqual(input);
  });

  it('fills an empty document with an empty paragraph', () => {
    expect(sanitizeNoteContent({ type: 'doc', content: [] })).toEqual(doc({ type: 'paragraph' }));
    expect(sanitizeNoteContent({ type: 'doc' })).toEqual(doc({ type: 'paragraph' }));
  });

  it('strips unsafe characters from text', () => {
    expect(sanitizeNoteContent(doc(paragraph(`he${ZWSP}llo\u0000`)))).toEqual(
      doc(paragraph('hello')),
    );
  });

  it('drops text nodes that become empty after sanitizing', () => {
    expect(sanitizeNoteContent(doc(paragraph(`${ZWSP}${RLO}`)))).toEqual(
      doc({ type: 'paragraph' }),
    );
  });

  it('keeps a valid code block language and nulls an unsafe one', () => {
    const codeBlock = (language: string) => ({
      type: 'codeBlock',
      attrs: { language },
      content: [{ type: 'text', text: 'x' }],
    });
    const lang = (input: unknown) =>
      (sanitizeNoteContent(input).content?.[0].attrs as { language: unknown }).language;

    expect(lang(doc(codeBlock('typescript')))).toBe('typescript');
    expect(lang(doc(codeBlock('"><script>')))).toBeNull();
  });

  it.each([
    ['an unknown node type', doc({ type: 'iframe' })],
    ['a disabled node type', doc({ type: 'blockquote', content: [paragraph('x')] })],
    ['an unknown mark', doc(paragraph('x', [{ type: 'link', attrs: { href: 'javascript:1' } }]))],
    [
      'a disallowed heading level',
      doc({ type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'x' }] }),
    ],
    ['a non-doc root', paragraph('x')],
    ['an invalid structure', doc({ type: 'text', text: 'loose text' })],
    ['a non-object', 'hello'],
    ['null', null],
  ])('rejects %s', (_label, input) => {
    expect(() => sanitizeNoteContent(input)).toThrow(InvalidNoteContentError);
  });
});

describe('parseNoteContent', () => {
  it('parses stored JSON', () => {
    const content = doc(paragraph('hi'));
    expect(parseNoteContent(JSON.stringify(content))).toEqual(content);
  });

  it('falls back to an empty document on invalid JSON', () => {
    expect(parseNoteContent('{not json')).toEqual({ type: 'doc', content: [] });
  });
});
