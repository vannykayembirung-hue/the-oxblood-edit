/**
 * Dark Elegance editorial visuals — the strict 16:9 plate catalogue.
 *
 * Every photograph lives in `public/images/editorial/` at 1920×1080 (16:9) and
 * carries no overlaid text: candlelit chiaroscuro photography only. The article
 * cover and the in-body "plates" both draw from this catalogue so a story can
 * never render without its 16:9 imagery.
 */

export interface EditorialPlate {
  /** Root-relative path to the 16:9 photograph. */
  src: string;
  alt: string;
  caption: string;
}

export const EDITORIAL_IMAGE_DIR = "/images/editorial";
export const EDITORIAL_PLATE_ASPECT = "16 / 9";
export const EDITORIAL_PLATE_DIMENSIONS = { width: 1920, height: 1080 } as const;

const plate = (
  file: string,
  alt: string,
  caption: string
): EditorialPlate => ({
  src: `${EDITORIAL_IMAGE_DIR}/${file}`,
  alt,
  caption
});

export const EDITORIAL_PLATES = {
  villainessHero: plate(
    "villainess-hero-16x9.jpg",
    "A woman seen from behind in a floor-length black velvet cape lined with oxblood satin, standing in a candlelit Georgian gallery",
    "Plate I · The long gallery, nine o'clock. Velvet cut to the floor, oxblood satin lining let slip one inch past the hem"
  ),
  villainessDetail: plate(
    "villainess-detail-16x9.jpg",
    "Detail of oxblood silk satin against black chantilly lace with an antique gold signet ring resting on the fabric",
    "Plate II · The three anchor textures: bias-cut oxblood satin, Chantilly lace, antique gold hardware worn matte"
  ),
  britishAutumn: plate(
    "british-autumn-16x9.jpg",
    "A woman in a longline charcoal wool coat and oxblood loafers crossing wet slate paving in an autumn London square",
    "Plate I · London, late October. The longline coat, the fine merino neck, the oxblood horsebit — three pieces, no fourth"
  ),
  britishLayers: plate(
    "british-layers-16x9.jpg",
    "Layered black wool cape over a merino turtleneck and ivory silk blouse with oxblood leather gloves and an antique gold brooch",
    "Plate II · The layering test, read at the wrist: matte wool, fine gauge knit, liquid silk, one brass fastening"
  ),
  capsuleWardrobe: plate(
    "capsule-wardrobe-16x9.jpg",
    "Twelve curated garments in jet black wool, oxblood velvet and ivory silk on an antique valet stand in a candlelit panelled room",
    "Plate I · Twelve pieces on one stand: the chromatic spine is jet, oxblood, parchment and antique gold"
  ),
  fibreLabelAtelier: plate(
    "fibre-label-atelier-16x9.jpg",
    "A heritage tailoring atelier with bolts of double-faced wool, cashmere and silk, shears and tape on a worn oak bench",
    "Plate II · Inside the label: 75% wool minimum, 320gsm and up, and a lining dyed to the same oxblood"
  ),
  beautyKohlLips: plate(
    "beauty-kohl-lips-16x9.jpg",
    "Close-up of smudged charcoal kohl eyes and velvet-matte oxblood lips lit by a single candle flame",
    "Plate I · Kohl on the tightline only; the lip pressed in with a fingertip and left unlined"
  ),
  diningRoomInteriors: plate(
    "dining-room-interiors-16x9.jpg",
    "A dark dining room with oxblood limewashed walls, a smoked oak table, brass taper candlesticks and parchment linen",
    "Plate I · Dining after sundown: oxblood limewash, smoked oak, unlacquered brass at staggered heights"
  )
} as const satisfies Record<string, EditorialPlate>;

export type EditorialPlateKey = keyof typeof EDITORIAL_PLATES;

export interface ArticleEditorialLayout {
  /** 16:9 cover used above the article and in every card. */
  cover: EditorialPlate;
  /** 1–2 in-body 16:9 plates injected into content_html. */
  plates: EditorialPlate[];
}

const LAYOUT_BY_SLUG: Record<string, ArticleEditorialLayout> = {
  "how-to-dress-like-the-villainess-dark-romance-outfits": {
    cover: EDITORIAL_PLATES.villainessHero,
    plates: [EDITORIAL_PLATES.villainessHero, EDITORIAL_PLATES.villainessDetail]
  },
  "the-3-piece-british-autumn-formula": {
    cover: EDITORIAL_PLATES.britishAutumn,
    plates: [EDITORIAL_PLATES.britishAutumn, EDITORIAL_PLATES.britishLayers]
  },
  "vamp-romantic-capsule-wardrobe": {
    cover: EDITORIAL_PLATES.capsuleWardrobe,
    plates: [EDITORIAL_PLATES.capsuleWardrobe, EDITORIAL_PLATES.fibreLabelAtelier]
  },
  "smudged-kohl-oxblood-lips-tutorial": {
    cover: EDITORIAL_PLATES.beautyKohlLips,
    plates: [EDITORIAL_PLATES.beautyKohlLips]
  },
  "dark-elegance-dining-room-ideas": {
    cover: EDITORIAL_PLATES.diningRoomInteriors,
    plates: [EDITORIAL_PLATES.diningRoomInteriors]
  },
  "the-british-layering-code-wool-merino-silk": {
    cover: EDITORIAL_PLATES.britishLayers,
    plates: [EDITORIAL_PLATES.britishLayers, EDITORIAL_PLATES.britishAutumn]
  },
  "reading-the-fibre-label-in-a-dark-atelier": {
    cover: EDITORIAL_PLATES.fibreLabelAtelier,
    plates: [EDITORIAL_PLATES.fibreLabelAtelier, EDITORIAL_PLATES.capsuleWardrobe]
  },
  // Pillars VIII & IX — the US tail of the nine-story run and the fit file.
  "the-us-oxblood-edit-american-autumn-tailoring": {
    cover: EDITORIAL_PLATES.villainessHero,
    plates: [EDITORIAL_PLATES.villainessHero, EDITORIAL_PLATES.capsuleWardrobe]
  },
  "the-fit-file-us-0-16-uk-4-20": {
    cover: EDITORIAL_PLATES.fibreLabelAtelier,
    plates: [EDITORIAL_PLATES.fibreLabelAtelier, EDITORIAL_PLATES.villainessDetail]
  }
};

/** Category-level fallbacks so admin-created stories still land on 16:9 art. */
const LAYOUT_BY_CATEGORY: Record<string, ArticleEditorialLayout> = {
  style: {
    cover: EDITORIAL_PLATES.villainessHero,
    plates: [EDITORIAL_PLATES.villainessHero, EDITORIAL_PLATES.villainessDetail]
  },
  capsule: {
    cover: EDITORIAL_PLATES.capsuleWardrobe,
    plates: [EDITORIAL_PLATES.capsuleWardrobe, EDITORIAL_PLATES.fibreLabelAtelier]
  },
  beauty: {
    cover: EDITORIAL_PLATES.beautyKohlLips,
    plates: [EDITORIAL_PLATES.beautyKohlLips]
  },
  interiors: {
    cover: EDITORIAL_PLATES.diningRoomInteriors,
    plates: [EDITORIAL_PLATES.diningRoomInteriors]
  },
  craft: {
    cover: EDITORIAL_PLATES.fibreLabelAtelier,
    plates: [EDITORIAL_PLATES.fibreLabelAtelier, EDITORIAL_PLATES.capsuleWardrobe]
  }
};

const DEFAULT_LAYOUT: ArticleEditorialLayout = {
  cover: EDITORIAL_PLATES.villainessHero,
  plates: [EDITORIAL_PLATES.villainessHero, EDITORIAL_PLATES.villainessDetail]
};

export function getArticleEditorialLayout(
  slug?: string | null,
  category?: string | null
): ArticleEditorialLayout {
  const bySlug = slug ? LAYOUT_BY_SLUG[slug] : undefined;
  if (bySlug) return bySlug;
  const byCategory = category ? LAYOUT_BY_CATEGORY[category.toLowerCase()] : undefined;
  if (byCategory) return byCategory;
  return DEFAULT_LAYOUT;
}
