import Link from 'next/link';

type ErrorMessageProps = {
  title: string;
  description: string;
  digest?: string;
  onRetry?: () => void;
};

export default function ErrorMessage({ title, description, digest, onRetry }: ErrorMessageProps) {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center'>
      <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
      <p className='max-w-md text-foreground/70'>{description}</p>
      {digest && (
        <p className='text-xs text-foreground/50'>
          Reference: <code className='font-mono'>{digest}</code>
        </p>
      )}
      <div className='mt-2 flex gap-3'>
        {onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90'
          >
            Try again
          </button>
        )}
        <Link
          href='/dashboard'
          className='rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5'
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
