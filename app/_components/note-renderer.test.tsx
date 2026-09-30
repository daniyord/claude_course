import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import NoteRenderer from '@/app/_components/note-renderer';

const render = (...content: JSONContent[]) =>
  renderToStaticMarkup(<NoteRenderer content={{ type: 'doc', content }} />);

const text = (value: string, marks?: JSONContent['marks']): JSONContent => ({
  type: 'text',
  text: value,
  marks,
});

describe('NoteRenderer', () => {
  it('shows a placeholder for an empty note', () => {
    expect(render()).toContain('This note is empty.');
    expect(render({ type: 'paragraph' })).toContain('This note is empty.');
  });

  it('renders a note containing only a horizontal rule', () => {
    expect(render({ type: 'horizontalRule' })).toContain('<hr');
  });

  it('escapes text instead of injecting HTML', () => {
    const html = render({ type: 'paragraph', content: [text('<img src=x onerror=alert(1)>')] });
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('<img');
  });

  it('renders marks', () => {
    const html = render({
      type: 'paragraph',
      content: [
        text('b', [{ type: 'bold' }]),
        text('i', [{ type: 'italic' }]),
        text('c', [{ type: 'code' }]),
      ],
    });
    expect(html).toMatch(/<strong[^>]*>b<\/strong>/);
    expect(html).toContain('<em>i</em>');
    expect(html).toMatch(/<code[^>]*>c<\/code>/);
  });

  it('shifts heading levels down so the page title stays the only h1', () => {
    const heading = (level: number) => ({
      type: 'heading',
      attrs: { level },
      content: [text(`H${level}`)],
    });
    const html = render(heading(1), heading(2), heading(3));
    expect(html).toMatch(/<h2[^>]*>.*H1.*<\/h2>/);
    expect(html).toMatch(/<h3[^>]*>.*H2.*<\/h3>/);
    expect(html).toMatch(/<h4[^>]*>.*H3.*<\/h4>/);
    expect(html).not.toContain('<h1');
  });

  it('renders lists, code blocks and hard breaks', () => {
    const html = render(
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [text('item')] }] }],
      },
      { type: 'codeBlock', content: [text('const a = 1;')] },
      { type: 'paragraph', content: [text('a'), { type: 'hardBreak' }, text('b')] },
    );
    expect(html).toMatch(/<ul[^>]*><li[^>]*><p[^>]*><span>item<\/span><\/p><\/li><\/ul>/);
    expect(html).toMatch(/<pre[^>]*><code>const a = 1;<\/code><\/pre>/);
    expect(html).toContain('<br/>');
  });

  it('ignores unknown node types', () => {
    const html = render(
      { type: 'paragraph', content: [text('kept')] },
      { type: 'iframe', attrs: { src: 'https://evil.example' } },
    );
    expect(html).toContain('kept');
    expect(html).not.toContain('iframe');
  });
});
