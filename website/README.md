# Sri Lanka Athletics public website

The public website from Part 1 of the implementation plan. It covers news, the competition calendar, results, rankings, national records, athlete lookup by SLA ID, the club directory, coaches, development, anti-doping, about, downloads, privacy and terms. Every page is available in Sinhala (`/si`), Tamil (`/ta`) and English (`/en`).

This folder is a complete Next.js project of its own. It does not import anything from the registration portal, so you can move it anywhere and host it separately.

## Run it

```bash
cd website
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3001
```

The website runs on port 3001 so it can run next to the registration portal on port 3000.

Before publishing:

```bash
npm run typecheck && npm run lint && npm test
npm run build
npm start
```

## Settings

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public address of this website, used in the sitemap and share links. |
| `NEXT_PUBLIC_PORTAL_URL` | Address of the registration portal. All "Register" buttons go there. |
| `WEB_DATABASE_URL` | Read-only connection to the registry database. Optional. |

All three are optional for local work. Without `WEB_DATABASE_URL`, the club directory and the athlete lookup say "not connected" and the rest of the site works normally.

## Hosting

On Vercel, import the repository and set **Root Directory** to `website` (or to the root of its new repository if you move it), then add the variables above. Any host that runs Node 20 or newer also works with `npm run build` and `npm start`.

## Connecting the registry

The website never reads the registration tables directly. It reads two views that already hide private data. Minors are shown as initials plus a masked surname, and their club is not shown. Contact details, NIC numbers and documents are never exposed.

1. Apply the views once to the registry database as the owner: `psql "$DATABASE_URL" -f db/public_views.sql`.
2. Give the read-only role a login: `ALTER ROLE web_reader WITH LOGIN PASSWORD '...';`
3. Set `WEB_DATABASE_URL` to a connection string that uses `web_reader`.

Run step 1 again whenever the registry schema changes.

## Content

News, competitions, results, rankings, records and the information pages live in `src/content/`. Each text is written in all three languages. The tests fail if a translation is missing.

The current content is **sample data with fictional names**, and every page shows a preview notice. When SLA supplies official content, replace the files in `src/content/` and set `SAMPLE_CONTENT = false` in `src/content/index.ts`. The privacy and terms pages are marked as drafts until they have been legally reviewed.

Interface text, such as buttons and headings, lives in `src/lib/dict/` with one file per language.
