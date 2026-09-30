import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth, getCurrentUser, requireUser } from '@/lib/auth';
import { cleanUserName } from '@/lib/user-name';
import { ZWSP } from '@/test/unicode';

const { headers, redirect } = vi.hoisted(() => ({
  headers: vi.fn(async () => new Headers({ cookie: 'session=abc' })),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next/headers', () => ({ headers }));
vi.mock('next/navigation', () => ({ redirect }));

const user = { id: 'user-1', name: 'Ada', email: 'ada@example.com' };

let getSession: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  getSession = vi.spyOn(auth.api, 'getSession');
});

describe('getCurrentUser', () => {
  it('returns the session user, forwarding the request headers', async () => {
    getSession.mockResolvedValue({ user, session: {} });
    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(getSession.mock.calls[0][0].headers.get('cookie')).toBe('session=abc');
  });

  it('returns null without a session', async () => {
    getSession.mockResolvedValue(null);
    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe('requireUser', () => {
  it('returns the signed-in user', async () => {
    getSession.mockResolvedValue({ user, session: {} });
    await expect(requireUser()).resolves.toEqual(user);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects anonymous visitors to /authenticate', async () => {
    getSession.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT:/authenticate');
    expect(redirect).toHaveBeenCalledWith('/authenticate');
  });
});

describe('user database hooks', () => {
  const hooks = auth.options.databaseHooks!.user!;
  const create = hooks.create!.before!;
  const update = hooks.update!.before!;

  it('sanitizes the name on sign-up', async () => {
    const result = await create({ name: `  Ada${ZWSP}  `, email: 'a@b.c' } as never);
    expect(result).toMatchObject({ data: { name: cleanUserName(`  Ada${ZWSP}  `) } });
  });

  it('rejects an invalid name on sign-up', async () => {
    await expect(create({ name: '   ', email: 'a@b.c' } as never)).rejects.toThrow();
  });

  it('leaves updates without a name untouched', async () => {
    const data = { image: 'x.png' };
    await expect(update(data as never)).resolves.toEqual({ data });
  });

  it('sanitizes the name on update', async () => {
    await expect(update({ name: ' Grace  Hopper ' } as never)).resolves.toEqual({
      data: { name: 'Grace Hopper' },
    });
  });
});
