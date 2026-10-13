import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";
import { sanitizeEditorialHtml, slugify } from "@/lib/sanitize";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

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

interface LocalStoreData {
  articles: ArticleRecord[];
  products: ProductRecord[];
  affiliate_links: AffiliateLinkRecord[];
}

const DEFAULT_SEED_DATA: LocalStoreData = {
  articles: [
    {
      id: "a1000000-0000-4000-8000-000000000001",
      slug: "how-to-dress-like-the-villainess-dark-romance-outfits",
      title: "How to Dress Like the Villainess: 7 Dark Romance Outfits",
      excerpt: "The oxblood satin, black lace and velvet formula. 3 budgets for US & UK.",
      cover_image: null,
      content_html:
        "<h2>The Architecture of Restraint</h2><p>True dark romance never relies on costume. It is built on tension: fluid oxblood silk against heavyweight cavalry twill, antique gold hardware against matte jet wool, and silhouettes that command a room without raising their voice.</p><h2>The 3 Key Anchor Pieces</h2><ul><li><strong>The Floor-Sweeping Belted Coat:</strong> Choose double-faced wool in espresso, charcoal, or deep oxblood (#6E1423) with a defined shoulder line.</li><li><strong>The Bias-Cut Satin Slip or Skirt:</strong> Liquid movement balances structured outerwear and transitions seamlessly from dusk to candlelight.</li><li><strong>The Square-Toe Leather Boot:</strong> A sculptural heel in burnished burgundy or black calfskin grounds delicate lace and sheer layers.</li></ul><blockquote><p>&ldquo;Elegance is refusal—knowing which single statement texture belongs in the frame and stripping away the rest.&rdquo;</p></blockquote><h2>Three Budgets for US &amp; UK Wardrobes</h2><p>Whether sourcing heritage British wool on Savile Row, contemporary New York tailoring, or second-hand archival velvet, apply the 70/20/10 rule: 70% matte black or charcoal structure, 20% oxblood depth, and 10% antique gold or luminous skin.</p>",
      meta_title: "How to Dress Like the Villainess — 7 Dark Romance Outfits | The Oxblood Edit",
      meta_description:
        "Master the oxblood satin, structured wool and black velvet silhouette with 7 intentional formulas across three budgets.",
      category: "style",
      status: "published",
      created_at: "2026-10-10T18:00:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000002",
      slug: "the-3-piece-british-autumn-formula",
      title: "The 3-Piece British Autumn Formula: Coat + Knit + Loafers",
      excerpt: "The coat + knit + loafers tested for US & UK fall.",
      cover_image: null,
      content_html:
        "<h2>Why the Three-Piece Formula Works</h2><p>From London squares in October mist to New England avenues in late November, the most reliable transitional uniform consists of three disciplined pieces: a tailored longline coat, a fine-gauge merino or cashmere turtleneck, and lug-sole or classic horsebit loafers in oxblood leather.</p><h2>1. The Tailored Coat</h2><p>Look for a minimum 75% wool composition with a Raglan or sharp set-in sleeve. Hemlines falling mid-calf elongate the frame and protect silk or wool trousers from autumn rain.</p><h2>2. The Fine-Gauge Knit</h2><p>Charcoal, espresso, or ink-black merino worn close to the collar bone frames gold jewelry and structured lapels without bulk.</p><h2>3. The Oxblood Loafer</h2><p>Cordovan or oxblood leather acts as a neutral while adding warmth against slate pavements. Pair with sheer black hosiery or ribbed cashmere socks.</p>",
      meta_title: "The 3-Piece British Autumn Formula: Coat + Knit + Loafers | The Oxblood Edit",
      meta_description:
        "A rain-tested British autumn uniform combining tailored outerwear, fine merino knitwear, and oxblood leather loafers.",
      category: "style",
      status: "published",
      created_at: "2026-10-11T14:30:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000003",
      slug: "vamp-romantic-capsule-wardrobe",
      title: "The 12-Piece Vamp Romantic Capsule Wardrobe",
      excerpt: "12 pieces for Fall/Winter 2026. Links to The Oxblood Code.",
      cover_image: null,
      content_html:
        "<h2>12 Pieces, 36 Evening-to-Day Combinations</h2><p>A capsule wardrobe succeeds when every garment shares a disciplined chromatic spine. In <em>The Oxblood Code</em>, we anchor the season around four tones: Jet (#0B0A08), Oxblood (#6E1423), Parchment Cream (#EDE4D0), and Antique Gold (#C6A15B).</p><h3>The Outerwear &amp; Tailoring</h3><ul><li>Double-breasted black wool maxi coat</li><li>Velvet evening blazer in deep wine</li><li>High-waisted pleated wide-leg wool trousers</li></ul><h3>The Silk &amp; Knit Layers</h3><ul><li>Ivory silk poet blouse with subtle cuff detailing</li><li>Fine black merino turtleneck</li><li>Oxblood bias-cut midi skirt</li><li>Black Chantilly-trimmed silk camisole</li><li>Structured corset-seamed midi dress</li></ul><h3>The Footwear &amp; Finishing Accents</h3><ul><li>Oxblood leather loafers</li><li>Sculptural stiletto ankle boots</li><li>Gold signet hardware belt</li><li>Structured croc-embossed top-handle bag</li></ul>",
      meta_title: "The 12-Piece Vamp Romantic Capsule Wardrobe (Fall/Winter 2026)",
      meta_description:
        "Build 36 cohesive dark-romantic outfits from 12 foundational garments in oxblood, jet black, and parchment cream.",
      category: "capsule",
      status: "published",
      created_at: "2026-10-12T10:15:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000004",
      slug: "smudged-kohl-oxblood-lips-tutorial",
      title: "Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial",
      excerpt: "US & UK products tutorial.",
      cover_image: null,
      content_html:
        "<h2>The Rule of Velvet Skin and Lived-In Pigment</h2><p>When wearing a deep wine lip (#6E1423), heavy foundation immediately ages the look. Keep the complexion sheer and satin-finished so the contrast between skin and pigment feels effortless.</p><h2>Step 1: Soft-Focus Kohl</h2><p>Trace a creamy espresso or carbon kohl pencil along the upper tightline and outer third of the lower lash line, then diffuse with a dense smudger brush before it sets.</p><h2>Step 2: The Stained Oxblood Lip</h2><p>Press a burgundy matte lipstick into the center of the lips with your ring finger first, then define the Cupid&rsquo;s bow with a sharpened plum-brown liner for structure without harshness.</p>",
      meta_title: "Smudged Kohl & Oxblood Lips Tutorial | The Oxblood Edit",
      meta_description:
        "Achieve lived-in kohl liner and velvet-matte oxblood lips with luminous satin skin.",
      category: "beauty",
      status: "published",
      created_at: "2026-10-13T09:00:00.000Z"
    },
    {
      id: "a1000000-0000-4000-8000-000000000005",
      slug: "dark-elegance-dining-room-ideas",
      title: "7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight",
      excerpt: "Dark-elegance home decor inspiration.",
      cover_image: null,
      content_html:
        "<h2>Designing for Candlelight</h2><p>Dining rooms are used primarily after sundown; painting them stark white fights their natural atmosphere. Embracing deep oxblood, smoked oak, and unlacquered brass turns every dinner into an intimate salon.</p><ul><li>Limewash walls in muted burgundy or aubergine</li><li>Unlacquered brass taper holders at staggered heights</li><li>Unbleached parchment linen table runners</li></ul>",
      meta_title: "7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight",
      meta_description:
        "Transform your dining space with oxblood limewash walls, unlacquered brass candlesticks, and Belgian linen.",
      category: "interiors",
      status: "draft",
      created_at: "2026-10-13T16:00:00.000Z"
    }
  ],
  products: [
    {
      id: "b1000000-0000-4000-8000-000000000001",
      name: "The Oxblood Code",
      slug: "the-oxblood-code",
      price: 27,
      gumroad_url: "__GUMROAD_URL__",
      description:
        "A 78-page dark-romantic wardrobe architecture and seasonal styling system for intentional dressing across the US and UK.",
      what_inside: [
        "78 pages PDF",
        "12 outfit formulas",
        "Palette #6E1423",
        "US 0-16 / UK 4-20",
        "Printable checklist"
      ]
    }
  ],
  affiliate_links: [
    {
      id: "c1000000-0000-4000-8000-000000000001",
      name: "Double-Faced Wool Belted Coat in Deep Oxblood",
      merchant: "Net-a-Porter / Selfridges",
      url: "https://www.net-a-porter.com/",
      price_us: "$690",
      price_uk: "£560",
      image: null,
      clicks: 18
    },
    {
      id: "c1000000-0000-4000-8000-000000000002",
      name: "Bias-Cut Heavy Silk Satin Midi Skirt",
      merchant: "Reformation",
      url: "https://www.thereformation.com/",
      price_us: "$298",
      price_uk: "£248",
      image: null,
      clicks: 24
    },
    {
      id: "c1000000-0000-4000-8000-000000000003",
      name: "Burnished Cordovan Leather Horsebit Loafers",
      merchant: "Russell & Bromley",
      url: "https://www.russellandbromley.co.uk/",
      price_us: "$345",
      price_uk: "£275",
      image: null,
      clicks: 12
    }
  ]
};

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "local-store.json");

function readLocalStore(): LocalStoreData {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
      return {
        articles: Array.isArray(parsed.articles) ? parsed.articles : DEFAULT_SEED_DATA.articles,
        products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_SEED_DATA.products,
        affiliate_links: Array.isArray(parsed.affiliate_links)
          ? parsed.affiliate_links
          : DEFAULT_SEED_DATA.affiliate_links
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
    category: String(row.category ?? "style"),
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
      return rows.map((r) => normalizeArticleRow(r as Record<string, unknown>));
    } catch (error) {
      console.error("Database query failed in getPublishedArticles:", error);
    }
  }
  const store = readLocalStore();
  const published = store.articles
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return typeof limit === "number" ? published.slice(0, limit) : published;
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
      return normalizeArticleRow(rows[0] as Record<string, unknown>);
    } catch (error) {
      console.error("Database query failed in getArticleBySlug:", error);
      return null;
    }
  }
  const store = readLocalStore();
  const found = store.articles.find(
    (a) => a.slug === slug && (includeDrafts || a.status === "published")
  );
  return found ?? null;
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
  const category = input.category?.trim() || "style";
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

export async function getProductBySlug(slug = "the-oxblood-code"): Promise<ProductRecord | null> {
  if (sql) {
    try {
      const rows = await sql`
        select id, name, slug, price, gumroad_url, description, what_inside
        from products
        where slug = ${slug}
        limit 1
      `;
      if (rows[0]) return normalizeProductRow(rows[0] as Record<string, unknown>);
      return null;
    } catch (error) {
      console.error("Database query failed in getProductBySlug:", error);
    }
  }
  const store = readLocalStore();
  return store.products.find((p) => p.slug === slug) ?? store.products[0] ?? null;
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
  const slug = slugify(input.slug || "the-oxblood-code") || "the-oxblood-code";
  const name = input.name.trim() || "The Oxblood Code";
  const price = Number.isFinite(input.price) && input.price >= 0 ? Math.round(input.price) : 27;
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
