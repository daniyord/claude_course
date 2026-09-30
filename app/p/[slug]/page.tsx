import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseNoteContent } from '@/lib/note-content';
import { getNoteByPublicSlug } from '@/lib/notes';
import NoteRenderer from '@/app/_components/note-renderer';

export async function generateMetadata(props: PageProps<'/p/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const note = await getNoteByPublicSlug(slug);
  return {
    title: note?.title ?? 'Note not found',
    robots: { index: false, follow: false },
  };
}

export default async function PublicNotePage(props: PageProps<'/p/[slug]'>) {
  const { slug } = await props.params;
  const note = await getNoteByPublicSlug(slug);
  if (!note) notFound();

  return (
    <div className='min-h-screen'>
      <main className='mx-auto max-w-3xl px-6 py-8'>
        <Link
          href='/'
          className='rounded-md text-sm text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
        >
          &larr; Home
        </Link>
        <article className='mt-4'>
          <header className='mb-6 border-b border-foreground/10 pb-4'>
            <h1 className='text-3xl font-semibold tracking-tight break-words'>{note.title}</h1>
            <p className='mt-2 text-sm text-foreground/60'>Shared note · read-only</p>
          </header>
          <NoteRenderer content={parseNoteContent(note.contentJson)} />
        </article>
      </main>
    </div>
  );
}
