import Link from 'next/link';
import type { User } from '@/lib/auth';
import { signOutAction } from './actions';
import LogoutButton from './logout-button';

type HeaderProps = {
  user: Pick<User, 'name' | 'email'>;
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className='flex items-center justify-between border-b border-foreground/10 px-6 py-4'>
      <Link
        href='/dashboard'
        aria-label='NextNotes home'
        className='flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground'
      >
        <span
          aria-hidden='true'
          className='grid size-7 place-items-center rounded-md bg-foreground text-sm font-bold text-background'
        >
          N
        </span>
        NextNotes
      </Link>
      <div className='flex items-center gap-4'>
        <div className='hidden flex-col items-end text-sm leading-tight sm:flex' title={user.email}>
          <span className='font-medium'>{user.name}</span>
          <span className='text-foreground/60'>{user.email}</span>
        </div>
        <form action={signOutAction}>
          <LogoutButton />
        </form>
      </div>
    </header>
  );
}
