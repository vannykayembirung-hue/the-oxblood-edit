/**
 * Editorial taxonomy — the single source of truth for journal categories.
 *
 * Before this module the category of an article was a free-text field: the CMS
 * select offered four values while `neon.sql` and the local seed had drifted
 * (legacy rows carried `home`, `wardrobe`, `guides`, …), which split the journal
 * filters and diluted the topical clusters the site is organised around.
 *
 * The nine pillar articles are now pinned to exactly one of the five categories
 * below, and every read/write path runs through `normalizeCategory()` so legacy
 * values resolve to their canonical pillar instead of falling back to `style`.
 */

export interface EditorialCategory {
  key: string;
  label: string;
  /** Short internal note used in the admin select. */
  blurb: string;
  /** Public, one-line definition — reused in the journal filter and in schema.org. */
  definition: string;
}

export const EDITORIAL_CATEGORIES: EditorialCategory[] = [
  {
    key: "style",
    label: "Style",
    blurb: "Outfit formulas, tailoring and UK/US market edits — UK & US",
    definition:
      "Outfit formulas, tailoring and market edits built to be worn in the US and the UK."
  },
  {
    key: "capsule",
    label: "Capsule Wardrobe",
    blurb: "Fixed piece counts and repeatable combinations",
    definition:
      "Fixed piece counts, repeatable combinations and the arithmetic of a wardrobe that holds its line."
  },
  {
    key: "beauty",
    label: "Beauty",
    blurb: "Dark makeup rituals, fragrance and low-light finishes",
    definition: "Dark makeup rituals, fragrance and finishes designed to be read by candlelight."
  },
  {
    key: "interiors",
    label: "Interiors",
    blurb: "Rooms, lighting and table settings",
    definition: "Rooms, lighting and table settings built for the darker half of the year."
  },
  {
    key: "craft",
    label: "Craft & Fit",
    blurb: "Fibre, construction, fit files and sizing audits",
    definition:
      "Fibre, construction, GSM, fit files and the UK 4–20 / US 0–16 sizing audit behind every recommendation."
  }
];

export const EDITORIAL_CATEGORY_KEYS = EDITORIAL_CATEGORIES.map((category) => category.key);

export const DEFAULT_EDITORIAL_CATEGORY = "style";

/** The 9 pillars, in publication order — used for internal linking and sitemap priority. */
export interface PillarArticleBrief {
  slug: string;
  title: string;
  category: string;
  /** Staggered publication date, ISO-8601 (UTC). */
  publishedAt: string;
  market: "UK" | "US" | "UK & US";
}

export const PILLAR_ARTICLES: PillarArticleBrief[] = [
  {
    slug: "how-to-dress-like-the-villainess-dark-romance-outfits",
    title: "How to Dress Like the Villainess: 7 Dark Romance Outfits",
    category: "style",
    publishedAt: "2026-08-24T07:30:00.000Z",
    market: "UK & US"
  },
  {
    slug: "the-british-layering-code-wool-merino-silk",
    title: "The British Layering Code: Wool, Merino, Silk — In That Order",
    category: "style",
    publishedAt: "2026-08-31T07:30:00.000Z",
    market: "UK"
  },
  {
    slug: "the-3-piece-british-autumn-formula",
    title: "The 3-Piece British Autumn Formula: Coat + Knit + Loafers",
    category: "style",
    publishedAt: "2026-09-07T07:30:00.000Z",
    market: "UK"
  },
  {
    slug: "vamp-romantic-capsule-wardrobe",
    title: "The 12-Piece Vamp Romantic Capsule Wardrobe",
    category: "capsule",
    publishedAt: "2026-09-14T07:30:00.000Z",
    market: "UK & US"
  },
  {
    slug: "smudged-kohl-oxblood-lips-tutorial",
    title: "Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial",
    category: "beauty",
    publishedAt: "2026-09-21T07:30:00.000Z",
    market: "UK & US"
  },
  {
    slug: "dark-elegance-dining-room-ideas",
    title: "7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight",
    category: "interiors",
    publishedAt: "2026-09-28T07:30:00.000Z",
    market: "UK & US"
  },
  {
    slug: "reading-the-fibre-label-in-a-dark-atelier",
    title: "Reading the Fibre Label in a Dark Atelier",
    category: "craft",
    publishedAt: "2026-10-05T07:30:00.000Z",
    market: "UK & US"
  },
  {
    slug: "the-us-oxblood-edit-american-autumn-tailoring",
    title: "The US Oxblood Edit: American Autumn Tailoring in Three Budgets",
    category: "style",
    publishedAt: "2026-10-12T07:30:00.000Z",
    market: "US"
  },
  {
    slug: "the-fit-file-us-0-16-uk-4-20",
    title: "The Fit File: The Same Oxblood Formula in US 0–16 and UK 4–20",
    category: "craft",
    publishedAt: "2026-10-14T07:30:00.000Z",
    market: "UK & US"
  }
];

export function getPillarBrief(slug: string): PillarArticleBrief | null {
  return PILLAR_ARTICLES.find((pillar) => pillar.slug === slug) ?? null;
}

/** Every legacy or aliased value the desk has ever typed, mapped to its pillar. */
const CATEGORY_ALIASES: Record<string, string> = {
  style: "style",
  styling: "style",
  fashion: "style",
  outfits: "style",
  shopping: "style",
  edit: "style",
  guides: "style",
  guide: "style",
  capsule: "capsule",
  "capsule wardrobe": "capsule",
  "capsule-wardrobe": "capsule",
  wardrobe: "capsule",
  wardrobes: "capsule",
  beauty: "beauty",
  makeup: "beauty",
  "make-up": "beauty",
  fragrance: "beauty",
  skincare: "beauty",
  interiors: "interiors",
  interior: "interiors",
  home: "interiors",
  "home decor": "interiors",
  decor: "interiors",
  craft: "craft",
  crafts: "craft",
  fabric: "craft",
  fabriccraft: "craft",
  fit: "craft",
  tailoring: "craft",
  "craft & fit": "craft",
  "craft and fit": "craft",
  sizing: "craft"
};

export function normalizeCategory(raw: string | null | undefined): string {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return DEFAULT_EDITORIAL_CATEGORY;
  if (CATEGORY_ALIASES[value]) return CATEGORY_ALIASES[value];
  const slugged = value.replace(/[\s_]+/g, "-");
  if (CATEGORY_ALIASES[slugged]) return CATEGORY_ALIASES[slugged];
  // Already one of ours after light tidy-up (e.g. "Capsule " in the CMS).
  if (EDITORIAL_CATEGORY_KEYS.includes(value)) return value;
  return DEFAULT_EDITORIAL_CATEGORY;
}

export function getCategoryLabel(key: string): string {
  const normalized = normalizeCategory(key);
  return (
    EDITORIAL_CATEGORIES.find((category) => category.key === normalized)?.label ??
    EDITORIAL_CATEGORIES[0].label
  );
}

export function getCategoryDefinition(key: string): string {
  const normalized = normalizeCategory(key);
  return (
    EDITORIAL_CATEGORIES.find((category) => category.key === normalized)?.definition ?? ""
  );
}
