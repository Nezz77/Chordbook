# Deploy Chordbook to Vercel

This checkout is prepared for **Vercel + Neon Postgres**. The existing Sites URL remains a separate deployment. No new Vercel site or Neon database has been created by this migration.

## 1. Push the source

The remote is `git@github.com:Nezz77/Chordbook.git`. Run these commands from the project directory after reviewing the changes:

```sh
git status
git add -A
git commit -m "Migrate Chordroom to Vercel and Neon"
git push -u origin HEAD
```

If GitHub already has commits and rejects the push, fetch and reconcile that history; do not force-push. The ignored `.env.local` and `backups/` folder must stay on your computer. A normal push includes existing commit history, including the old generated TypeScript cache from before it was untracked; `.gitignore` does not rewrite history.

## 2. Create the database and configure private settings

Create a Neon Postgres database, directly in Neon or through Vercel's Neon integration. Choose a database region close to the Vercel function region. Copy its connection string into `DATABASE_URL` in `.env.local`.

The requested editing account has already been configured in this computer's `.env.local`. On a fresh clone, use `npm run auth:setup` to choose credentials. Do not copy a password into source code.

Vercel needs these four environment variables, copied individually from `.env.local`:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_USERNAME` | The editing username |
| `AUTH_PASSWORD_HASH` | The generated `scrypt:…` value |
| `AUTH_SESSION_SECRET` | The generated random secret |

Set them for Production. Use a separate Neon database or branch for Preview deployments so previews do not alter production songs. Do not prefix these names with `NEXT_PUBLIC_`. Enter environment variable values without surrounding quotes in Vercel.

## 3. Create tables and transfer the saved songs

On this computer, after setting `DATABASE_URL`:

```sh
npm ci
npm run db:migrate
npm run db:import -- backups/local-d1-before-vercel.json backups/hosted-d1-before-vercel.json --dry-run
npm run db:import -- backups/local-d1-before-vercel.json backups/hosted-d1-before-vercel.json
```

The two private backup files were captured from the local and hosted D1 databases during preparation. They include saved content, settings and deletion markers. They are ignored by Git: if deploying from another computer, transfer them privately first. The starter collection is already supplied by the app.

The import validates all input first and writes it in one transaction. It merges by owner/song ID, retains the newest timestamp and does not overwrite newer Postgres records. Re-running an import is safe. Avoid editing the old site after this snapshot unless you also take a fresh export before switching.

## 4. Import the GitHub repository into Vercel

- Select `Nezz77/Chordbook` in Vercel's **Add New → Project** flow.
- Framework: **Next.js**. Root directory: the repository root (`./`).
- Node.js: **24.x** (also specified by `package.json`).
- Build command: `npm run build`. Install command: `npm ci`.
- Leave the output directory at Vercel's Next.js default.
- Add the four environment variables above, then deploy.

The checked-in `vercel.json` sets the framework/build/install options. Migrations are intentionally a separate step; builds never modify the database. Standard Next.js Webpack builds are used for compatibility with the local build environment.

The app itself has public reads. If Vercel Deployment Protection is enabled for the URL you share, adjust that setting for public access. The editing login remains enforced by the application.

## 5. Verify before sharing

Visit the production URL in a signed-out/private window. Songs, chord diagrams, transposition, fullscreen and PDF export should work. Adding/editing should ask for login. Log in with your editing account, add a test song, refresh to confirm persistence, then remove it and log out. Confirm the imported sheets and capo/key settings are present.

The migration was tested locally with embedded Postgres. A live Neon connection and Vercel deployment still need verification once your accounts are connected.

## Backups and account changes

```sh
npm run db:export -- backups/songbook-latest.json
```

Choose a new filename for each export. To change login credentials, run `npm run auth:setup`, update all three `AUTH_*` variables on Vercel, and redeploy. This also revokes existing sessions. The login limit is ten attempts per fifteen minutes for the shared account; wait for that window if it is reached.

Official guides: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Neon integration](https://vercel.com/marketplace/neon/neon), [Vercel environment variables](https://vercel.com/docs/environment-variables).
