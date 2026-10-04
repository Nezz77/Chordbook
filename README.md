# Chordbook

A guitar songbook with public viewing and password-protected editing. Built with Next.js, React and Neon Postgres for deployment on Vercel.

## Live site

Visit [Chordbook](https://chordbook-eight.vercel.app). Anyone can browse the songbook; sign in with the editor account to add, edit or delete songs.

## Features

- Search English and Sinhala songs (Sinhala sheets use English-letter transliteration).
- Transpose chords, including minor, seventh and slash chords; choose a capo independently and see the sounding key.
- Guitar fingering diagrams and a fullscreen song view that fits the sheet to the display.
- Import text or ChordPro sheets and export individual songs or the collection as PDF.
- Authenticated editors can add, edit and delete songs and save shared favourites, keys and capo settings.
- Persistent Postgres storage, migrations and private backup/import tools.

The starter collection contains 48 titles. Dangakara Hadakari and Good to Be contain the user-supplied sheets; other entries await supplied content. Channuka's entries are a starting collection, not an exhaustive discography. Guitar fingering data is credited in the app and its MIT license is in `public/chord-data-license.txt`.

## Local development

Use Node.js 24 and npm.

```sh
npm ci
cp .env.example .env.local
npm run auth:setup
```

If `.env.local` already exists, preserve it. Add a Neon `DATABASE_URL` to that private file. The login setup command asks for a username/password, stores a salted scrypt hash and generates a random session secret. The password is not stored as plain text.

```sh
npm run db:migrate
npm run dev
```

Open http://localhost:5173. Without a configured database, the starter sheets remain visible but saving and login are unavailable. See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel setup and transferring existing songs.

## Storage and access

Anyone can read the library, transpose temporarily, play fullscreen and export PDFs. Editing uses one shared account configured through server-only environment variables. Login creates a seven-day HttpOnly session cookie (Secure in production, SameSite=Strict). Every write checks both the session and the request origin. Login attempts are limited to ten per fifteen-minute window in Postgres, shared across server instances. Changing the username, password hash or session secret invalidates existing sessions. Never put these settings in `NEXT_PUBLIC_*` variables.

Saved settings and favourites belong to the shared library. A visitor's temporary key/capo changes do not write to the database. Song deletions are stored as tombstones so deleted starter songs do not reappear. Imports preserve legacy records and skip records when the database already has the same or a newer timestamp.

The database, environment files, backups, dependencies and generated build output are ignored by Git. Commit application source, configuration, the package lock, migration files and assets. The previous Cloudflare/Sites deployment is a separate installation; pushing this repository does not update its database or site.

## Checks and maintenance

```sh
npm test
npm run typecheck
npm run build
npm run lint
npm run db:generate
npm run db:export
```

Tests exercise the Postgres queries and Next.js route handlers with an embedded Postgres engine, including authenticated writes, public reads, session expiry, throttling, backup imports, deletions and outages. They do not connect to a live Neon account. `db:generate` creates SQL after schema changes; review it before `db:migrate`.

Backups contain song content and belong outside Git. Use `npm run db:export -- backups/my-songbook.json` with a new filename, and `npm run db:import -- backups/my-songbook.json --dry-run` to validate before importing.
