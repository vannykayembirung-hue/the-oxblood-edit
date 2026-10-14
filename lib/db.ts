import { canonicalArchetype, isCrmSegment } from "@/lib/admin-crm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";
import { sanitizeEditorialHtml, slugify } from "@/lib/sanitize";
import { normalizeCategory } from "@/lib/editorial-taxonomy";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
  normalizeEmail,
  isValidEmail,
  isArchetypeKey
} from "@/lib/newsletter";
import { createToken } from "@/lib/newsletter-server";
import {
  EDITORIAL_PLATES,
  getArticleEditorialLayout,
  type EditorialPlate,
  type EditorialPlateKey
} from "@/lib/editorial-visuals";
import {
  OXBLOOD_CODE_SLUG,
  PRODUCT_SEEDS,
  PRODUCT_SLUGS,
  VILLAINESS_SLUG,
  isProductSlug,
  type ProductSlug
} from "@/lib/products";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

/** Copy the admin editor ships with before an editor has written anything. */
const PLACEHOLDER_CONTENT_MARKERS = [
  "Edit this article in the admin",
  "Edit this article",
  "Lorem ipsum"
];

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the 16:9 plate markup injected into (or appended to) article bodies. */
export function buildEditorialPlateHtml(plate: EditorialPlate, index = 0): string {
  const numeral = ROMAN_NUMERALS[index] ?? String(index + 1);
  const caption = plate.caption.replace(/^Plate\s+[IVX]+\s*·\s*/i, "");
  return (
    `<figure class="plate plate--${index + 1} aspect-video">` +
    `<img src="${plate.src}" alt="${escapeHtml(plate.alt)}" ` +
    `width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" />` +
    `<figcaption>Plate ${numeral} · ${escapeHtml(caption)}</figcaption>` +
    `</figure>`
  );
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function containsPlaceholderCopy(html: string): boolean {
  const text = stripTags(html).toLowerCase();
  if (!text) return true;
  return PLACEHOLDER_CONTENT_MARKERS.some((marker) => text.includes(marker.toLowerCase()));
}

/** Number of already-placed 16:9 figures, so injected plates keep their roman order. */
function figureOffset(html: string): number {
  if (!html) return 0;
  return (html.match(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi) ?? []).length;
}

/** Drops admin placeholder paragraphs while preserving any real copy around them. */
function stripPlaceholderBlocks(html: string): string {
  if (!html) return "";

  const withoutPlaceholderParagraphs = html
    .replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (block) => {
      const text = stripTags(block).toLowerCase();
      return PLACEHOLDER_CONTENT_MARKERS.some((marker) => text.includes(marker.toLowerCase()))
        ? ""
        : block;
    })
    .trim();

  const remainingText = stripTags(withoutPlaceholderParagraphs);
  const looksLikeLeftoverPlaceholder =
    remainingText.length < 40 &&
    PLACEHOLDER_CONTENT_MARKERS.some((marker) =>
      remainingText.toLowerCase().includes(marker.toLowerCase())
    );

  if (!remainingText || looksLikeLeftoverPlaceholder) return "";
  return withoutPlaceholderParagraphs;
}

function isLegacyOrMissingCover(coverImage: string | null | undefined): boolean {
  const value = (coverImage ?? "").trim();
  if (!value) return true;
  // Anything uploaded from the admin (Vercel Blob, remote CDN) is respected as-is;
  // the frame CSS crops it to a strict 16:9. Only missing or legacy repo assets
  // — the old square /images/* paths — fall back to the curated 16:9 cover.
  if (/^https?:\/\//i.test(value)) return false;
  return !/16x9/i.test(value);
}

/**
 * Guarantees the Dark Elegance 16:9 treatment for every article the site reads.
 *
 * Older Neon rows can come back with a NULL cover, a legacy square image, or the
 * "Edit this article in the admin" placeholder body. Rather than render an empty
 * card, this fills in the curated 16:9 cover and injects the story's 16:9 plates
 * into content_html — so the public site is always complete.
 */
export function enrichArticleWithEditorialDefaults<T extends Partial<ArticleRecord>>(
  article: T
): T {
  const layout = getArticleEditorialLayout(article.slug, article.category);
  const enriched: T = { ...article };

  if (isLegacyOrMissingCover(enriched.cover_image)) {
    enriched.cover_image = layout.cover.src;
  }

  const existingBody = stripPlaceholderBlocks((enriched.content_html ?? "").trim());
  const desiredPlates = layout.plates.slice(0, 2);
  const missingPlates = desiredPlates.filter((plateItem) => !existingBody.includes(plateItem.src));

  if (missingPlates.length > 0) {
    const firstFigureIndex = figureOffset(existingBody);
    const plateHtmlBlocks = missingPlates.map((plateItem, index) =>
      buildEditorialPlateHtml(plateItem, firstFigureIndex + index)
    );

    if (!existingBody) {
      const excerptLine = enriched.excerpt?.trim();
      const leadParagraph = `<p>${escapeHtml(
        excerptLine ||
          "A considered note from the journal: dark-romantic fashion, beauty and interiors, edited for US & UK wardrobes."
      )}</p>`;
      enriched.content_html = leadParagraph + plateHtmlBlocks.join("");
    } else {
      const anchor = existingBody.search(/<\/(h2|h3|p)>/i);
      const [firstPlate, ...remainingPlates] = plateHtmlBlocks;
      if (anchor === -1) {
        enriched.content_html = `${existingBody}${plateHtmlBlocks.join("")}`;
      } else {
        const insertAt = existingBody.indexOf(">", anchor) + 1;
        enriched.content_html =
          existingBody.slice(0, insertAt) +
          firstPlate +
          existingBody.slice(insertAt) +
          remainingPlates.join("");
      }
    }
  }

  return enriched;
}



export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  content_html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category: string;
  status: "published" | "draft";
  created_at: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  price: number;
  gumroad_url: string | null;
  description: string | null;
  what_inside: string[];
}

export interface AffiliateLinkRecord {
  id: string;
  name: string;
  merchant: string;
  url: string;
  price_us: string | null;
  price_uk: string | null;
  image: string | null;
  clicks: number;
}

/**
 * A newsletter subscriber, modelled for UK GDPR accountability (Art. 5(2)).
 *
 * The row is the consent record: the exact wording shown, its version, the
 * moment of opt-in, the surface it came from and a salted IP digest. Withdrawal
 * is a state change rather than a delete so the desk can prove it stopped
 * mailing; hard deletion stays available from `/admin` on request.
 */
export interface SubscriberRecord {
  id: string;
  email: string;
  /** Dossier requested with the reading, if any. */
  archetype: string | null;
  /** Where the opt-in happened: villainess-quiz, homepage, footer, … */
  source: string;
  status: "pending" | "confirmed" | "unsubscribed";
  consent_text: string;
  consent_version: string;
  consented_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  confirm_token: string;
  unsubscribe_token: string;
  ip_hash: string | null;
}

export interface SubscriberStats {
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
  byArchetype: { archetype: string; count: number }[];
  last7Days: number;
}

interface LocalStoreData {
  articles: ArticleRecord[];
  products: ProductRecord[];
  affiliate_links: AffiliateLinkRecord[];
  subscribers: SubscriberRecord[];
}

/** Convenience for the seed bodies below: an inline 16:9 plate with a roman caption. */
const articleFigure = (key: EditorialPlateKey, index: number): string =>
  buildEditorialPlateHtml(EDITORIAL_PLATES[key], index);

const DEFAULT_SEED_DATA: LocalStoreData = {
  articles: [
    {
      id: "a1000000-0000-4000-8000-000000000001",
      slug: "how-to-dress-like-the-villainess-dark-romance-outfits",
      title: "How to Dress Like the Villainess: 7 Dark Romance Outfits",
      excerpt: "The oxblood satin, black lace and velvet formula. 3 budgets for US & UK.",
      cover_image: EDITORIAL_PLATES.villainessHero.src,
      content_html: `
        ${articleFigure("villainessHero", 0)}
        <h2>The Architecture of Restraint</h2><p>True dark romance never relies on costume. It is built on tension: fluid oxblood silk against heavyweight cavalry twill, antique gold hardware against matte jet wool, and silhouettes that command a room without raising their voice.</p><h2>The 3 Key Anchor Pieces</h2><ul><li><strong>The Floor-Sweeping Belted Coat:</strong> Choose double-faced wool in espresso, charcoal, or deep oxblood (#6E1423) with a defined shoulder line.</li><li><strong>The Bias-Cut Satin Slip or Skirt:</strong> Liquid movement balances structured outerwear and transitions seamlessly from dusk to candlelight.</li><li><strong>The Square-Toe Leather Boot:</strong> A sculptural heel in burnished burgundy or black calfskin grounds delicate lace and sheer layers.</li></ul><blockquote><p>&ldquo;Elegance is refusal&mdash;knowing which single statement texture belongs in the frame and stripping away the rest.&rdquo;</p></blockquote>${articleFigure("villainessDetail", 1)}<h2>Seven Formulas, One Spine</h2><ol><li><strong>The Nine O&rsquo;Clock Exit:</strong> Jet velvet cape, oxblood satin column, gold signet at the cuff.</li><li><strong>The Reading Room:</strong> Ink merino turtleneck, ivory poet blouse left open one button, charcoal pleated trouser.</li><li><strong>The Uninvited Guest:</strong> Wine velvet blazer over a black Chantilly camisole.</li><li><strong>Rain on a London Square:</strong> Beltless cavalry coat, cordovan horsebit loafer, sheer black hosiery.</li><li><strong>The Long Supper:</strong> Bias-cut midi in dried wine, bare shoulder, one brass ring.</li><li><strong>Second Hand, First Rate:</strong> Archival velvet taken in at the shoulder, never at the hem.</li><li><strong>The Verdict:</strong> Parchment silk at the throat against an all-black column&mdash;the only brightness permitted.</li></ol><h2>Three Budgets for US &amp; UK Wardrobes</h2><p>Whether sourcing heritage British wool on Savile Row, contemporary New York tailoring, or second-hand archival velvet, apply the 70/20/10 rule: 70% matte black or charcoal structure, 20% oxblood depth, and 10% antique gold or luminous skin.</p>`,
      meta_title: "How to Dress Like the Villainess — 7 Dark Romance Outfits | The Oxblood Edit",
      meta_description:
        "Master the oxblood satin, structured wool and black velvet silhouette with 7 intentional formulas across three budgets.",
      category: "style",
      status: "published",
      created_at: "2026-08-24T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000002",
      slug: "the-3-piece-british-autumn-formula",
      title: "The 3-Piece British Autumn Formula: Coat + Knit + Loafers",
      excerpt: "The coat + knit + loafers tested for US & UK fall.",
      cover_image: EDITORIAL_PLATES.britishAutumn.src,
      content_html: `
        ${articleFigure("britishAutumn", 0)}
        <h2>Why the Three-Piece Formula Works</h2><p>From London squares in October mist to New England avenues in late November, the most reliable transitional uniform consists of three disciplined pieces: a tailored longline coat, a fine-gauge merino or cashmere turtleneck, and lug-sole or classic horsebit loafers in oxblood leather.</p><h2>1. The Tailored Coat</h2><p>Look for a minimum 75% wool composition with a Raglan or sharp set-in sleeve. Hemlines falling mid-calf elongate the frame and protect silk or wool trousers from autumn rain.</p><h2>2. The Fine-Gauge Knit</h2><p>Charcoal, espresso, or ink-black merino worn close to the collar bone frames gold jewelry and structured lapels without bulk.</p><h2>3. The Oxblood Loafer</h2><p>Cordovan or oxblood leather acts as a neutral while adding warmth against slate pavements. Pair with sheer black hosiery or ribbed cashmere socks.</p>${articleFigure("britishLayers", 1)}<p>Three pieces is not a limitation; it is a rehearsal. Repeat the formula until it stops looking chosen and starts looking inevitable.</p>`,
      meta_title: "The 3-Piece British Autumn Formula: Coat + Knit + Loafers | The Oxblood Edit",
      meta_description:
        "A rain-tested British autumn uniform combining tailored outerwear, fine merino knitwear, and oxblood leather loafers.",
      category: "style",
      status: "published",
      created_at: "2026-09-07T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000003",
      slug: "vamp-romantic-capsule-wardrobe",
      title: "The 12-Piece Vamp Romantic Capsule Wardrobe",
      excerpt: "12 pieces for Fall/Winter 2026. Links to The Oxblood Code.",
      cover_image: EDITORIAL_PLATES.capsuleWardrobe.src,
      content_html: `
        ${articleFigure("capsuleWardrobe", 0)}
        <h2>12 Pieces, 36 Evening-to-Day Combinations</h2><p>A capsule wardrobe succeeds when every garment shares a disciplined chromatic spine. In <em>The Oxblood Code</em>, we anchor the season around four tones: Jet (#0B0A08), Oxblood (#6E1423), Parchment Cream (#EDE4D0), and Antique Gold (#C6A15B).</p><h3>The Outerwear &amp; Tailoring</h3><ul><li>Double-breasted black wool maxi coat</li><li>Velvet evening blazer in deep wine</li><li>High-waisted pleated wide-leg wool trousers</li></ul><h3>The Silk &amp; Knit Layers</h3><ul><li>Ivory silk poet blouse with subtle cuff detailing</li><li>Fine black merino turtleneck</li><li>Oxblood bias-cut midi skirt</li><li>Black Chantilly-trimmed silk camisole</li><li>Structured corset-seamed midi dress</li></ul>${articleFigure("fibreLabelAtelier", 1)}<h3>The Footwear &amp; Finishing Accents</h3><ul><li>Oxblood leather loafers</li><li>Sculptural stiletto ankle boots</li><li>Gold signet hardware belt</li><li>Structured croc-embossed top-handle bag</li></ul><p>Twelve garments, thirty-six combinations, one palette: the arithmetic is the entire point of a capsule.</p>`,
      meta_title: "The 12-Piece Vamp Romantic Capsule Wardrobe (Fall/Winter 2026)",
      meta_description:
        "Build 36 cohesive dark-romantic outfits from 12 foundational garments in oxblood, jet black, and parchment cream.",
      category: "capsule",
      status: "published",
      created_at: "2026-09-14T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000004",
      slug: "smudged-kohl-oxblood-lips-tutorial",
      title: "Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial",
      excerpt: "US & UK products tutorial.",
      cover_image: EDITORIAL_PLATES.beautyKohlLips.src,
      content_html: `
        ${articleFigure("beautyKohlLips", 0)}
        <h2>The Rule of Velvet Skin and Lived-In Pigment</h2><p>When wearing a deep wine lip (#6E1423), heavy foundation immediately ages the look. Keep the complexion sheer and satin-finished so the contrast between skin and pigment feels effortless.</p><h2>Step 1: Soft-Focus Kohl</h2><p>Trace a creamy espresso or carbon kohl pencil along the upper tightline and outer third of the lower lash line, then diffuse with a dense smudger brush before it sets.</p><h2>Step 2: The Stained Oxblood Lip</h2><p>Press a burgundy matte lipstick into the center of the lips with your ring finger first, then define the Cupid&rsquo;s bow with a sharpened plum-brown liner for structure without harshness.</p><h2>Step 3: What You Leave Out</h2><p>No contour, no cut crease, no highlighter above the cheekbone. One candlelit face should read as a face that has just put a book down.</p>`,
      meta_title: "Smudged Kohl & Oxblood Lips Tutorial | The Oxblood Edit",
      meta_description:
        "Achieve lived-in kohl liner and velvet-matte oxblood lips with luminous satin skin.",
      category: "beauty",
      status: "published",
      created_at: "2026-09-21T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000005",
      slug: "dark-elegance-dining-room-ideas",
      title: "7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight",
      excerpt: "Dark-elegance home decor inspiration.",
      cover_image: EDITORIAL_PLATES.diningRoomInteriors.src,
      content_html: `
        ${articleFigure("diningRoomInteriors", 0)}
        <h2>Designing for Candlelight</h2><p>Dining rooms are used primarily after sundown; painting them stark white fights their natural atmosphere. Embracing deep oxblood, smoked oak, and unlacquered brass turns every dinner into an intimate salon.</p><ul><li>Limewash walls in muted burgundy or aubergine</li><li>Unlacquered brass taper holders at staggered heights</li><li>Unbleached parchment linen table runners</li><li>Black velvet chair backs that swallow the light</li><li>One mirrored sideboard, angled at the window</li><li>Heavy tapers only&mdash;never votives in glass</li><li>A single dried branch, no bouquet</li></ul><p>Seven decisions, one atmosphere: a room that flatters a face at ten at night.</p>`,
      meta_title: "7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight",
      meta_description:
        "Transform your dining space with oxblood limewash walls, unlacquered brass candlesticks, and Belgian linen.",
      category: "interiors",
      status: "published",
      created_at: "2026-09-28T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000006",
      slug: "the-british-layering-code-wool-merino-silk",
      title: "The British Layering Code: Wool, Merino, Silk — In That Order",
      excerpt: "Four textures, three temperatures, zero visual noise.",
      cover_image: EDITORIAL_PLATES.britishLayers.src,
      content_html: `
        ${articleFigure("britishLayers", 0)}
        <h2>The Order Is the Outfit</h2><p>Layering fails in Britain not from a shortage of cold but from a surplus of ambition. The code is sequential: silk against the skin for slip, merino for trapped air, wool for weather. Anything heavier goes outside, never between.</p><h2>Reading a Room by Its Shoulders</h2><ul><li><strong>Shoulder line:</strong> keep it unpadded and let the coat do the architecture.</li><li><strong>Collar gap:</strong> one finger between throat and knit; two if a ribbon is intended.</li><li><strong>Hem cascade:</strong> each layer ends at a different inch, never within two of its neighbour.</li></ul>${articleFigure("britishAutumn", 1)}<h2>Manchester to Manhattan</h2><p>At 6&deg;C and wet, the three-piece carries a full day. At 14&deg;C indoors, the silk and merino alone are the outfit&mdash;which is precisely what makes the formula worth the money.</p>`,
      meta_title: "The British Layering Code: Wool, Merino, Silk | The Oxblood Edit",
      meta_description:
        "The silk-merino-wool sequence that survives a British autumn and reads as intent in a New York winter.",
      category: "style",
      status: "published",
      created_at: "2026-08-31T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000007",
      slug: "reading-the-fibre-label-in-a-dark-atelier",
      title: "Reading the Fibre Label in a Dark Atelier",
      excerpt: "GSM, wool percentage, lining dyed to match: audit a garment before you buy it.",
      cover_image: EDITORIAL_PLATES.fibreLabelAtelier.src,
      content_html: `
        ${articleFigure("fibreLabelAtelier", 0)}
        <h2>Four Numbers Before Any Silhouette</h2><p>A dark-romantic wardrobe is bought with a calculator as much as an eye. Wool percentage, fabric weight in grams per square metre, lining composition, and the ratio of buttons to buttonholes will tell you more than a photograph ever will.</p><ul><li><strong>75% wool minimum</strong> in outerwear; below that, rain wins.</li><li><strong>320gsm and above</strong> for a coat that holds a line without interfacing.</li><li><strong>Viscose or cotton lining</strong> dyed to the shell, never contrast polyester.</li><li><strong>Horn or corozo buttons</strong>; plastic shines, and shine is the enemy of velvet.</li></ul><h2>The Candlelight Test</h2><p>Take the garment into a dim room before you decide anything. Dark elegance is engineered for low light: if the cloth goes flat beside a candle, it was bought for the shop floor.</p>`,
      meta_title: "Reading the Fibre Label in a Dark Atelier | The Oxblood Edit",
      meta_description:
        "How to audit wool percentage, GSM, lining and hardware before committing to a dark-romantic garment.",
      category: "craft",
      status: "published",
      created_at: "2026-10-05T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000008",
      slug: "the-us-oxblood-edit-american-autumn-tailoring",
      title: "The US Oxblood Edit: American Autumn Tailoring in Three Budgets",
      excerpt: "Overheated rooms, sharp sidewalks: the US autumn edit in three budgets.",
      cover_image: EDITORIAL_PLATES.villainessHero.src,
      content_html: `
        ${articleFigure("villainessHero", 0)}
        <h2>Two Climates, One Coat</h2><p>An American autumn is not a British one with a different flag. It is overheated interiors against a sharp evening drop: a wardrobe that has to survive 24&deg;C at two in the afternoon and 9&deg;C on the sidewalk at ten, without a change of clothes. The house answer is still the three-piece spine&mdash;coat, knit, shoe&mdash;weighted differently.</p><h2>1. The Coat, Built to Be Taken Off</h2><p>Choose double-faced wool in the 420&ndash;480gsm band rather than the 520gsm British coat. Above that weight an American autumn coat becomes a taxi coat; below 400gsm it stops holding a shoulder line in a cold wind. Espresso, charcoal, or oxblood #6E1423.</p><h2>2. The Knit: The Variable Nobody Prices</h2><p>Air conditioning is the American variable. A fine-gauge merino turtleneck under a blazer is the layer that comes off and still reads as intentional at the table; a chunky knit under the same blazer reads as luggage.</p><h2>3. The Shoe: Leather Against Granite</h2><p>Oxblood leather takes a New York pavement the way it takes a London square, with one amendment: a 25mm lug sole for the November ice, and no more&mdash;past 40mm a lugged sole stops being a loafer and starts being equipment.</p>${articleFigure("capsuleWardrobe", 1)}<h2>Three Budgets, One Spine</h2><ul><li><strong>Under $250:</strong> a single 80% wool coat taken to a tailor for the shoulder. Sixty dollars of alteration beats four hundred dollars of fabric.</li><li><strong>$250&ndash;$800:</strong> the mid-tier coat, one merino turtleneck, one corrected-grain oxblood loafer.</li><li><strong>Investment:</strong> 460gsm double-faced wool with a hand-finished hem, and a cordovan loafer you resole rather than replace.</li></ul><p>Three pieces, two climates, one chromatic spine. Only the weight changes with the flag&mdash;never the arithmetic.</p>`,
      meta_title: "The US Oxblood Edit: American Autumn Tailoring in Three Budgets",
      meta_description:
        "How to build a US autumn wardrobe that survives heated interiors and a cold sidewalk: coat weights, knit gauges and three transparent budgets.",
      category: "style",
      status: "published",
      created_at: "2026-10-12T07:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000009",
      slug: "the-fit-file-us-0-16-uk-4-20",
      title: "The Fit File: The Same Oxblood Formula in US 0–16 and UK 4–20",
      excerpt: "Flat-measured garment data for one formula, US 0–16 against UK 4–20.",
      cover_image: EDITORIAL_PLATES.fibreLabelAtelier.src,
      content_html: `
        ${articleFigure("fibreLabelAtelier", 0)}
        <h2>The +4 Rule, and Why It Is Not Enough</h2><p>A US 6 is a UK 10&mdash;an offset of four that gets a reader onto the right rack and then abandons her there. Two houses producing the same nominal UK 10 will still differ by three centimetres at the waist and six at the sleeve, because a size label is a marketing decision and a measurement is not.</p><h2>The Fit File, Flat-Measured</h2><table><thead><tr><th>Garment</th><th>US</th><th>UK</th><th>Bust / chest</th><th>Waist</th><th>Hip</th></tr></thead><tbody><tr><td>Bias satin midi</td><td>0&ndash;2</td><td>4&ndash;6</td><td>81 cm / 31.9 in</td><td>63 cm / 24.8 in</td><td>89 cm / 35.0 in</td></tr><tr><td>Bias satin midi</td><td>4&ndash;6</td><td>8&ndash;10</td><td>88 cm / 34.6 in</td><td>70 cm / 27.6 in</td><td>96 cm / 37.8 in</td></tr><tr><td>Bias satin midi</td><td>8&ndash;10</td><td>12&ndash;14</td><td>95 cm / 37.4 in</td><td>77 cm / 30.3 in</td><td>103 cm / 40.6 in</td></tr><tr><td>Bias satin midi</td><td>12&ndash;14</td><td>16&ndash;18</td><td>104 cm / 40.9 in</td><td>86 cm / 33.9 in</td><td>112 cm / 44.1 in</td></tr><tr><td>Bias satin midi</td><td>16</td><td>20</td><td>112 cm / 44.1 in</td><td>94 cm / 37.0 in</td><td>120 cm / 47.2 in</td></tr><tr><td>Double-faced coat</td><td>4&ndash;6</td><td>8&ndash;10</td><td>92 cm / 36.2 in</td><td>76 cm / 29.9 in</td><td>98 cm / 38.6 in</td></tr><tr><td>Double-faced coat</td><td>12&ndash;14</td><td>16&ndash;18</td><td>108 cm / 42.5 in</td><td>92 cm / 36.2 in</td><td>114 cm / 44.9 in</td></tr></tbody></table><h2>How the File Was Measured</h2><p>Every garment is laid flat twenty-four hours after a wear, measured tape-to-tape at three points, and averaged across two units of the same size wherever both were bought. Sleeves are measured from the shoulder seam to the cuff, hems from the waist seam for trousers and from the shoulder for coats. The desk buys its own garments, keeps the receipts, and returns what fails the audit&mdash;returns are disclosed, with the reason, in the house standards.</p>${articleFigure("villainessDetail", 1)}<h2>Where the Formula Changes Between Markets</h2><ul><li><strong>Sleeve length:</strong> US runs are cut about 1.5cm longer; hem the cuff rather than alter the shoulder if you sit between sizes.</li><li><strong>Rise:</strong> UK tailoring sits roughly 2cm higher in the same waist size&mdash;belt the UK pair lower rather than hauling the US pair up.</li><li><strong>Coat hem:</strong> a UK mid-calf falls mid-calf in the US only when it is shortened below the waist seam, never at the hem itself.</li><li><strong>Lining:</strong> identical in both markets and dyed to the shell&mdash;the one number that never changes.</li></ul><p>Take the file into the fitting room. It is a better use of an afternoon than a mirror and a hope.</p>`,
      meta_title: "The Fit File: US 0–16 and UK 4–20 in the Same Oxblood Formula",
      meta_description:
        "Flat-measured garment data, a US 0–16 to UK 4–20 fit file, and the four places the same oxblood formula is cut differently between markets.",
      category: "craft",
      status: "published",
      created_at: "2026-10-14T07:30:00.000Z"
    }
  ],
  products: [
    { id: "b1000000-0000-4000-8000-000000000001", ...PRODUCT_SEEDS[OXBLOOD_CODE_SLUG] },
    { id: "b1000000-0000-4000-8000-000000000002", ...PRODUCT_SEEDS[VILLAINESS_SLUG] }
  ],
  affiliate_links: [
    {
      id: "c1000000-0000-4000-8000-000000000001",
      name: "Double-Faced Wool Belted Coat in Deep Oxblood",
      merchant: "Net-a-Porter / Selfridges",
      url: "https://www.net-a-porter.com/",
      price_us: "$690",
      price_uk: "£560",
      image: EDITORIAL_PLATES.britishLayers.src,
      clicks: 0
    },
    {
      id: "c1000000-0000-4000-8000-000000000002",
      name: "Bias-Cut Heavy Silk Satin Midi Skirt",
      merchant: "Reformation",
      url: "https://www.thereformation.com/",
      price_us: "$298",
      price_uk: "£248",
      image: EDITORIAL_PLATES.villainessDetail.src,
      clicks: 0
    },
    {
      id: "c1000000-0000-4000-8000-000000000003",
      name: "Burnished Cordovan Leather Horsebit Loafers",
      merchant: "Russell & Bromley",
      url: "https://www.russellandbromley.co.uk/",
      price_us: "$345",
      price_uk: "£275",
      image: EDITORIAL_PLATES.capsuleWardrobe.src,
      clicks: 0
    },
    {
      id: "c1000000-0000-4000-8000-000000000004",
      name: "Fine-Gauge Merino Turtleneck", merchant: "UNIQLO",
      url: "https://www.uniqlo.com/", price_us: "$50", price_uk: "£35",
      image: EDITORIAL_PLATES.britishLayers.src, clicks: 0
    },
    {
      id: "c1000000-0000-4000-8000-000000000005",
      name: "Black Velvet Evening Dress", merchant: "Reformation",
      url: "https://www.thereformation.com/", price_us: "$278", price_uk: "£248",
      image: EDITORIAL_PLATES.villainessHero.src, clicks: 0
    },
    {
      id: "c1000000-0000-4000-8000-000000000006",
      name: "Brass Taper Candle Holder", merchant: "Anthropologie",
      url: "https://www.anthropologie.com/", price_us: "$38", price_uk: "£32",
      image: EDITORIAL_PLATES.diningRoomInteriors.src, clicks: 0
    }
  ],
  // Never seeded with invented addresses: the Subscribers tab in `/admin` starts
  // empty and only ever shows consent records the desk actually collected.
  subscribers: []
};

for (const article of DEFAULT_SEED_DATA.articles) {
  article.content_html = enrichArticleWithEditorialDefaults(article).content_html;
  article.content_html += `<h2>Editorial notes &amp; further reading</h2><p>By Clara Vance, The Oxblood Edit. Read our <a href="/about">editorial desk profile</a> and <a href="/editorial-standards">review and affiliate disclosure standards</a>. UK and US price indications are not live quotes; check the retailer’s local listing, composition, size guide and return terms before purchasing.</p>`;
}

/** Explicit catalog upgrade: one atomic Neon transaction; never writes to a fallback store. */
export async function syncSeedCatalog(): Promise<void> {
  if (!sql) throw new Error("Neon DATABASE_URL is required for catalog synchronization.");
  const queries = [
    ...DEFAULT_SEED_DATA.articles.map((a) => sql!`
      insert into articles (slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at)
      values (${a.slug}, ${a.title}, ${a.excerpt}, ${a.cover_image}, ${sanitizeEditorialHtml(a.content_html)}, ${a.meta_title}, ${a.meta_description}, ${a.category}, ${a.status}, ${a.created_at})
      on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt,
        cover_image = excluded.cover_image, content_html = excluded.content_html,
        meta_title = excluded.meta_title, meta_description = excluded.meta_description,
        category = excluded.category, status = excluded.status, created_at = excluded.created_at
    `),
    ...DEFAULT_SEED_DATA.products.map((p) => sql!`
      insert into products (slug, name, price, gumroad_url, description, what_inside)
      values (${p.slug}, ${p.name}, ${p.price}, ${p.gumroad_url}, ${p.description}, ${p.what_inside})
      on conflict (slug) do update set name = excluded.name, price = excluded.price,
        gumroad_url = excluded.gumroad_url, description = excluded.description, what_inside = excluded.what_inside
    `),
    ...DEFAULT_SEED_DATA.affiliate_links.map((a) => sql!`
      with existing as (
        update affiliate_links set name = ${a.name}, merchant = ${a.merchant}, url = ${a.url},
          price_us = ${a.price_us}, price_uk = ${a.price_uk}, image = ${a.image}
        where id = ${a.id} or (name = ${a.name} and merchant = ${a.merchant})
        returning id
      )
      insert into affiliate_links (id, name, merchant, url, price_us, price_uk, image, clicks)
      select ${a.id}, ${a.name}, ${a.merchant}, ${a.url}, ${a.price_us}, ${a.price_uk}, ${a.image}, 0
      where not exists (select 1 from existing)
      on conflict (id) do update set name = excluded.name, merchant = excluded.merchant,
        url = excluded.url, price_us = excluded.price_us, price_uk = excluded.price_uk, image = excluded.image
    `)
  ];
  await sql.transaction(queries);
}

/** Manual VIP capture never fabricates consent or reactivates a suppressed address. */
export async function addSubscriberAdmin(input: { email: string; archetype: string; source: string }): Promise<void> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email) || (!isCrmSegment(input.archetype) && !isArchetypeKey(input.archetype)) || !input.source.trim() || input.source.length > 100) {
    throw new Error("Invalid VIP contact");
  }
  const archetype = canonicalArchetype(input.archetype);
  const source = input.source.trim();
  const note = "Manually added by the editorial desk; newsletter consent not yet recorded.";
  if (sql) {
    await sql`insert into subscribers (email, archetype, source, status, consent_text, consent_version, confirm_token, unsubscribe_token)
      values (${email}, ${archetype}, ${source}, 'pending', ${note}, 'admin-vip/pending', ${createToken()}, ${createToken()})
      on conflict (email) do nothing`;
    return;
  }
  const store = readLocalStore();
  if (store.subscribers.some((s) => normalizeEmail(s.email) === email)) return;
  store.subscribers.unshift({ id: crypto.randomUUID(), email, archetype, source, status: "pending",
    consent_text: note, consent_version: "admin-vip/pending", consented_at: new Date().toISOString(),
    confirmed_at: null, unsubscribed_at: null, confirm_token: createToken(), unsubscribe_token: createToken(), ip_hash: null });
  writeLocalStore(store);
}

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "local-store.json");

/**
 * Local stores written before the two Gumroad editions shipped still hold the
 * placeholder "78-page" Oxblood Code row (with `__GUMROAD_URL__`). Swap that
 * untouched seed for the real edition; anything an editor changed is kept.
 */
function migrateLegacyProducts(products: ProductRecord[]): ProductRecord[] {
  return products.map((product) => {
    const isLegacySeed =
      product.slug === OXBLOOD_CODE_SLUG &&
      product.gumroad_url === "__GUMROAD_URL__" &&
      (product.description ?? "").startsWith("A 78-page");
    return isLegacySeed ? { id: product.id, ...PRODUCT_SEEDS[OXBLOOD_CODE_SLUG] } : product;
  });
}

function readLocalStore(): LocalStoreData {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
      return {
        articles: Array.isArray(parsed.articles) ? parsed.articles : DEFAULT_SEED_DATA.articles,
        products: Array.isArray(parsed.products)
          ? migrateLegacyProducts(parsed.products)
          : DEFAULT_SEED_DATA.products,
        affiliate_links: Array.isArray(parsed.affiliate_links)
          ? parsed.affiliate_links
          : DEFAULT_SEED_DATA.affiliate_links,
        subscribers: Array.isArray(parsed.subscribers)
          ? parsed.subscribers.map(normalizeSubscriberRow)
          : DEFAULT_SEED_DATA.subscribers
      };
    }
  } catch (err) {
    console.error("Failed reading local store, using seed data:", err);
  }
  return structuredClone(DEFAULT_SEED_DATA);
}

function writeLocalStore(data: LocalStoreData): void {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing local store:", err);
  }
}

function normalizeArticleRow(row: Record<string, unknown>): ArticleRecord {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: row.excerpt != null ? String(row.excerpt) : null,
    cover_image: row.cover_image != null ? String(row.cover_image) : null,
    content_html: row.content_html != null ? String(row.content_html) : null,
    meta_title: row.meta_title != null ? String(row.meta_title) : null,
    meta_description: row.meta_description != null ? String(row.meta_description) : null,
    // Legacy categories (`home`, `wardrobe`, `guides`, …) resolve to a pillar.
    category: normalizeCategory(row.category != null ? String(row.category) : null),
    status: row.status === "published" ? "published" : "draft",
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? new Date().toISOString())
  };
}

function normalizeProductRow(row: Record<string, unknown>): ProductRecord {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    price: Number(row.price ?? 27),
    gumroad_url: row.gumroad_url != null ? String(row.gumroad_url) : null,
    description: row.description != null ? String(row.description) : null,
    what_inside: Array.isArray(row.what_inside)
      ? row.what_inside.map((item) => String(item))
      : []
  };
}

function normalizeAffiliateRow(row: Record<string, unknown>): AffiliateLinkRecord {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    merchant: String(row.merchant ?? ""),
    url: String(row.url ?? ""),
    price_us: row.price_us != null ? String(row.price_us) : null,
    price_uk: row.price_uk != null ? String(row.price_uk) : null,
    image: row.image != null ? String(row.image) : null,
    clicks: Number(row.clicks ?? 0)
  };
}

function normalizeSubscriberRow(
  row: Record<string, unknown> | SubscriberRecord
): SubscriberRecord {
  const rawStatus = String(row.status ?? "pending");
  const status: SubscriberRecord["status"] =
    rawStatus === "confirmed" || rawStatus === "unsubscribed" ? rawStatus : "pending";

  return {
    id: String(row.id ?? ""),
    email: normalizeEmail(row.email),
    archetype: row.archetype != null && String(row.archetype) ? String(row.archetype) : null,
    source: String(row.source ?? "unknown"),
    status,
    consent_text: String(row.consent_text ?? NEWSLETTER_CONSENT_TEXT),
    consent_version: String(row.consent_version ?? NEWSLETTER_CONSENT_VERSION),
    consented_at:
      row.consented_at instanceof Date
        ? row.consented_at.toISOString()
        : String(row.consented_at ?? new Date().toISOString()),
    confirmed_at:
      row.confirmed_at == null
        ? null
        : row.confirmed_at instanceof Date
          ? row.confirmed_at.toISOString()
          : String(row.confirmed_at),
    unsubscribed_at:
      row.unsubscribed_at == null
        ? null
        : row.unsubscribed_at instanceof Date
          ? row.unsubscribed_at.toISOString()
          : String(row.unsubscribed_at),
    confirm_token: String(row.confirm_token ?? ""),
    unsubscribe_token: String(row.unsubscribe_token ?? ""),
    ip_hash: row.ip_hash != null ? String(row.ip_hash) : null
  };
}

export async function getPublishedArticles(limit?: number): Promise<ArticleRecord[]> {
  if (sql) {
    try {
      const rows = limit
        ? await sql`
            select id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
            from articles
            where status = 'published'
            order by created_at desc
            limit ${limit}
          `
        : await sql`
            select id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
            from articles
            where status = 'published'
            order by created_at desc
          `;
      return rows
        .map((r) => normalizeArticleRow(r as Record<string, unknown>))
        .map(enrichArticleWithEditorialDefaults);
    } catch (error) {
      console.error("Database query failed in getPublishedArticles:", error);
    }
  }
  const store = readLocalStore();
  const published = store.articles
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return (typeof limit === "number" ? published.slice(0, limit) : published).map(
    enrichArticleWithEditorialDefaults
  );
}

export async function getAllArticles(): Promise<ArticleRecord[]> {
  if (sql) {
    try {
      const rows = await sql`
        select id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
        from articles
        order by created_at desc
      `;
      return rows.map((r) => normalizeArticleRow(r as Record<string, unknown>));
    } catch (error) {
      console.error("Database query failed in getAllArticles:", error);
    }
  }
  const store = readLocalStore();
  return [...store.articles].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getArticleBySlug(
  slug: string,
  includeDrafts = false
): Promise<ArticleRecord | null> {
  if (sql) {
    try {
      const rows = includeDrafts
        ? await sql`
            select id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
            from articles
            where slug = ${slug}
            limit 1
          `
        : await sql`
            select id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
            from articles
            where slug = ${slug} and status = 'published'
            limit 1
          `;
      if (!rows[0]) return null;
      return enrichArticleWithEditorialDefaults(
        normalizeArticleRow(rows[0] as Record<string, unknown>)
      );
    } catch (error) {
      console.error("Database query failed in getArticleBySlug:", error);
      return null;
    }
  }
  const store = readLocalStore();
  const found = store.articles.find(
    (a) => a.slug === slug && (includeDrafts || a.status === "published")
  );
  return found ? enrichArticleWithEditorialDefaults(found) : null;
}

export async function getArticleById(id: string): Promise<ArticleRecord | null> {
  if (sql) {
    try {
      const rows = await sql`
        select id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
        from articles
        where id = ${id}
        limit 1
      `;
      if (!rows[0]) return null;
      return normalizeArticleRow(rows[0] as Record<string, unknown>);
    } catch (error) {
      console.error("Database query failed in getArticleById:", error);
      return null;
    }
  }
  const store = readLocalStore();
  return store.articles.find((a) => a.id === id) ?? null;
}

export interface UpsertArticleInput {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string | null;
  cover_image?: string | null;
  content_html?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  category?: string;
  status?: "published" | "draft";
}

export async function saveArticle(input: UpsertArticleInput): Promise<ArticleRecord> {
  const title = input.title.trim();
  const cleanSlug = slugify(input.slug?.trim() || title) || `article-${Date.now()}`;
  const excerpt = input.excerpt?.trim() || null;
  const coverImage = input.cover_image?.trim() || null;
  const contentHtml = sanitizeEditorialHtml(input.content_html || "");
  const metaTitle = input.meta_title?.trim() || null;
  const metaDescription = input.meta_description?.trim() || null;
  const category = normalizeCategory(input.category);
  const status: "published" | "draft" = input.status === "published" ? "published" : "draft";

  if (sql) {
    if (input.id) {
      const rows = await sql`
        update articles
        set
          slug = ${cleanSlug},
          title = ${title},
          excerpt = ${excerpt},
          cover_image = ${coverImage},
          content_html = ${contentHtml},
          meta_title = ${metaTitle},
          meta_description = ${metaDescription},
          category = ${category},
          status = ${status}
        where id = ${input.id}
        returning id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
      `;
      return normalizeArticleRow(rows[0] as Record<string, unknown>);
    } else {
      const rows = await sql`
        insert into articles (slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status)
        values (${cleanSlug}, ${title}, ${excerpt}, ${coverImage}, ${contentHtml}, ${metaTitle}, ${metaDescription}, ${category}, ${status})
        on conflict (slug) do update set
          title = excluded.title,
          excerpt = excluded.excerpt,
          cover_image = excluded.cover_image,
          content_html = excluded.content_html,
          meta_title = excluded.meta_title,
          meta_description = excluded.meta_description,
          category = excluded.category,
          status = excluded.status
        returning id, slug, title, excerpt, cover_image, content_html, meta_title, meta_description, category, status, created_at
      `;
      return normalizeArticleRow(rows[0] as Record<string, unknown>);
    }
  }

  const store = readLocalStore();
  const existingIdx = input.id
    ? store.articles.findIndex((a) => a.id === input.id)
    : store.articles.findIndex((a) => a.slug === cleanSlug);

  if (existingIdx >= 0) {
    const updated: ArticleRecord = {
      ...store.articles[existingIdx],
      slug: cleanSlug,
      title,
      excerpt,
      cover_image: coverImage,
      content_html: contentHtml,
      meta_title: metaTitle,
      meta_description: metaDescription,
      category,
      status
    };
    store.articles[existingIdx] = updated;
    writeLocalStore(store);
    return updated;
  }

  const created: ArticleRecord = {
    id: crypto.randomUUID(),
    slug: cleanSlug,
    title,
    excerpt,
    cover_image: coverImage,
    content_html: contentHtml,
    meta_title: metaTitle,
    meta_description: metaDescription,
    category,
    status,
    created_at: new Date().toISOString()
  };
  store.articles.unshift(created);
  writeLocalStore(store);
  return created;
}

export async function setArticleStatus(
  id: string,
  status: "published" | "draft"
): Promise<void> {
  if (sql) {
    await sql`update articles set status = ${status} where id = ${id}`;
    return;
  }
  const store = readLocalStore();
  const article = store.articles.find((a) => a.id === id);
  if (article) {
    article.status = status;
    writeLocalStore(store);
  }
}

export async function deleteArticleById(id: string): Promise<void> {
  if (sql) {
    await sql`delete from articles where id = ${id}`;
    return;
  }
  const store = readLocalStore();
  store.articles = store.articles.filter((a) => a.id !== id);
  writeLocalStore(store);
}

/** Seed copy of an edition, used when Neon or the local store has no row for it yet. */
function seedProduct(slug: ProductSlug): ProductRecord {
  const seed = DEFAULT_SEED_DATA.products.find((p) => p.slug === slug);
  return structuredClone(seed ?? { id: `seed-${slug}`, ...PRODUCT_SEEDS[slug] });
}

export async function getProductBySlug(slug = OXBLOOD_CODE_SLUG): Promise<ProductRecord | null> {
  if (sql) {
    try {
      const rows = await sql`
        select id, name, slug, price, gumroad_url, description, what_inside
        from products
        where slug = ${slug}
        limit 1
      `;
      if (rows[0]) return normalizeProductRow(rows[0] as Record<string, unknown>);
      return isProductSlug(slug) ? seedProduct(slug) : null;
    } catch (error) {
      console.error("Database query failed in getProductBySlug:", error);
    }
  }
  const store = readLocalStore();
  const found = store.products.find((p) => p.slug === slug);
  if (found) return found;
  return isProductSlug(slug) ? seedProduct(slug) : null;
}

/**
 * The house's two Gumroad editions, always in display order:
 * `the-oxblood-code` (Édition 01) then `villainess-wardrobe-system` (Édition 02).
 * An edition missing from the database (neon.sql not re-run yet) falls back to
 * its seed so the shop never renders a single product.
 */
export async function getAllProducts(): Promise<ProductRecord[]> {
  const slugs = [...PRODUCT_SLUGS];
  let rows: ProductRecord[] = [];

  if (sql) {
    try {
      const result = (await sql`
        select id, name, slug, price, gumroad_url, description, what_inside
        from products
        where slug = any(${slugs})
      `) as Record<string, unknown>[];
      rows = result.map(normalizeProductRow);
    } catch (error) {
      console.error("Database query failed in getAllProducts:", error);
      rows = readLocalStore().products;
    }
  } else {
    rows = readLocalStore().products;
  }

  return slugs.map((slug) => rows.find((p) => p.slug === slug) ?? seedProduct(slug));
}

export interface SaveProductInput {
  name: string;
  slug?: string;
  price: number;
  gumroad_url?: string | null;
  description?: string | null;
  what_inside: string[];
}

export async function saveProduct(input: SaveProductInput): Promise<ProductRecord> {
  const slug = slugify(input.slug || OXBLOOD_CODE_SLUG) || OXBLOOD_CODE_SLUG;
  const seed = isProductSlug(slug) ? PRODUCT_SEEDS[slug] : PRODUCT_SEEDS[OXBLOOD_CODE_SLUG];
  const name = input.name.trim() || seed.name;
  const price =
    Number.isFinite(input.price) && input.price >= 0 ? Math.round(input.price) : seed.price;
  const gumroadUrl = input.gumroad_url?.trim() || null;
  const description = input.description?.trim() || null;
  const whatInside = input.what_inside.map((s) => s.trim()).filter(Boolean);

  if (sql) {
    const rows = await sql`
      insert into products (name, slug, price, gumroad_url, description, what_inside)
      values (${name}, ${slug}, ${price}, ${gumroadUrl}, ${description}, ${whatInside})
      on conflict (slug) do update set
        name = excluded.name,
        price = excluded.price,
        gumroad_url = excluded.gumroad_url,
        description = excluded.description,
        what_inside = excluded.what_inside
      returning id, name, slug, price, gumroad_url, description, what_inside
    `;
    return normalizeProductRow(rows[0] as Record<string, unknown>);
  }

  const store = readLocalStore();
  const idx = store.products.findIndex((p) => p.slug === slug);
  if (idx >= 0) {
    store.products[idx] = {
      ...store.products[idx],
      name,
      price,
      gumroad_url: gumroadUrl,
      description,
      what_inside: whatInside
    };
    writeLocalStore(store);
    return store.products[idx];
  }

  const created: ProductRecord = {
    id: crypto.randomUUID(),
    name,
    slug,
    price,
    gumroad_url: gumroadUrl,
    description,
    what_inside: whatInside
  };
  store.products.push(created);
  writeLocalStore(store);
  return created;
}

export async function getAffiliateLinks(): Promise<AffiliateLinkRecord[]> {
  if (sql) {
    try {
      const rows = await sql`
        select id, name, merchant, url, price_us, price_uk, image, clicks
        from affiliate_links
        order by clicks desc, name asc
      `;
      return rows.map((r) => normalizeAffiliateRow(r as Record<string, unknown>));
    } catch (error) {
      console.error("Database query failed in getAffiliateLinks:", error);
    }
  }
  const store = readLocalStore();
  return [...store.affiliate_links].sort((a, b) => b.clicks - a.clicks);
}

export interface SaveAffiliateLinkInput {
  id?: string;
  name: string;
  merchant: string;
  url: string;
  price_us?: string | null;
  price_uk?: string | null;
  image?: string | null;
}

export async function saveAffiliateLink(
  input: SaveAffiliateLinkInput
): Promise<AffiliateLinkRecord> {
  const name = input.name.trim();
  const merchant = input.merchant.trim();
  const url = input.url.trim();
  const priceUs = input.price_us?.trim() || null;
  const priceUk = input.price_uk?.trim() || null;
  const image = input.image?.trim() || null;

  if (sql) {
    if (input.id) {
      const rows = await sql`
        update affiliate_links
        set
          name = ${name},
          merchant = ${merchant},
          url = ${url},
          price_us = ${priceUs},
          price_uk = ${priceUk},
          image = ${image}
        where id = ${input.id}
        returning id, name, merchant, url, price_us, price_uk, image, clicks
      `;
      return normalizeAffiliateRow(rows[0] as Record<string, unknown>);
    }
    const rows = await sql`
      insert into affiliate_links (name, merchant, url, price_us, price_uk, image)
      values (${name}, ${merchant}, ${url}, ${priceUs}, ${priceUk}, ${image})
      returning id, name, merchant, url, price_us, price_uk, image, clicks
    `;
    return normalizeAffiliateRow(rows[0] as Record<string, unknown>);
  }

  const store = readLocalStore();
  if (input.id) {
    const idx = store.affiliate_links.findIndex((l) => l.id === input.id);
    if (idx >= 0) {
      store.affiliate_links[idx] = {
        ...store.affiliate_links[idx],
        name,
        merchant,
        url,
        price_us: priceUs,
        price_uk: priceUk,
        image
      };
      writeLocalStore(store);
      return store.affiliate_links[idx];
    }
  }

  const created: AffiliateLinkRecord = {
    id: crypto.randomUUID(),
    name,
    merchant,
    url,
    price_us: priceUs,
    price_uk: priceUk,
    image,
    clicks: 0
  };
  store.affiliate_links.push(created);
  writeLocalStore(store);
  return created;
}

export async function deleteAffiliateLinkById(id: string): Promise<void> {
  if (sql) {
    await sql`delete from affiliate_links where id = ${id}`;
    return;
  }
  const store = readLocalStore();
  store.affiliate_links = store.affiliate_links.filter((l) => l.id !== id);
  writeLocalStore(store);
}

export async function recordAffiliateClick(id: string): Promise<string | null> {
  if (sql) {
    try {
      const rows = await sql`
        update affiliate_links
        set clicks = coalesce(clicks, 0) + 1
        where id = ${id}
        returning url
      `;
      if (rows[0]?.url) return String(rows[0].url);
      return null;
    } catch (error) {
      console.error("Failed recording affiliate click:", error);
      return null;
    }
  }
  const store = readLocalStore();
  const link = store.affiliate_links.find((l) => l.id === id);
  if (!link) return null;
  link.clicks = (link.clicks || 0) + 1;
  writeLocalStore(store);
  return link.url;
}

/* ------------------------------------------------------------------------- */
/*  Newsletter subscribers — consent records for the Sunday Dispatch          */
/* ------------------------------------------------------------------------- */

/**
 * Every subscriber read selects its columns explicitly — the Neon HTTP driver in
 * use here has no `sql.unsafe` helper, and one shared column list keeps the row
 * shape identical between PostgreSQL and the local JSON store.
 */

export interface SubscribeInput {
  email: string;
  /** Dossier requested alongside the opt-in (villainess archetype key). */
  archetype?: string | null;
  source: string;
  /** Consent evidence. The API only calls this once consent has been asserted. */
  consentText?: string;
  consentVersion?: string;
  ipHash?: string | null;
}

export interface SubscribeResult {
  subscriber: SubscriberRecord;
  /** True when this call created the row; false when it updated an existing one. */
  created: boolean;
  /** True when the address had already confirmed — the form stays silent. */
  alreadyConfirmed: boolean;
}

export async function subscribeToNewsletter(input: SubscribeInput): Promise<SubscribeResult> {
  const email = normalizeEmail(input.email);
  const archetype = input.archetype?.trim() || null;
  const source = input.source.trim() || "unknown";
  const consentText = input.consentText || NEWSLETTER_CONSENT_TEXT;
  const consentVersion = input.consentVersion || NEWSLETTER_CONSENT_VERSION;
  const ipHash = input.ipHash ?? null;
  const now = new Date().toISOString();

  if (sql) {
    const existing = (await sql`
      select id, email, archetype, source, status, consent_text, consent_version, consented_at, confirmed_at, unsubscribed_at, confirm_token, unsubscribe_token, ip_hash from subscribers where lower(email) = ${email} limit 1
    `) as Record<string, unknown>[];

    if (existing[0]) {
      const current = normalizeSubscriberRow(existing[0]);
      const rows = (await sql`
        update subscribers
        set
          archetype = coalesce(${archetype}, archetype),
          source = ${source},
          consent_text = ${consentText},
          consent_version = ${consentVersion},
          consented_at = ${now},
          ip_hash = coalesce(${ipHash}, ip_hash),
          status = case when status = 'confirmed' then 'confirmed' else 'pending' end,
          unsubscribed_at = null
        where id = ${current.id}
        returning id, email, archetype, source, status, consent_text, consent_version, consented_at, confirmed_at, unsubscribed_at, confirm_token, unsubscribe_token, ip_hash
      `) as Record<string, unknown>[];
      const subscriber = normalizeSubscriberRow(rows[0]);
      return {
        subscriber,
        created: false,
        alreadyConfirmed: subscriber.status === "confirmed"
      };
    }

    const rows = (await sql`
      insert into subscribers (email, archetype, source, status, consent_text, consent_version, consented_at, confirm_token, unsubscribe_token, ip_hash)
      values (${email}, ${archetype}, ${source}, 'pending', ${consentText}, ${consentVersion}, ${now}, ${createToken()}, ${createToken()}, ${ipHash})
      on conflict (email) do update set
        archetype = coalesce(excluded.archetype, subscribers.archetype),
        source = excluded.source,
        consent_text = excluded.consent_text,
        consent_version = excluded.consent_version,
        consented_at = excluded.consented_at
      returning id, email, archetype, source, status, consent_text, consent_version, consented_at, confirmed_at, unsubscribed_at, confirm_token, unsubscribe_token, ip_hash
    `) as Record<string, unknown>[];

    return { subscriber: normalizeSubscriberRow(rows[0]), created: true, alreadyConfirmed: false };
  }

  const store = readLocalStore();
  const existingIdx = store.subscribers.findIndex((s) => s.email === email);
  if (existingIdx >= 0) {
    const current = store.subscribers[existingIdx];
    const updated: SubscriberRecord = {
      ...current,
      archetype: archetype ?? current.archetype,
      source,
      consent_text: consentText,
      consent_version: consentVersion,
      consented_at: now,
      ip_hash: ipHash ?? current.ip_hash,
      status: current.status === "confirmed" ? "confirmed" : "pending",
      unsubscribed_at: null
    };
    store.subscribers[existingIdx] = updated;
    writeLocalStore(store);
    return { subscriber: updated, created: false, alreadyConfirmed: updated.status === "confirmed" };
  }

  const created: SubscriberRecord = {
    id: crypto.randomUUID(),
    email,
    archetype,
    source,
    status: "pending",
    consent_text: consentText,
    consent_version: consentVersion,
    consented_at: now,
    confirmed_at: null,
    unsubscribed_at: null,
    confirm_token: createToken(),
    unsubscribe_token: createToken(),
    ip_hash: ipHash
  };
  store.subscribers.unshift(created);
  writeLocalStore(store);
  return { subscriber: created, created: true, alreadyConfirmed: false };
}

export async function getSubscribers(limit?: number): Promise<SubscriberRecord[]> {
  if (sql) {
    try {
      const rows = (await sql`
        select id, email, archetype, source, status, consent_text, consent_version, consented_at, confirmed_at, unsubscribed_at, confirm_token, unsubscribe_token, ip_hash from subscribers order by consented_at desc
      `) as Record<string, unknown>[];
      const mapped = rows.map(normalizeSubscriberRow);
      return typeof limit === "number" ? mapped.slice(0, limit) : mapped;
    } catch (error) {
      console.error("Database query failed in getSubscribers:", error);
    }
  }
  const store = readLocalStore();
  const sorted = [...store.subscribers].sort(
    (a, b) => new Date(b.consented_at).getTime() - new Date(a.consented_at).getTime()
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const subscribers = await getSubscribers();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const archetypeCounts = new Map<string, number>();
  for (const subscriber of subscribers) {
    if (!subscriber.archetype) continue;
    archetypeCounts.set(subscriber.archetype, (archetypeCounts.get(subscriber.archetype) ?? 0) + 1);
  }

  return {
    total: subscribers.length,
    confirmed: subscribers.filter((s) => s.status === "confirmed").length,
    pending: subscribers.filter((s) => s.status === "pending").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    byArchetype: [...archetypeCounts.entries()]
      .map(([archetype, count]) => ({ archetype, count }))
      .sort((a, b) => b.count - a.count),
    last7Days: subscribers.filter((s) => new Date(s.consented_at).getTime() >= sevenDaysAgo).length
  };
}

/** Confirms a double opt-in from the link in the dispatch email. */
export async function confirmSubscriberByToken(
  token: string
): Promise<SubscriberRecord | null> {
  const clean = token.trim();
  if (!clean) return null;

  if (sql) {
    try {
      const rows = (await sql`
        update subscribers
        set status = 'confirmed', confirmed_at = now()
        where confirm_token = ${clean} and status <> 'confirmed'
        returning id, email, archetype, source, status, consent_text, consent_version, consented_at, confirmed_at, unsubscribed_at, confirm_token, unsubscribe_token, ip_hash
      `) as Record<string, unknown>[];
      if (rows[0]) return normalizeSubscriberRow(rows[0]);

      const already = (await sql`
        select id, email, archetype, source, status, consent_text, consent_version, consented_at, confirmed_at, unsubscribed_at, confirm_token, unsubscribe_token, ip_hash from subscribers where confirm_token = ${clean} limit 1
      `) as Record<string, unknown>[];
      return already[0] ? normalizeSubscriberRow(already[0]) : null;
    } catch (error) {
      console.error("Failed confirming subscriber:", error);
      return null;
    }
  }

  const store = readLocalStore();
  const found = store.subscribers.find((s) => s.confirm_token === clean);
  if (!found) return null;
  if (found.status !== "confirmed") {
    found.status = "confirmed";
    found.confirmed_at = new Date().toISOString();
    found.unsubscribed_at = null;
    writeLocalStore(store);
  }
  return found;
}

/** Withdrawal of consent — by token (from an email) or by address (on request). */
export async function unsubscribeSubscriber({
  token,
  email
}: {
  token?: string | null;
  email?: string | null;
}): Promise<SubscriberRecord | null> {
  const cleanToken = token?.trim() || null;
  const cleanEmail = email ? normalizeEmail(email) : null;
  if (!cleanToken && !cleanEmail) return null;
  const now = new Date().toISOString();

  if (sql) {
    try {
      const rows = (cleanToken
        ? await sql`
            update subscribers
            set status = 'unsubscribed', unsubscribed_at = ${now}
            where unsubscribe_token = ${cleanToken}
            returning id, email, archetype, source, status, consent_text, consent_version,
                      consented_at, confirmed_at, unsubscribed_at, confirm_token,
                      unsubscribe_token, ip_hash
          `
        : await sql`
            update subscribers
            set status = 'unsubscribed', unsubscribed_at = ${now}
            where lower(email) = ${cleanEmail}
            returning id, email, archetype, source, status, consent_text, consent_version,
                      consented_at, confirmed_at, unsubscribed_at, confirm_token,
                      unsubscribe_token, ip_hash
          `) as Record<string, unknown>[];
      return rows[0] ? normalizeSubscriberRow(rows[0]) : null;
    } catch (error) {
      console.error("Failed unsubscribing:", error);
      return null;
    }
  }

  const store = readLocalStore();
  const found = store.subscribers.find(
    (s) => (cleanToken ? s.unsubscribe_token === cleanToken : false) || (cleanEmail ? s.email === cleanEmail : false)
  );
  if (!found) return null;
  found.status = "unsubscribed";
  found.unsubscribed_at = now;
  writeLocalStore(store);
  return found;
}

export async function setSubscriberStatus(
  id: string,
  status: SubscriberRecord["status"]
): Promise<void> {
  const now = new Date().toISOString();
  if (sql) {
    await sql`
      update subscribers
      set
        status = ${status},
        confirmed_at = case when ${status} = 'confirmed' then coalesce(confirmed_at, ${now}) else confirmed_at end,
        unsubscribed_at = case when ${status} = 'unsubscribed' then ${now} else null end
      where id = ${id}
    `;
    return;
  }
  const store = readLocalStore();
  const subscriber = store.subscribers.find((s) => s.id === id);
  if (!subscriber) return;
  subscriber.status = status;
  if (status === "confirmed") subscriber.confirmed_at = subscriber.confirmed_at ?? now;
  subscriber.unsubscribed_at = status === "unsubscribed" ? now : null;
  writeLocalStore(store);
}

/** Erasure request — removes the row entirely rather than flagging it. */
export async function deleteSubscriberById(id: string): Promise<void> {
  if (sql) {
    await sql`delete from subscribers where id = ${id}`;
    return;
  }
  const store = readLocalStore();
  store.subscribers = store.subscribers.filter((s) => s.id !== id);
  writeLocalStore(store);
}
