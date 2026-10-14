/**
 * The house's two Gumroad digital editions — the single source of truth for
 * seed data and presentation.
 *
 * Client-safe on purpose (no `fs`, no database): `components/VillainessQuiz.tsx`
 * imports it directly, while `lib/db.ts` uses it to seed the local store and to
 * fill in any edition that is missing from Neon. Price, link, description and
 * deliverables stay editable per product in `/admin?tab=product`; the plate,
 * caption, GBP price and delivery note below are layout facts of each edition.
 */

export const OXBLOOD_CODE_SLUG = "the-oxblood-code";
export const VILLAINESS_SLUG = "villainess-wardrobe-system";

/** Display order everywhere on the site: Édition 01, then Édition 02. */
export const PRODUCT_SLUGS = [OXBLOOD_CODE_SLUG, VILLAINESS_SLUG] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export interface ProductSeed {
  slug: ProductSlug;
  name: string;
  price: number;
  gumroad_url: string;
  description: string;
  what_inside: string[];
}

export interface ProductEditionLayout {
  /** "01", "02" — printed as "Édition 01". */
  edition: string;
  shortName: string;
  plate: { src: string; alt: string; caption: string };
  deliveryNote: string;
  /** GBP companion price, shown next to the USD price when set. */
  priceGbp: number | null;
  licence: string;
}

export const PRODUCT_SEEDS: Record<ProductSlug, ProductSeed> = {
  [OXBLOOD_CODE_SLUG]: {
    slug: OXBLOOD_CODE_SLUG,
    name: "The Oxblood Code — The Fall/Winter 2026 Lookbook & Style Guide",
    price: 27,
    gumroad_url: "https://theoxblood.gumroad.com/l/ehczlj",
    description:
      "The Oxblood Code is a 37-page dark elegance style system for women: the 5-colour strip, a 12-piece capsule with 3 budget tiers (£ & $), 21 outfit formulas, rituals, care codes and print-ready tools — built for UK & US wardrobes. Thirty days from costume to signature.",
    what_inside: [
      "37-page Fall/Winter 2026 Lookbook & Style Guide",
      "The 5-colour chromatic strip (#6E1423)",
      "12-piece capsule with 3 budget tiers (£ & $)",
      "21 outfit formulas + evening rituals",
      "Fabric care codes & print-ready tools (UK & US)"
    ]
  },
  [VILLAINESS_SLUG]: {
    slug: VILLAINESS_SLUG,
    name: "The Villainess Wardrobe System",
    price: 19,
    gumroad_url: "https://theoxblood.gumroad.com/l/villainess-wardrobe-system",
    description:
      "Four dark-romantic style dossiers (38-page PDF, A4 + US Letter, instant download). Four archetypes, twelve pieces each, twenty-one outfits from every twelve—built so you stop buying dark pieces that don't work together.",
    what_inside: [
      "4 Dossiers · 38 Pages · A4 (UK) + US Letter",
      "Velvet Widow · Library Siren · Crimson Heiress · Thorned Muse",
      "12 core pieces each + priority buying order",
      "21 outfit formulas from every twelve",
      "3 budget tiers (£ GBP & $ USD)",
      "Undertone lip, kohl & nail guide + printable audit"
    ]
  }
};

export const PRODUCT_LAYOUTS: Record<ProductSlug, ProductEditionLayout> = {
  [OXBLOOD_CODE_SLUG]: {
    edition: "01",
    shortName: "The Oxblood Code",
    plate: {
      src: "/images/editorial/capsule-wardrobe-16x9.jpg",
      alt: "Twelve curated garments in jet black wool, oxblood velvet and ivory silk arranged on an antique valet stand in candlelight",
      caption: "PLATE I · THE TWELVE SILHOUETTES, PHOTOGRAPHED ON ONE STAND"
    },
    deliveryNote: "Delivered as a print-ready PDF, laid out for reading by lamplight at A5.",
    priceGbp: null,
    licence: "USD · SINGLE LICENCE"
  },
  [VILLAINESS_SLUG]: {
    edition: "02",
    shortName: "The Villainess Wardrobe System",
    plate: {
      src: "/images/editorial/villainess-hero-16x9.jpg",
      alt: "A woman seen from behind in a floor-length black velvet cape lined with oxblood satin, in a candlelit Georgian gallery",
      caption:
        "PLATE II · FOUR ARCHETYPES. TWELVE PIECES EACH. TWENTY-ONE OUTFITS FROM EVERY TWELVE."
    },
    deliveryNote:
      "Delivered as a 38-page print-ready PDF in both UK A4 and US Letter formats.",
    priceGbp: 15,
    licence: "USD & GBP · SINGLE LICENCE"
  }
};

export function isProductSlug(value: string | null | undefined): value is ProductSlug {
  return PRODUCT_SLUGS.includes(value as ProductSlug);
}

/** "$27" or "$19 · £15". */
export function formatProductPrice(slug: ProductSlug, priceUsd: number): string {
  const gbp = PRODUCT_LAYOUTS[slug].priceGbp;
  return gbp != null ? `$${priceUsd} · £${gbp}` : `$${priceUsd}`;
}

const LEGACY_URL_PLACEHOLDER = "__GUMROAD_URL__";

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * The checkout link actually rendered: the admin-edited URL when it is a valid
 * http(s) URL, otherwise the edition's house Gumroad link.
 */
export function resolveGumroadUrl(
  slug: ProductSlug,
  gumroadUrl: string | null | undefined
): string {
  const candidate = (gumroadUrl ?? "").trim();
  if (candidate && candidate !== LEGACY_URL_PLACEHOLDER && isHttpUrl(candidate)) {
    return candidate;
  }
  return PRODUCT_SEEDS[slug].gumroad_url;
}
