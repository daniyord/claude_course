'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type AuthMode = 'login' | 'register';

// Submitted values are echoed back because React resets uncontrolled inputs
// after a form action; they become the new defaultValues on error.
type AuthFormState = { error: string | null; name?: string; email?: string };

type AuthFormProps = {
  mode: AuthMode;
};

const initialState: AuthFormState = { error: null };

// Only known, user-actionable codes are shown; anything else falls back to a
// generic message so server internals never reach the UI.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password combination didn't work. Please try again.",
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Please enter your password.',
  PASSWORD_TOO_SHORT: 'Your password must be at least 8 characters.',
  PASSWORD_TOO_LONG: 'Your password must be 128 characters or fewer.',
  INVALID_NAME: 'Please enter a name between 1 and 100 characters.',
  USER_ALREADY_EXISTS:
    "We couldn't create an account with these details. If you already have an account, try logging in.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "We couldn't create an account with these details. If you already have an account, try logging in.",
};

function toFriendlyAuthError(error: { code?: string; status?: number }, mode: AuthMode): string {
  if (error.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return mode === 'register'
    ? "We couldn't create your account right now. Please try again."
    : "We couldn't log you in right now. Please try again.";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  async function submitAuth(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    try {
      const { error } =
        mode === 'register'
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });

      if (error) {
        return { error: toFriendlyAuthError(error, mode), name, email };
      }
    } catch {
      return {
        error: "We couldn't reach the server. Check your connection and try again.",
        name,
        email,
      };
    }

    router.push('/dashboard');
    router.refresh();
    return initialState;
  }

  const [state, formAction, isPending] = useActionState(submitAuth, initialState);

  const submitLabel = isPending
    ? mode === 'register'
      ? 'Creating account…'
      : 'Signing in…'
    : mode === 'register'
      ? 'Create account'
      : 'Log in';

  return (
    <form action={formAction} className='flex w-full max-w-sm flex-col gap-4'>
      {mode === 'register' && (
        <label className='flex flex-col gap-1 text-sm'>
          Name
          <input
            type='text'
            name='name'
            required
            maxLength={100}
            autoComplete='name'
            defaultValue={state.name}
            className='rounded-md border border-foreground/20 bg-background px-3 py-2'
          />
        </label>
      )}
      <label className='flex flex-col gap-1 text-sm'>
        Email
        <input
          type='email'
          name='email'
          required
          autoComplete='email'
          defaultValue={state.email}
          className='rounded-md border border-foreground/20 bg-background px-3 py-2'
        />
      </label>
      <label className='flex flex-col gap-1 text-sm'>
        Password
        <input
          type='password'
          name='password'
          required
          minLength={8}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          className='rounded-md border border-foreground/20 bg-background px-3 py-2'
        />
      </label>
      {state.error && (
        <p role='alert' className='text-sm text-red-600'>
          {state.error}
        </p>
      )}
      <button
        type='submit'
        disabled={isPending}
        className='rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50'
      >
        {submitLabel}
      </button>
    </form>
  );
}
