'use client';

import './globals.css';
import ErrorMessage from './_components/error-message';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        <ErrorMessage
          title='Something went wrong'
          description='NextNotes ran into an unexpected problem. Please try again in a moment.'
          digest={error.digest}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
