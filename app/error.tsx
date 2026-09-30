'use client';

import ErrorMessage from './_components/error-message';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Never render error.message: in development it contains server internals.
// The digest is an opaque id that matches the server log entry.
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <ErrorMessage
      title='Something went wrong'
      description='We hit an unexpected problem loading this page. Please try again — if it keeps happening, come back in a few minutes.'
      digest={error.digest}
      onRetry={reset}
    />
  );
}
