# The Oxblood Edit — Next.js + Neon + Vercel Blob

A luxury editorial publication and CMS built with Next.js 14 (App Router), Neon PostgreSQL, Drizzle ORM, NextAuth v5, and Vercel Blob.

## Features

- **Brand Landing Page (`/`)**: Hero showcase, *The Oxblood Code* signature guide feature, latest published journal stories, and curated affiliate pieces.
- **Editorial Journal (`/journal` & `/journal/[slug]`)**: Dynamic SEO metadata (`generateMetadata`), sanitized HTML rendering (`sanitize-html`), cover images, and tracked affiliate recommendations.
- **Signature Guide Page (`/shop/the-oxblood-code`)**: Product deliverables and Gumroad checkout integration.
- **Full Editorial Back-Office (`/admin`)**:
  - Protected via Edge-compatible NextAuth v5 middleware (`middleware.ts` + `lib/auth.config.ts`) and rate-limited credentials login (`/admin/login`).
  - **Articles CRUD**: Create, edit, publish/unpublish (`draft` ↔ `published`), and delete editorial stories with live cover image upload.
  - **Signature Guide Settings**: Edit product name, USD price, Gumroad checkout URL, description, and deliverable bullets.
  - **Affiliate Curation & Click Tracking**: Add, edit, and delete US/UK affiliate pieces with outbound click tracking via `/api/affiliate/[id]`.
- **Hardened Image Upload API (`/api/upload`)**: Authenticated endpoint enforcing MIME type allowlists, extension matching, and binary magic-byte signature verification (JPEG, PNG, WEBP, GIF, AVIF up to 10 MB).

## Local Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local` and fill in your Neon connection string, `AUTH_SECRET`, and `BLOB_READ_WRITE_TOKEN`.
   - *Note*: In local development (`NODE_ENV !== "production"`), if `DATABASE_URL` is not set, the app automatically falls back to a local JSON store (`.data/local-store.json`) seeded with editorial stories, and allows signing into `/admin/login` with `admin@oxblood.local` / `OxbloodAdmin!2026`.
3. In Neon SQL Editor, run `neon.sql` to create tables and seed initial content.
4. Start the development server:

   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Create a Production Admin Account

Generate a bcrypt hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('CHOOSE_A_STRONG_PASSWORD', 12))"
```

Then insert the account in Neon SQL Editor:

```sql
insert into users (email, password)
values ('admin@your-domain.com', 'PASTE_BCRYPT_HASH_HERE');
```
