# CLAUDE.md

We are building the app described in @SPEC.MD. Read that file for genral architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concide and focus on conveying the key ynformation. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is an early-stage Next.js app. Currently it's just the `create-next-app` scaffold — `app/page.tsx` renders a placeholder "Hello World" page. The real product to build is defined in `SPEC.MD`: a rich-text note-taking web app (auth, CRUD notes via TipTap, public note sharing). Read `SPEC.MD` before implementing any feature — it defines the DB schema, API contract, routes, and component boundaries in detail. Treat it as the source of truth for architecture decisions, not as already-implemented behavior.

## Commands

This project uses **Bun** as the package manager and intended runtime (see `bun.lock`, `SPEC.MD` §1 "Tech").

```bash
bun install       # install dependencies
bun dev           # next dev — start dev server on http://localhost:3000
bun run build     # next build
bun run start     # next start
bun run lint      # eslint
```

There is no test suite configured yet.

## Architecture (per SPEC.MD — target state)

- **Framework:** Next.js App Router. Server components for data fetching, client components for the TipTap editor and other interactive UI, Route Handlers (`app/api/.../route.ts`) for JSON APIs.
- **Auth:** `better-auth`, integrated via middleware + server helpers (e.g. a `getCurrentUser()`/`getSession()` helper). All `/dashboard` and `/notes/[id]` routes must check auth server-side; all `/api/notes` handlers (except the public read) must return 401 if unauthenticated.
- **Database:** Single SQLite file (`data/app.db`) accessed through Bun's built-in SQLite client using **raw SQL** (no ORM). `lib/db.ts` is meant to hold the singleton connection plus `query`/`get`/`run` helpers; `lib/notes.ts` is meant to hold the note repository functions. Every note query must scope by `user_id` to prevent cross-user access — this is the primary authorization mechanism, not a defense-in-depth extra.
- **Editor:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`), storing content as JSON (`content_json`), never as raw HTML. When rendering read-only content, use TipTap's own rendering — never `dangerouslySetInnerHTML` on unsanitized data.
- **Public sharing:** toggling a note public generates a random `public_slug` (16+ chars, via `nanoid()`); `/p/[slug]` resolves notes by slug for anonymous, read-only viewing. Disabling sharing clears the slug and the route 404s.
- **Styling:** TailwindCSS v4 (via `@tailwindcss/postcss`), utility classes on components; typography plugin considered for read-only note rendering.
- **Validation:** `zod` for input validation on API routes.

Key routes from the spec: `/` (landing), `/dashboard` (note list, authenticated), `/notes/[id]` (editor, authenticated), `/p/[slug]` (public read-only view). API base path is `/api/notes`, with a separate `/api/public-notes/:slug` (or resolve directly server-side in `/p/[slug]`).

## Tool selection

Per the user's global instructions, Serena's symbol-aware MCP tools (`get_symbols_overview`, `find_symbol`, `replace_symbol_body`, etc.) are the primary tools for reading and editing code files in this repo. Built-in Read/Edit/Grep are for non-code files (`SPEC.MD`, JSON/YAML/config, `.env`) or as a fallback when Serena can't handle the target.
