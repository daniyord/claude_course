import type { ReactNode } from 'react';
import type { JSONContent } from '@tiptap/core';

type NoteRendererProps = {
  content: JSONContent;
};

function renderText(node: JSONContent, key: number): ReactNode {
  let element: ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') element = <strong className='font-semibold'>{element}</strong>;
    else if (mark.type === 'italic') element = <em>{element}</em>;
    else if (mark.type === 'code')
      element = <code className='rounded bg-foreground/10 px-1 font-mono text-sm'>{element}</code>;
  }
  return <span key={key}>{element}</span>;
}

function renderChildren(node: JSONContent): ReactNode {
  return node.content?.map(renderNode);
}

function renderNode(node: JSONContent, key: number): ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node, key);
    case 'paragraph':
      return (
        <p key={key} className='my-3 leading-7'>
          {renderChildren(node)}
        </p>
      );
    case 'heading': {
      const level = Number(node.attrs?.level);
      if (level === 1)
        return (
          <h2 key={key} className='mt-8 mb-3 text-2xl font-semibold tracking-tight'>
            {renderChildren(node)}
          </h2>
        );
      if (level === 2)
        return (
          <h3 key={key} className='mt-6 mb-2 text-xl font-semibold tracking-tight'>
            {renderChildren(node)}
          </h3>
        );
      return (
        <h4 key={key} className='mt-5 mb-2 text-lg font-semibold'>
          {renderChildren(node)}
        </h4>
      );
    }
    case 'bulletList':
      return (
        <ul key={key} className='my-3 list-disc space-y-1 pl-6 marker:text-foreground/50'>
          {renderChildren(node)}
        </ul>
      );
    case 'listItem':
      return (
        <li key={key} className='[&>p]:my-1'>
          {renderChildren(node)}
        </li>
      );
    case 'codeBlock':
      return (
        <pre
          key={key}
          className='my-4 overflow-x-auto rounded-md bg-foreground/10 p-4 font-mono text-sm leading-6'
        >
          <code>{node.content?.map((child) => child.text ?? '').join('')}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} className='my-6 border-foreground/20' />;
    case 'hardBreak':
      return <br key={key} />;
    default:
      return null;
  }
}

export default function NoteRenderer({ content }: NoteRendererProps) {
  if (!content.content?.some((node) => node.content?.length || node.type === 'horizontalRule')) {
    return <p className='text-foreground/60 italic'>This note is empty.</p>;
  }
  return <div className='break-words'>{renderChildren(content)}</div>;
}
