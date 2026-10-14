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

## Dark Elegance branding (velvet & oxblood)

The whole site — `/`, `/quiz`, `/journal`, `/journal/[slug]`, `/shop/the-oxblood-code`, `/about`,
`/disclosure` — runs on the Dark Elegance theme:

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0B0A08` | page background |
| Oxblood halo | `rgba(110, 20, 35, 0.22)` | radial glow behind the hero |
| Smoky velvet | `#120F0D` | every card surface (no `bg-white` cards on public pages) |
| Antique gold | `#C6A15B` | hairlines, borders, plate captions |
| Parchment | `#EDE4D0` | body copy |

- `components/WaxSeal.tsx` — inline SVG house seal: scalloped oxblood wax, double antique-gold ring,
  `OE` monogram in Cinzel.
- `components/VillainessQuiz.tsx` + `app/quiz/page.tsx` — **“Which Villainess Are You? · Six questions,
  one verdict.”** Four archetypes: *The Velvet Widow*, *The Library Siren*, *The Crimson Heiress*,
  *The Thorned Muse*. The data model lives in `lib/villainess-quiz.ts` so the `/quiz` page can render the
  four verdicts server-side.
- Full-width CTA bars (`.cta-bar`) are oxblood with spaced Cinzel capitals; secondary buttons are
  `.btn-oxblood` / `.btn-ghost`.
- `/admin` intentionally keeps a light “desk” surface so the manuscript forms stay readable.

## 16:9 editorial visuals

Every article is photographed and framed at a strict 16:9 (`aspect-video`):

1. Eight editorial photographs live in `public/images/editorial/` (1920×1080, no overlaid text):
   `villainess-hero`, `villainess-detail`, `british-autumn`, `capsule-wardrobe`, `beauty-kohl-lips`,
   `british-layers`, `fibre-label-atelier`, `dining-room-interiors` — all suffixed `-16x9.jpg`.
2. `lib/sanitize.ts` allows `<figure>` / `<figcaption>` and forces `plate-img aspect-video` on every
   image, so captions such as `PLATE I · …` survive the CMS round trip.
3. `lib/db.ts` and `neon.sql` seed each article with a 16:9 `cover_image` **and** 1–2 in-body plates
   (`<figure><img … /><figcaption>Plate I · …</figcaption></figure>`).
4. `enrichArticleWithEditorialDefaults()` in `lib/db.ts` repairs legacy Neon rows on read: a missing,
   empty or non-16:9 `cover_image` falls back to the curated 16:9 cover, and any body without its plates
   (including rows that still say “Edit this article in the admin”) has its 16:9 figures re-injected.
   Vercel Blob / remote covers uploaded from the admin are respected as-is.
5. Re-running `neon.sql` is safe: the seed uses `on conflict (slug) do nothing`, and a trailing backfill
   `update` restores covers and plates on rows created before this branding landed.

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
