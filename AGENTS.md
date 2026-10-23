# Notes for agents working in this repo

`chapterly` was built in this repository from an empty initial commit (only a
README existed). It is a Next.js 15 App Router app with a local PostgreSQL —
one service serving both the UI and a JSON API.

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d --build   # web on :3000
```

- `web` runs `npm ci` then `next dev` straight from the bind-mounted source, so
  edits hot-reload. Its named volumes (`web_node_modules`, `web_next`,
  `web_npm_cache`) keep installs and build output out of the working tree; if
  `package.json` / `package-lock.json` change, recreate the service so `npm ci`
  runs again.
- `db-setup` is a one-shot that applies `db/schema.sql` then `db/seed.sql` and
  exits. Both files are idempotent and run on every `up`, so this is where
  schema and demo-content changes belong. The `db_data` volume survives branch
  switches — a schema change needs a statement that can be re-applied, not a
  rewrite of an existing `CREATE TABLE`.
- Healthchecks: `db` uses `pg_isready`; `web` fetches `/` with node (proves the
  app renders, not just that the port is open).

## Things that are easy to get wrong

- **No environment variables are required.** There are no external services and
  no credentials; `.base44/environment.json` has an empty `secrets` list. The
  Postgres password is local development config wired through compose.
- **Only sandbox-specific override:** `next.config.mjs` adds the preview hosts
  to `allowedDevOrigins` when `BASE44_PREVIEW_MODE` is exactly `"1"`. Compose
  passes `BASE44_PUBLIC_HOST_SUFFIX` and `BASE44_SANDBOX_HOST_DOMAIN` into the
  web service for it. Without the flag the allowlist is empty. A bare `'*'` does
  not work for Next's origin check.
- **Verify after a fresh page load.** Reads taken immediately after a
  client-side navigation (or right after a mutation that calls
  `router.refresh()`) can still reflect the previous route's DOM, and Next's
  client router may serve a cached payload for a route already visited in the
  session. The server is the source of truth: check
  `docker compose -f docker-compose.base44.yml logs web` and the database
  directly.
- **Sessions have no account-deletion UI.** A test writer account created while
  verifying can only be removed with SQL:
  `delete from writers where email = '<exact email>'` (stories, chapters and
  sessions cascade). Delete stories through the writing desk instead — it
  exercises the real path.

## Verifying the app

A demo writer is seeded so the shelf is never empty:

| email                | password   | pen name   |
| -------------------- | ---------- | ---------- |
| `aria@chapterly.dev` | `demo1234` | Aria Malik |

It owns two published stories (*The Lantern Keeper*, *Salt & Paper*).

The whole loop is driveable from the browser: the shelf at `/` (public), then
sign up at `/signup`, start a story from `/dashboard`, add a chapter, publish
the chapter and the story, read it at `/stories/<slug>`, delete it from the
writing desk. All mutations are client-side `fetch` calls to `/api/*`, so the
page does not full-load and a single verification script can assert across the
whole flow.
