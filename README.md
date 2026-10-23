# chapterly

A publishing app for serialized stories. Writers sign up, draft a story chapter
by chapter, and publish when they are ready; anyone can read the shelf without
an account.

## What it does

- **Shelf** (`/`) — every published story, newest activity first.
- **Story page** (`/stories/<slug>`) — synopsis and the published chapters.
- **Reader** (`/stories/<slug>/chapter/<position>`) — one chapter, with
  previous/next navigation.
- **Sign up / sign in** (`/signup`, `/signin`) — writer accounts.
- **Writing desk** (`/dashboard`) — your stories, drafts included.
  - `/dashboard/new` — start a story.
  - `/dashboard/<id>` — edit story details, publish/unpublish, add and manage
    chapters, delete a story.
  - `/dashboard/<id>/chapters/<chapterId>` — edit one chapter.

A story is visible publicly only once it is published, and only its *published*
chapters are readable. Draft stories and unpublished chapters are visible to
their author alone.

## Stack

- **Next.js 15** (App Router, React 19 server components) — one service serving
  both the UI and the JSON API on port 3000.
- **PostgreSQL** for writers, sessions, stories and chapters.
- Plain CSS in `app/globals.css`; no UI framework, no external services.

## Running it

With Docker Compose (the way the Base44 sandbox runs it):

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Then open <http://localhost:3000>.

On a plain machine without Docker you can also run it directly:

```bash
npm install
DATABASE_URL=postgresql://user:pass@localhost:5432/chapterly npm run dev
```

The schema and demo content live in `db/schema.sql` and `db/seed.sql`. Both are
idempotent and are applied once per boot by the one-shot `db-setup` service.

### Demo account

The seed creates one writer so the shelf is not empty:

| email               | password   | pen name   |
| ------------------- | ---------- | ---------- |
| `aria@chapterly.dev` | `demo1234` | Aria Malik |

It comes with two published stories, *The Lantern Keeper* and *Salt & Paper*.

## Layout

```
app/            routes (pages) and API route handlers
  api/          auth, stories and chapters endpoints
  dashboard/    the writer's private side
components/     UI: nav, story card, forms, action buttons
lib/            db pool, password/session helpers, story queries
db/             schema.sql + seed.sql
```

## Sandbox / preview notes

The only sandbox-specific override is in `next.config.mjs`: when
`BASE44_PREVIEW_MODE` is exactly `"1"`, the hosts `3000-<public host suffix>`
and `3000-<sandbox host domain>` are added to Next's `allowedDevOrigins`, because
the preview proxy forwards requests with an `Origin` (the public host) that
differs from the `Host` the dev server sees (the sandbox host). Next.js would
otherwise refuse dev asset and HMR requests from the preview origin.

With `BASE44_PREVIEW_MODE` unset — or any other value — the allowlist stays
empty and the app behaves exactly as it does on a normal machine. Nothing else
in the app depends on the flag, and the app itself needs no external
credentials.
