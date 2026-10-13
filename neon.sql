create extension if not exists pgcrypto;

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  cover_image text,
  content_html text,
  meta_title text,
  meta_description text,
  category text default 'style',
  status text default 'draft',
  created_at timestamp default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price int not null,
  gumroad_url text,
  description text,
  what_inside text[]
);

insert into products (name, slug, price, gumroad_url, description, what_inside)
values (
  'The Oxblood Code',
  'the-oxblood-code',
  27,
  '__GUMROAD_URL__',
  'A 78-page dark-romantic wardrobe architecture and seasonal styling system for intentional dressing across the US and UK.',
  array['78 pages PDF','12 outfit formulas','Palette #6E1423','US 0-16 / UK 4-20','Printable checklist']
)
on conflict (slug) do nothing;

create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  merchant text not null,
  url text not null,
  price_us text,
  price_uk text,
  image text,
  clicks int default 0
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null
);

insert into articles (slug, title, excerpt, status, category, meta_title, meta_description, content_html) values
(
  'how-to-dress-like-the-villainess-dark-romance-outfits',
  'How to Dress Like the Villainess: 7 Dark Romance Outfits',
  'The oxblood satin, black lace and velvet formula. 3 budgets for US & UK.',
  'published',
  'style',
  'How to Dress Like the Villainess — 7 Dark Romance Outfits | The Oxblood Edit',
  'Master the oxblood satin, structured wool and black velvet silhouette with 7 intentional formulas across three budgets.',
  '<h2>The Architecture of Restraint</h2><p>True dark romance never relies on costume. It is built on tension: fluid oxblood silk against heavyweight cavalry twill, antique gold hardware against matte jet wool, and silhouettes that command a room without raising their voice.</p><h2>The 3 Key Anchor Pieces</h2><ul><li><strong>The Floor-Sweeping Belted Coat:</strong> Choose double-faced wool in espresso, charcoal, or deep oxblood (#6E1423) with a defined shoulder line.</li><li><strong>The Bias-Cut Satin Slip or Skirt:</strong> Liquid movement balances structured outerwear and transitions seamlessly from dusk to candlelight.</li><li><strong>The Square-Toe Leather Boot:</strong> A sculptural heel in burnished burgundy or black calfskin grounds delicate lace and sheer layers.</li></ul><blockquote><p>&ldquo;Elegance is refusal—knowing which single statement texture belongs in the frame and stripping away the rest.&rdquo;</p></blockquote><h2>Three Budgets for US &amp; UK Wardrobes</h2><p>Whether sourcing heritage British wool on Savile Row, contemporary New York tailoring, or second-hand archival velvet, apply the 70/20/10 rule: 70% matte black or charcoal structure, 20% oxblood depth, and 10% antique gold or luminous skin.</p>'
),
(
  'the-3-piece-british-autumn-formula',
  'The 3-Piece British Autumn Formula: Coat + Knit + Loafers',
  'The coat + knit + loafers tested for US & UK fall.',
  'published',
  'style',
  'The 3-Piece British Autumn Formula: Coat + Knit + Loafers | The Oxblood Edit',
  'A rain-tested British autumn uniform combining tailored outerwear, fine merino knitwear, and oxblood leather loafers.',
  '<h2>Why the Three-Piece Formula Works</h2><p>From London squares in October mist to New England avenues in late November, the most reliable transitional uniform consists of three disciplined pieces: a tailored longline coat, a fine-gauge merino or cashmere turtleneck, and lug-sole or classic horsebit loafers in oxblood leather.</p><h2>1. The Tailored Coat</h2><p>Look for a minimum 75% wool composition with a Raglan or sharp set-in sleeve. Hemlines falling mid-calf elongate the frame and protect silk or wool trousers from autumn rain.</p><h2>2. The Fine-Gauge Knit</h2><p>Charcoal, espresso, orink-black merino worn close to the collar bone frames gold jewelry and structured lapels without bulk.</p><h2>3. The Oxblood Loafer</h2><p>Cordovan or oxblood leather acts as a neutral while adding warmth against slate pavements. Pair with sheer black hosiery or ribbed cashmere socks.</p>'
),
(
  'vamp-romantic-capsule-wardrobe',
  'The 12-Piece Vamp Romantic Capsule Wardrobe',
  '12 pieces for Fall/Winter 2026. Links to The Oxblood Code.',
  'published',
  'capsule',
  'The 12-Piece Vamp Romantic Capsule Wardrobe (Fall/Winter 2026)',
  'Build 36 cohesive dark-romantic outfits from 12 foundational garments in oxblood, jet black, and parchment cream.',
  '<h2>12 Pieces, 36 Evening-to-Day Combinations</h2><p>A capsule wardrobe succeeds when every garment shares a disciplined chromatic spine. In <em>The Oxblood Code</em>, we anchor the season around four tones: Jet (#0B0A08), Oxblood (#6E1423), Parchment Cream (#EDE4D0), and Antique Gold (#C6A15B).</p><h3>The Outerwear &amp; Tailoring</h3><ul><li>Double-breasted black wool maxi coat</li><li>Velvet evening blazer in deep wine</li><li>High-waisted pleated wide-leg wool trousers</li></ul><h3>The Silk &amp; Knit Layers</h3><ul><li>Ivory silk poet blouse with subtle cuff detailing</li><li>Fine black merino turtleneck</li><li>Oxblood bias-cut midi skirt</li><li>Black Chantilly-trimmed silk camisole</li><li>Structured corset-seamed midi dress</li></ul><h3>The Footwear &amp; Finishing Accents</h3><ul><li>Oxblood leather loafers</li><li>Sculptural stiletto ankle boots</li><li>Gold signet hardware belt</li><li>Structured croc-embossed top-handle bag</li></ul>'
),
(
  'smudged-kohl-oxblood-lips-tutorial',
  'Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial',
  'US & UK products tutorial.',
  'published',
  'beauty',
  'Smudged Kohl & Oxblood Lips Tutorial | The Oxblood Edit',
  'Achieve lived-in kohl liner and velvet-matte oxblood lips with luminous satin skin.',
  '<h2>The Rule of Velvet Skin and Lived-In Pigment</h2><p>When wearing a deep wine lip (#6E1423), heavy foundation immediately ages the look. Keep the complexion sheer and satin-finished so the contrast between skin and pigment feels effortless.</p><h2>Step 1: Soft-Focus Kohl</h2><p>Trace a creamy espresso or carbon kohl pencil along the upper tightline and outer third of the lower lash line, then diffuse with a dense smudger brush before it sets.</p><h2>Step 2: The Stained Oxblood Lip</h2><p>Press a burgundy matte lipstick into the center of the lips with your ring finger first, then define the Cupid&rsquo;s bow with a sharpened plum-brown liner for structure without harshness.</p>'
),
(
  'dark-elegance-dining-room-ideas',
  '7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight',
  'Dark-elegance home decor inspiration.',
  'draft',
  'interiors',
  '7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight',
  'Transform your dining space with oxblood limewash walls, unlacquered brass candlesticks, and Belgian linen.',
  '<h2>Designing for Candlelight</h2><p>Dining rooms are used primarily after sundown; painting them stark white fights their natural atmosphere. Embracing deep oxblood, smoked oak, and unlacquered brass turns every dinner into an intimate salon.</p><ul><li>Limewash walls in muted burgundy or aubergine</li><li>Unlacquered brass taper holders at staggered heights</li><li>Unbleached parchment linen table runners</li></ul>'
)
on conflict (slug) do nothing;
