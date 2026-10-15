# The Oxblood Edit — Next.js + Neon + Vercel Blob

A luxury editorial publication and CMS built with Next.js 14 (App Router), Neon PostgreSQL, Drizzle ORM, NextAuth v5, and Vercel Blob.

## Features

- **Brand Landing Page (`/`)**: Hero showcase, *The Oxblood Code* signature guide feature, latest published journal stories, and curated affiliate pieces.
- **Editorial Journal (`/journal` & `/journal/[slug]`)**: Dynamic SEO metadata (`generateMetadata`), sanitized HTML rendering (`sanitize-html`), cover images, and tracked affiliate recommendations.
- **Shop Page (`/shop/the-oxblood-code`)**: Both Gumroad digital editions — *The Oxblood Code* (Edition 01, $27, `the-oxblood-code`) and *The Villainess Wardrobe System* (Edition 02, $19 · £15, `villainess-wardrobe-system`) — each as a 16:9 plate plus an included / instant-download grid. The homepage repeats the same two editions; the quiz result and every journal article offer both Gumroad buttons. Catalogue defaults live in `lib/products.ts`; `getAllProducts()` in `lib/db.ts` returns both editions in order.
- **Full Editorial Back-Office (`/admin`)**:
  - Protected via Edge-compatible NextAuth v5 middleware (`middleware.ts` + `lib/auth.config.ts`) and rate-limited credentials login (`/admin/login`).
  - **Articles CRUD**: Create, edit, publish/unpublish (`draft` ↔ `published`), and delete editorial stories with live cover image upload.
  - **Gumroad Products (`?tab=product`)**: Two side-by-side forms, one per edition, each saving its own name, USD price, Gumroad checkout URL, description, and deliverable bullets independently.
  - **Affiliate Curation & Click Tracking**: Add, edit, and delete US/UK affiliate pieces with outbound click tracking via `/api/affiliate/[id]`.
- **Newsletter Capture & Consent (`/api/subscribe`)**: One opt-in endpoint behind every capture form, with double opt-in, honeypot, rate limiting and the consent wording + version stored against the subscriber row.
- **Subscribers Tab (`/admin?tab=subscribers`)**: Confirm, suppress or erase subscribers, see the consent evidence and the archetype dossiers requested, and export the list as CSV via `/api/admin/subscribers/export`.
- **Trust surfaces**: `/editorial-standards` (E-E-A-T, testing method, corrections log, advertising/consent compliance) and `/privacy` (UK GDPR notice), plus `/subscribed` and `/unsubscribe`.
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

## The nine pillars, staggered

The journal is a run of nine pillar stories, published one per week (US, UK and
both markets), seeded identically in `lib/db.ts` and `neon.sql`:

| # | Pillar | Section | Market | Published |
| --- | --- | --- | --- | --- |
| I | How to Dress Like the Villainess: 7 Dark Romance Outfits | Style | UK & US | 2026-08-24 |
| II | The British Layering Code: Wool, Merino, Silk — In That Order | Style | UK | 2026-08-31 |
| III | The 3-Piece British Autumn Formula: Coat + Knit + Loafers | Style | UK | 2026-09-07 |
| IV | The 12-Piece Vamp Romantic Capsule Wardrobe | Capsule Wardrobe | UK & US | 2026-09-14 |
| V | Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial | Beauty | UK & US | 2026-09-21 |
| VI | 7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight | Interiors | UK & US | 2026-09-28 |
| VII | Reading the Fibre Label in a Dark Atelier | Craft & Fit | UK & US | 2026-10-05 |
| VIII | The US Oxblood Edit: American Autumn Tailoring in Three Budgets | Style | US | 2026-10-12 |
| IX | The Fit File: The Same Oxblood Formula in US 0–16 and UK 4–20 | Craft & Fit | UK & US | 2026-10-14 |

The schedule lives in `lib/editorial-taxonomy.ts` (`PILLAR_ARTICLES`) and is the
single source of truth for the dates, the sections and the market of each story.
`neon.sql` ends the seed with a guarded one-off `update` that pins every pillar
to its section and its staggered date and publishes the interiors story, so a
database seeded before this run is corrected rather than duplicated. Sections are
canonicalised on read and write (`normalizeCategory`), so legacy values such as
`home`, `wardrobe` or `guides` can no longer split the journal filters.

## Newsletter, consent and the archetype dossier

Every capture surface is the same client component (`components/NewsletterCapture.tsx`)
posting to one endpoint, `/api/subscribe`:

- **Consent is a positive act.** The opt-in is an unticked checkbox; the API
  refuses a request that does not assert `consent: true` (`consent_required`).
- **The box the reader ticked is the box that counts.** The address and the
  consent box are *uncontrolled* inputs, read from the page at the moment of
  submission. A box ticked before the page hydrates (slow mobile connections) or
  restored by the browser on Back/reload is honoured; with controlled inputs it
  was answered with "Tick the consent box and the desk will write to you." and
  then cleared. Keep them uncontrolled — `tests/newsletter-capture.test.ts`
  replays exactly that sequence. The box sits between the address and the
  button, and a refusal moves focus to the field at fault (`aria-invalid`).
- **It works before hydration, and without JavaScript.** The form is a real
  `POST` to `/api/subscribe` (never a `GET`, which put the address in the URL)
  and keeps the browser's own `required` checks until React takes over. JSON
  requests get JSON; a plain form post gets a 303 to
  `/subscribed?state=pending` — or `consent_required`, `invalid_email`,
  `rate_limited`, `invalid_body`, `server_error`, each with the form offered
  again. Only the outcome, a known source and archetype travel in that URL.
- **The wording is the record.** `lib/newsletter.ts` holds the exact copy and its
  version (`newsletter-consent/2026-10-14`); the API stores both, plus the source
  surface and the timestamp, on the subscriber row.
- **Double opt-in.** A new address is stored `pending` and confirmed by opening
  `/api/subscribe/confirm?token=…`, which lands on `/subscribed`. Nothing is sent
  before that click.
- **Data minimisation.** Only a salted SHA-256 digest of the IP is kept
  (`NEWSLETTER_CONSENT_SALT`, falling back to `AUTH_SECRET`); the address itself
  is never stored.
- **Withdrawal.** `/unsubscribe` posts to `/api/subscribe/unsubscribe` (a POST,
  so a mail scanner prefetching the link cannot silently unsubscribe a reader),
  and the row moves to `unsubscribed` with the date on record.
- **The dossier is not held hostage.** The archetype dossier is returned by the
  API and shown in the quiz the moment the reader asks for it — the email is the
  copy, not the gate. Each archetype's nine-page dossier (chapters, key pieces,
  care) is defined beside the archetype in `lib/villainess-quiz.ts`.

`/admin?tab=subscribers` shows the consent evidence per row with **Confirm**,
**Suppress** (withdrawal with the record kept) and **Erase** (right to erasure),
plus a CSV export that includes the wording each reader agreed to.

## E-E-A-T, editorial standards and advertising compliance

- `lib/editorial-desk.ts` is the publication's identity: **Clara Vance**, Founder
  & Editor-in-Chief, with credentials, expertise and a biography. Every journal
  story carries her byline, a fit-review line and a review date, and publishes
  `author` as a `Person` in the article JSON-LD (not an anonymous Organization).
  The root layout emits an `Organization` + `WebSite` graph built from the same
  data.
- `/editorial-standards` documents the method: what the desk buys, wears and
  measures (flat measurements in the fit file), what it will not do, the
  corrections log, and the compliance position in one place.
- `/privacy` is the UK GDPR notice: controller, lawful basis, double opt-in,
  retention, transfers, rights and the ICO route — with the CCPA/CPRA sentence
  US readers expect.
- **Advertising is labelled where it sits.** Affiliate blocks carry an
  "Affiliate ad" label plus a plain-language sentence, and every affiliate anchor
  is `rel="sponsored nofollow noopener noreferrer"` with a screen-reader note —
  CAP Code rules 2.1/2.3 for the UK and the FTC Endorsement Guides (16 CFR Part
  255) for the US. `/disclosure` states the same in prose.
- `/sitemap.xml` includes `/editorial-standards` and `/privacy`; `/robots.txt`
  keeps `/admin` and `/api/` out of the index.

## Local Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local` and fill in your Neon connection string, `AUTH_SECRET`, and `BLOB_READ_WRITE_TOKEN`.
   - *Note*: In local development (`NODE_ENV !== "production"`), if `DATABASE_URL` is not set, the app automatically falls back to a local JSON store (`.data/local-store.json`) seeded with the nine pillar stories and the curated edit, and allows signing into `/admin/login` with `admin@oxblood.local` / `OxbloodAdmin!2026`.
   - *Note*: the same local fallback covers subscribers — they are written to `.data/local-store.json`. Until a mail provider is wired up, `/api/subscribe` returns the double opt-in link in its response (and the capture form prints it), so the confirm flow can be exercised without an inbox.
3. In Neon SQL Editor, run `neon.sql` to create tables and seed initial content.
   - *Note*: a database set up from an older `neon.sql` (before the newsletter)
     has no `subscribers` table. The app creates it, or adds any missing column,
     the first time a subscriber query runs on a server instance; once the table
     is complete, that check runs no DDL. Every other table still comes from
     `neon.sql`.
   - *Note*: the admin dashboard checks the database on every visit. It names
     the problem when Neon refuses the connection, when tables are missing, or
     when a Vercel deployment has no `DATABASE_URL` (Vercel keeps no files, so
     nothing could be saved). It shows nothing when all is well. Public pages
     fall back to the seed copy whatever happens, so this notice is where a
     database fault shows up.
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

## Editorial SEO + audience CRM upgrade

The authenticated `/admin` desk now includes:

- A one-click **Sync 9 Articles + 2 Products + 6 Affiliates to Neon** form and an
  incomplete-catalog alert when fewer than nine articles are stored. This is an
  explicit restore of the house seed catalog, not an import of the local store.
  It overwrites matching article/product/affiliate catalog fields and restores
  the staggered dates; a confirmation warns editors first. Neon executes all 17
  upserts as one transaction. Affiliate click counts and subscriber records are
  never reset. Legacy affiliates seeded by `neon.sql` are matched by name +
  merchant, preserving their existing IDs and tracking URLs.
- Six KPIs, 16:9 article thumbnails, word/plate/internal-link counts and a
  transparent 10-check editorial SEO health heuristic (not a Google ranking or
  E-E-A-T guarantee). Pinterest URLs use the configured `NEXT_PUBLIC_SITE_URL`,
  otherwise the current browser origin, with encoded category campaign values.
- A descending UK/US affiliate click leaderboard, thumbnails and tracked Test
  links. Test clicks count toward the totals. Seed prices are indicative and
  plates are editorial illustrations: merchant homepage URLs must be replaced
  with approved affiliate product URLs before a monetized campaign.
- Five audience segments: `widow`, `siren`, `heiress`, `muse`, `dispatch`. Short
  segment names map to the quiz's canonical `velvet-widow`, `library-siren`,
  `crimson-heiress`, `thorned-muse` dossier keys; Dispatch includes contacts with
  no recognized archetype. Cards toggle a URL filter; export/copy still include
  every contact, not just the selected segment.
- **Export CSV for Gumroad / MailerLite** downloads four columns:
  `email,archetype,source,created_at`. The importer-facing `created_at` maps to the
  existing newsletter capture timestamp `consented_at` (the schema has no
  independent creation timestamp). The original full consent/status CSV remains
  available. Both are session-protected, uncached and formula-injection-safe.
  The compact export and email copy are CRM backups, **not campaign send lists**:
  exclude pending/withdrawn contacts before importing into a mailing campaign.
- An editable, copyable Sunday Dispatch composer using the latest *published*
  article and both house Gumroad links ($27 and $19 · £15). It does not send
  emails. Review the text and add Gumroad's recipient-specific unsubscribe link.
- Manual VIP capture validates email/segment/source, normalizes email addresses
  and inserts a pending contact without asserting newsletter consent. Duplicate
  emails are left untouched, including suppressed contacts. Existing erasure
  and consent-status controls remain available.

Configure `DATABASE_URL` and apply the existing schema (`neon.sql` or `npm run
 db:push`) before syncing. In local mode, the Neon button is disabled; it never
silently reports a local write as a successful Neon sync. No new database
migration is required for this upgrade.

Validation: `npm test`, `npm run typecheck`, `npm run build`. Tests use an isolated
local store and a stubbed Neon HTTP transport, never live contacts or Neon data.
`tests/neon-subscribers.test.ts` runs every subscriber query against a real
Postgres engine (PGlite, Postgres compiled to WebAssembly, behind the Neon HTTP
driver), and checks that the table the app creates matches `neon.sql`.
The capture form is exercised in jsdom (server render → reader input → hydrate →
submit); `tsconfig.test.json` gives the test runner React's automatic JSX runtime.
