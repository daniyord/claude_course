import ErrorMessage from './_components/error-message';

export default function NotFound() {
  return (
    <ErrorMessage
      title='Page not found'
      description="The page you're looking for doesn't exist, or you don't have access to it."
    />
  );
}
