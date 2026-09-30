'use client';

import { useFormStatus } from 'react-dom';

export default function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className='rounded-md border border-foreground px-4 py-2 text-sm font-medium disabled:opacity-50'
    >
      {pending ? 'Logging out…' : 'Log out'}
    </button>
  );
}
