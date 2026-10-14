-- ============================================================================
-- THE OXBLOOD EDIT — Dark Elegance schema + editorial seed (Neon / PostgreSQL)
-- Run this whole file in the Neon SQL Editor. Safe to re-run: the seed uses
-- "on conflict (slug) do nothing", and the trailing backfill updates repair any
-- rows created before the 16:9 Dark Elegance branding landed.
--
-- What lives here, in order:
--   1. articles / products / affiliate_links / users / subscribers
--   2. the nine pillar stories of the editorial run (UK, US and both) with
--      16:9 covers and in-body plates, staggered one per week
--   3. a one-off schedule correction: every pillar pinned to a house section
--      (style, capsule, beauty, interiors, craft) and to its staggered date
--   4. a legacy backfill: covers, plates, meta title and meta description
-- ============================================================================

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
)on conflict (slug) do nothing;

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

-- Curated affiliate edit — only seeded when the table is still empty, so this
-- file can be re-run against a live database without duplicating pieces.
insert into affiliate_links (name, merchant, url, price_us, price_uk)
select v.name, v.merchant, v.url, v.price_us, v.price_uk
from (values
  ('Double-Faced Wool Belted Coat in Deep Oxblood', 'Net-a-Porter / Selfridges', 'https://www.net-a-porter.com/', '$690', '£560'),
  ('Bias-Cut Heavy Silk Satin Midi Skirt', 'Reformation', 'https://www.thereformation.com/', '$298', '£248'),
  ('Burnished Cordovan Leather Horsebit Loafers', 'Russell & Bromley', 'https://www.russellandbromley.co.uk/', '$345', '£275')
) as v(name, merchant, url, price_us, price_uk)
where not exists (select 1 from affiliate_links);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null
);

-- ----------------------------------------------------------------------------
-- Newsletter subscribers — one row per consent, not per address.
--
-- consent_text / consent_version / consented_at are the UK GDPR Article 7(1)
-- evidence (what the reader agreed to, in which wording, when, and from which
-- surface); unsubscribed_at keeps the withdrawal on record so the desk can show
-- it stopped writing. Nothing is ever seeded here: an invented address would be
-- a fabricated consent record.
-- ----------------------------------------------------------------------------
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  archetype text,
  source text default 'unknown',
  status text default 'pending',
  consent_text text,
  consent_version text,
  consented_at timestamp default now(),
  confirmed_at timestamp,
  unsubscribed_at timestamp,
  confirm_token text unique,
  unsubscribe_token text unique,
  ip_hash text
);

create index if not exists subscribers_status_idx on subscribers (status);
create index if not exists subscribers_consented_at_idx on subscribers (consented_at desc);

-- ----------------------------------------------------------------------------
-- Editorial seed — every story carries a strict 16:9 cover (public/images/
-- editorial/*-16x9.jpg) plus 1–2 in-body 16:9 plates rendered as
-- <figure><img … /><figcaption>PLATE I · …</figcaption></figure>.
-- ----------------------------------------------------------------------------
insert into articles (slug, title, excerpt, cover_image, status, category, meta_title, meta_description, content_html) values
(
  'how-to-dress-like-the-villainess-dark-romance-outfits',
  'How to Dress Like the Villainess: 7 Dark Romance Outfits',
  'The oxblood satin, black lace and velvet formula. 3 budgets for US & UK.',
  '/images/editorial/villainess-hero-16x9.jpg',
  'published',
  'style',
  'How to Dress Like the Villainess — 7 Dark Romance Outfits | The Oxblood Edit',
  'Master the oxblood satin, structured wool and black velvet silhouette with 7 intentional formulas across three budgets.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/villainess-hero-16x9.jpg" alt="A woman seen from behind in a floor-length black velvet cape lined with oxblood satin, standing in a candlelit Georgian gallery" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · The long gallery, nine o''clock. Velvet cut to the floor, oxblood satin lining let slip one inch past the hem</figcaption></figure>
        <h2>The Architecture of Restraint</h2><p>True dark romance never relies on costume. It is built on tension: fluid oxblood silk against heavyweight cavalry twill, antique gold hardware against matte jet wool, and silhouettes that command a room without raising their voice.</p><h2>The 3 Key Anchor Pieces</h2><ul><li><strong>The Floor-Sweeping Belted Coat:</strong> Choose double-faced wool in espresso, charcoal, or deep oxblood (#6E1423) with a defined shoulder line.</li><li><strong>The Bias-Cut Satin Slip or Skirt:</strong> Liquid movement balances structured outerwear and transitions seamlessly from dusk to candlelight.</li><li><strong>The Square-Toe Leather Boot:</strong> A sculptural heel in burnished burgundy or black calfskin grounds delicate lace and sheer layers.</li></ul><blockquote><p>&ldquo;Elegance is refusal&mdash;knowing which single statement texture belongs in the frame and stripping away the rest.&rdquo;</p></blockquote><figure class="plate plate--2 aspect-video"><img src="/images/editorial/villainess-detail-16x9.jpg" alt="Detail of oxblood silk satin against black chantilly lace with an antique gold signet ring resting on the fabric" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · The three anchor textures: bias-cut oxblood satin, Chantilly lace, antique gold hardware worn matte</figcaption></figure><h2>Seven Formulas, One Spine</h2><ol><li><strong>The Nine O&rsquo;Clock Exit:</strong> Jet velvet cape, oxblood satin column, gold signet at the cuff.</li><li><strong>The Reading Room:</strong> Ink merino turtleneck, ivory poet blouse left open one button, charcoal pleated trouser.</li><li><strong>The Uninvited Guest:</strong> Wine velvet blazer over a black Chantilly camisole.</li><li><strong>Rain on a London Square:</strong> Beltless cavalry coat, cordovan horsebit loafer, sheer black hosiery.</li><li><strong>The Long Supper:</strong> Bias-cut midi in dried wine, bare shoulder, one brass ring.</li><li><strong>Second Hand, First Rate:</strong> Archival velvet taken in at the shoulder, never at the hem.</li><li><strong>The Verdict:</strong> Parchment silk at the throat against an all-black column&mdash;the only brightness permitted.</li></ol><h2>Three Budgets for US &amp; UK Wardrobes</h2><p>Whether sourcing heritage British wool on Savile Row, contemporary New York tailoring, or second-hand archival velvet, apply the 70/20/10 rule: 70% matte black or charcoal structure, 20% oxblood depth, and 10% antique gold or luminous skin.</p>'
),
(
  'the-3-piece-british-autumn-formula',
  'The 3-Piece British Autumn Formula: Coat + Knit + Loafers',
  'The coat + knit + loafers tested for US & UK fall.',
  '/images/editorial/british-autumn-16x9.jpg',
  'published',
  'style',
  'The 3-Piece British Autumn Formula: Coat + Knit + Loafers | The Oxblood Edit',
  'A rain-tested British autumn uniform combining tailored outerwear, fine merino knitwear, and oxblood leather loafers.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/british-autumn-16x9.jpg" alt="A woman in a longline charcoal wool coat and oxblood loafers crossing wet slate paving in an autumn London square" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · London, late October. The longline coat, the fine merino neck, the oxblood horsebit — three pieces, no fourth</figcaption></figure>
        <h2>Why the Three-Piece Formula Works</h2><p>From London squares in October mist to New England avenues in late November, the most reliable transitional uniform consists of three disciplined pieces: a tailored longline coat, a fine-gauge merino or cashmere turtleneck, and lug-sole or classic horsebit loafers in oxblood leather.</p><h2>1. The Tailored Coat</h2><p>Look for a minimum 75% wool composition with a Raglan or sharp set-in sleeve. Hemlines falling mid-calf elongate the frame and protect silk or wool trousers from autumn rain.</p><h2>2. The Fine-Gauge Knit</h2><p>Charcoal, espresso, or ink-black merino worn close to the collar bone frames gold jewelry and structured lapels without bulk.</p><h2>3. The Oxblood Loafer</h2><p>Cordovan or oxblood leather acts as a neutral while adding warmth against slate pavements. Pair with sheer black hosiery or ribbed cashmere socks.</p><figure class="plate plate--2 aspect-video"><img src="/images/editorial/british-layers-16x9.jpg" alt="Layered black wool cape over a merino turtleneck and ivory silk blouse with oxblood leather gloves and an antique gold brooch" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · The layering test, read at the wrist: matte wool, fine gauge knit, liquid silk, one brass fastening</figcaption></figure><p>Three pieces is not a limitation; it is a rehearsal. Repeat the formula until it stops looking chosen and starts looking inevitable.</p>'
),
(
  'vamp-romantic-capsule-wardrobe',
  'The 12-Piece Vamp Romantic Capsule Wardrobe',
  '12 pieces for Fall/Winter 2026. Links to The Oxblood Code.',
  '/images/editorial/capsule-wardrobe-16x9.jpg',
  'published',
  'capsule',
  'The 12-Piece Vamp Romantic Capsule Wardrobe (Fall/Winter 2026)',
  'Build 36 cohesive dark-romantic outfits from 12 foundational garments in oxblood, jet black, and parchment cream.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/capsule-wardrobe-16x9.jpg" alt="Twelve curated garments in jet black wool, oxblood velvet and ivory silk on an antique valet stand in a candlelit panelled room" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Twelve pieces on one stand: the chromatic spine is jet, oxblood, parchment and antique gold</figcaption></figure>
        <h2>12 Pieces, 36 Evening-to-Day Combinations</h2><p>A capsule wardrobe succeeds when every garment shares a disciplined chromatic spine. In <em>The Oxblood Code</em>, we anchor the season around four tones: Jet (#0B0A08), Oxblood (#6E1423), Parchment Cream (#EDE4D0), and Antique Gold (#C6A15B).</p><h3>The Outerwear &amp; Tailoring</h3><ul><li>Double-breasted black wool maxi coat</li><li>Velvet evening blazer in deep wine</li><li>High-waisted pleated wide-leg wool trousers</li></ul><h3>The Silk &amp; Knit Layers</h3><ul><li>Ivory silk poet blouse with subtle cuff detailing</li><li>Fine black merino turtleneck</li><li>Oxblood bias-cut midi skirt</li><li>Black Chantilly-trimmed silk camisole</li><li>Structured corset-seamed midi dress</li></ul><figure class="plate plate--2 aspect-video"><img src="/images/editorial/fibre-label-atelier-16x9.jpg" alt="A heritage tailoring atelier with bolts of double-faced wool, cashmere and silk, shears and tape on a worn oak bench" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · Inside the label: 75% wool minimum, 320gsm and up, and a lining dyed to the same oxblood</figcaption></figure><h3>The Footwear &amp; Finishing Accents</h3><ul><li>Oxblood leather loafers</li><li>Sculptural stiletto ankle boots</li><li>Gold signet hardware belt</li><li>Structured croc-embossed top-handle bag</li></ul><p>Twelve garments, thirty-six combinations, one palette: the arithmetic is the entire point of a capsule.</p>'
),
(
  'smudged-kohl-oxblood-lips-tutorial',
  'Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial',
  'US & UK products tutorial.',
  '/images/editorial/beauty-kohl-lips-16x9.jpg',
  'published',
  'beauty',
  'Smudged Kohl & Oxblood Lips Tutorial | The Oxblood Edit',
  'Achieve lived-in kohl liner and velvet-matte oxblood lips with luminous satin skin.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/beauty-kohl-lips-16x9.jpg" alt="Close-up of smudged charcoal kohl eyes and velvet-matte oxblood lips lit by a single candle flame" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Kohl on the tightline only; the lip pressed in with a fingertip and left unlined</figcaption></figure>
        <h2>The Rule of Velvet Skin and Lived-In Pigment</h2><p>When wearing a deep wine lip (#6E1423), heavy foundation immediately ages the look. Keep the complexion sheer and satin-finished so the contrast between skin and pigment feels effortless.</p><h2>Step 1: Soft-Focus Kohl</h2><p>Trace a creamy espresso or carbon kohl pencil along the upper tightline and outer third of the lower lash line, then diffuse with a dense smudger brush before it sets.</p><h2>Step 2: The Stained Oxblood Lip</h2><p>Press a burgundy matte lipstick into the center of the lips with your ring finger first, then define the Cupid&rsquo;s bow with a sharpened plum-brown liner for structure without harshness.</p><h2>Step 3: What You Leave Out</h2><p>No contour, no cut crease, no highlighter above the cheekbone. One candlelit face should read as a face that has just put a book down.</p>'
),
(
  'dark-elegance-dining-room-ideas',
  '7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight',
  'Dark-elegance home decor inspiration.',
  '/images/editorial/dining-room-interiors-16x9.jpg',
  'draft',
  'interiors',
  '7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight',
  'Transform your dining space with oxblood limewash walls, unlacquered brass candlesticks, and Belgian linen.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/dining-room-interiors-16x9.jpg" alt="A dark dining room with oxblood limewashed walls, a smoked oak table, brass taper candlesticks and parchment linen" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Dining after sundown: oxblood limewash, smoked oak, unlacquered brass at staggered heights</figcaption></figure>
        <h2>Designing for Candlelight</h2><p>Dining rooms are used primarily after sundown; painting them stark white fights their natural atmosphere. Embracing deep oxblood, smoked oak, and unlacquered brass turns every dinner into an intimate salon.</p><ul><li>Limewash walls in muted burgundy or aubergine</li><li>Unlacquered brass taper holders at staggered heights</li><li>Unbleached parchment linen table runners</li><li>Black velvet chair backs that swallow the light</li><li>One mirrored sideboard, angled at the window</li><li>Heavy tapers only&mdash;never votives in glass</li><li>A single dried branch, no bouquet</li></ul><p>Seven decisions, one atmosphere: a room that flatters a face at ten at night.</p>'
),
(
  'the-british-layering-code-wool-merino-silk',
  'The British Layering Code: Wool, Merino, Silk — In That Order',
  'Four textures, three temperatures, zero visual noise.',
  '/images/editorial/british-layers-16x9.jpg',
  'published',
  'style',
  'The British Layering Code: Wool, Merino, Silk | The Oxblood Edit',
  'The silk-merino-wool sequence that survives a British autumn and reads as intent in a New York winter.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/british-layers-16x9.jpg" alt="Layered black wool cape over a merino turtleneck and ivory silk blouse with oxblood leather gloves and an antique gold brooch" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · The layering test, read at the wrist: matte wool, fine gauge knit, liquid silk, one brass fastening</figcaption></figure>
        <h2>The Order Is the Outfit</h2><p>Layering fails in Britain not from a shortage of cold but from a surplus of ambition. The code is sequential: silk against the skin for slip, merino for trapped air, wool for weather. Anything heavier goes outside, never between.</p><h2>Reading a Room by Its Shoulders</h2><ul><li><strong>Shoulder line:</strong> keep it unpadded and let the coat do the architecture.</li><li><strong>Collar gap:</strong> one finger between throat and knit; two if a ribbon is intended.</li><li><strong>Hem cascade:</strong> each layer ends at a different inch, never within two of its neighbour.</li></ul><figure class="plate plate--2 aspect-video"><img src="/images/editorial/british-autumn-16x9.jpg" alt="A woman in a longline charcoal wool coat and oxblood loafers crossing wet slate paving in an autumn London square" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · London, late October. The longline coat, the fine merino neck, the oxblood horsebit — three pieces, no fourth</figcaption></figure><h2>Manchester to Manhattan</h2><p>At 6&deg;C and wet, the three-piece carries a full day. At 14&deg;C indoors, the silk and merino alone are the outfit&mdash;which is precisely what makes the formula worth the money.</p>'
),
(
  'reading-the-fibre-label-in-a-dark-atelier',
  'Reading the Fibre Label in a Dark Atelier',
  'GSM, wool percentage, lining dyed to match: audit a garment before you buy it.',
  '/images/editorial/fibre-label-atelier-16x9.jpg',
  'published',
  'craft',
  'Reading the Fibre Label in a Dark Atelier | The Oxblood Edit',
  'How to audit wool percentage, GSM, lining and hardware before committing to a dark-romantic garment.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/fibre-label-atelier-16x9.jpg" alt="A heritage tailoring atelier with bolts of double-faced wool, cashmere and silk, shears and tape on a worn oak bench" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Inside the label: 75% wool minimum, 320gsm and up, and a lining dyed to the same oxblood</figcaption></figure>
        <h2>Four Numbers Before Any Silhouette</h2><p>A dark-romantic wardrobe is bought with a calculator as much as an eye. Wool percentage, fabric weight in grams per square metre, lining composition, and the ratio of buttons to buttonholes will tell you more than a photograph ever will.</p><ul><li><strong>75% wool minimum</strong> in outerwear; below that, rain wins.</li><li><strong>320gsm and above</strong> for a coat that holds a line without interfacing.</li><li><strong>Viscose or cotton lining</strong> dyed to the shell, never contrast polyester.</li><li><strong>Horn or corozo buttons</strong>; plastic shines, and shine is the enemy of velvet.</li></ul><h2>The Candlelight Test</h2><p>Take the garment into a dim room before you decide anything. Dark elegance is engineered for low light: if the cloth goes flat beside a candle, it was bought for the shop floor.</p>'
)
on conflict (slug) do nothing;
-- ----------------------------------------------------------------------------
-- Pillars VIII and IX: the US tail of the editorial run and the fit file that
-- maps one oxblood formula across US 0-16 and UK 4-20. Both carry a strict 16:9
-- cover plus in-body plates, exactly as the seven stories above do.
-- ----------------------------------------------------------------------------
insert into articles (slug, title, excerpt, cover_image, status, category, meta_title, meta_description, content_html, created_at) values
(
  'the-us-oxblood-edit-american-autumn-tailoring',
  'The US Oxblood Edit: American Autumn Tailoring in Three Budgets',
  'Overheated rooms, sharp sidewalks: the US autumn edit in three budgets.',
  '/images/editorial/villainess-hero-16x9.jpg',
  'published',
  'style',
  'The US Oxblood Edit: American Autumn Tailoring in Three Budgets',
  'How to build a US autumn wardrobe that survives heated interiors and a cold sidewalk: coat weights, knit gauges and three transparent budgets.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/villainess-hero-16x9.jpg" alt="A woman seen from behind in a floor-length black velvet cape lined with oxblood satin, standing in a candlelit Georgian gallery" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · The long gallery, nine o''clock. Velvet cut to the floor, oxblood satin lining let slip one inch past the hem</figcaption></figure><h2>Two Climates, One Coat</h2><p>An American autumn is not a British one with a different flag. It is overheated interiors against a sharp evening drop: a wardrobe that has to survive 24&deg;C at two in the afternoon and 9&deg;C on the sidewalk at ten, without a change of clothes. The house answer is still the three-piece spine&mdash;coat, knit, shoe&mdash;weighted differently.</p><h2>1. The Coat, Built to Be Taken Off</h2><p>Choose double-faced wool in the 420&ndash;480gsm band rather than the 520gsm British coat. Above that weight an American autumn coat becomes a taxi coat; below 400gsm it stops holding a shoulder line in a cold wind. Espresso, charcoal, or oxblood #6E1423.</p><h2>2. The Knit: The Variable Nobody Prices</h2><p>Air conditioning is the American variable. A fine-gauge merino turtleneck under a blazer is the layer that comes off and still reads as intentional at the table; a chunky knit under the same blazer reads as luggage.</p><h2>3. The Shoe: Leather Against Granite</h2><p>Oxblood leather takes a New York pavement the way it takes a London square, with one amendment: a 25mm lug sole for the November ice, and no more&mdash;past 40mm a lugged sole stops being a loafer and starts being equipment.</p><figure class="plate plate--2 aspect-video"><img src="/images/editorial/capsule-wardrobe-16x9.jpg" alt="Twelve curated garments in jet black wool, oxblood velvet and ivory silk on an antique valet stand in a candlelit panelled room" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · Twelve pieces on one stand: the chromatic spine is jet, oxblood, parchment and antique gold</figcaption></figure><h2>Three Budgets, One Spine</h2><ul><li><strong>Under $250:</strong> a single 80% wool coat taken to a tailor for the shoulder. Sixty dollars of alteration beats four hundred dollars of fabric.</li><li><strong>$250&ndash;$800:</strong> the mid-tier coat, one merino turtleneck, one corrected-grain oxblood loafer.</li><li><strong>Investment:</strong> 460gsm double-faced wool with a hand-finished hem, and a cordovan loafer you resole rather than replace.</li></ul><p>Three pieces, two climates, one chromatic spine. Only the weight changes with the flag&mdash;never the arithmetic.</p>',
  '2026-10-12 07:30:00'
),
(
  'the-fit-file-us-0-16-uk-4-20',
  'The Fit File: The Same Oxblood Formula in US 0–16 and UK 4–20',
  'Flat-measured garment data for one formula, US 0–16 against UK 4–20.',
  '/images/editorial/fibre-label-atelier-16x9.jpg',
  'published',
  'craft',
  'The Fit File: US 0–16 and UK 4–20 in the Same Oxblood Formula',
  'Flat-measured garment data, a US 0–16 to UK 4–20 fit file, and the four places the same oxblood formula is cut differently between markets.',
  '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/fibre-label-atelier-16x9.jpg" alt="A heritage tailoring atelier with bolts of double-faced wool, cashmere and silk, shears and tape on a worn oak bench" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Inside the label: 75% wool minimum, 320gsm and up, and a lining dyed to the same oxblood</figcaption></figure><h2>The +4 Rule, and Why It Is Not Enough</h2><p>A US 6 is a UK 10&mdash;an offset of four that gets a reader onto the right rack and then abandons her there. Two houses producing the same nominal UK 10 will still differ by three centimetres at the waist and six at the sleeve, because a size label is a marketing decision and a measurement is not.</p><h2>The Fit File, Flat-Measured</h2><table><thead><tr><th>Garment</th><th>US</th><th>UK</th><th>Bust / chest</th><th>Waist</th><th>Hip</th></tr></thead><tbody><tr><td>Bias satin midi</td><td>0&ndash;2</td><td>4&ndash;6</td><td>81 cm / 31.9 in</td><td>63 cm / 24.8 in</td><td>89 cm / 35.0 in</td></tr><tr><td>Bias satin midi</td><td>4&ndash;6</td><td>8&ndash;10</td><td>88 cm / 34.6 in</td><td>70 cm / 27.6 in</td><td>96 cm / 37.8 in</td></tr><tr><td>Bias satin midi</td><td>8&ndash;10</td><td>12&ndash;14</td><td>95 cm / 37.4 in</td><td>77 cm / 30.3 in</td><td>103 cm / 40.6 in</td></tr><tr><td>Bias satin midi</td><td>12&ndash;14</td><td>16&ndash;18</td><td>104 cm / 40.9 in</td><td>86 cm / 33.9 in</td><td>112 cm / 44.1 in</td></tr><tr><td>Bias satin midi</td><td>16</td><td>20</td><td>112 cm / 44.1 in</td><td>94 cm / 37.0 in</td><td>120 cm / 47.2 in</td></tr><tr><td>Double-faced coat</td><td>4&ndash;6</td><td>8&ndash;10</td><td>92 cm / 36.2 in</td><td>76 cm / 29.9 in</td><td>98 cm / 38.6 in</td></tr><tr><td>Double-faced coat</td><td>12&ndash;14</td><td>16&ndash;18</td><td>108 cm / 42.5 in</td><td>92 cm / 36.2 in</td><td>114 cm / 44.9 in</td></tr></tbody></table><h2>How the File Was Measured</h2><p>Every garment is laid flat twenty-four hours after a wear, measured tape-to-tape at three points, and averaged across two units of the same size wherever both were bought. Sleeves are measured from the shoulder seam to the cuff, hems from the waist seam for trousers and from the shoulder for coats. The desk buys its own garments, keeps the receipts, and returns what fails the audit&mdash;returns are disclosed, with the reason, in the house standards.</p><figure class="plate plate--2 aspect-video"><img src="/images/editorial/villainess-detail-16x9.jpg" alt="Detail of oxblood silk satin against black chantilly lace with an antique gold signet ring resting on the fabric" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · The three anchor textures: bias-cut oxblood satin, Chantilly lace, antique gold hardware worn matte</figcaption></figure><h2>Where the Formula Changes Between Markets</h2><ul><li><strong>Sleeve length:</strong> US runs are cut about 1.5cm longer; hem the cuff rather than alter the shoulder if you sit between sizes.</li><li><strong>Rise:</strong> UK tailoring sits roughly 2cm higher in the same waist size&mdash;belt the UK pair lower rather than hauling the US pair up.</li><li><strong>Coat hem:</strong> a UK mid-calf falls mid-calf in the US only when it is shortened below the waist seam, never at the hem itself.</li><li><strong>Lining:</strong> identical in both markets and dyed to the shell&mdash;the one number that never changes.</li></ul><p>Take the file into the fitting room. It is a better use of an afternoon than a mirror and a hope.</p>',
  '2026-10-14 07:30:00'
)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- The nine-pillar schedule — one-off correction for the editorial run.
--
-- Each pillar is pinned to exactly one house section (style, capsule, beauty,
-- interiors, craft) and to its staggered publication date, so the journal read
-- newest-first is a weekly run rather than a single day's dump. The guard makes
-- this a no-op once applied: it only rewrites a pillar whose section, date or
-- draft status still differs from the schedule. If you have since re-edited a
-- pillar in the CMS, delete this block before re-running the file.
-- ----------------------------------------------------------------------------
update articles a
set
  category = v.category,
  created_at = v.published_at,
  status = case when v.publish and a.status = 'draft' then 'published' else a.status end
from (values
  ('how-to-dress-like-the-villainess-dark-romance-outfits', 'style',     timestamp '2026-08-24 07:30:00', true),
  ('the-british-layering-code-wool-merino-silk',           'style',     timestamp '2026-08-31 07:30:00', true),
  ('the-3-piece-british-autumn-formula',                   'style',     timestamp '2026-09-07 07:30:00', true),
  ('vamp-romantic-capsule-wardrobe',                       'capsule',   timestamp '2026-09-14 07:30:00', true),
  ('smudged-kohl-oxblood-lips-tutorial',                   'beauty',    timestamp '2026-09-21 07:30:00', true),
  ('dark-elegance-dining-room-ideas',                      'interiors', timestamp '2026-09-28 07:30:00', true),
  ('reading-the-fibre-label-in-a-dark-atelier',            'craft',     timestamp '2026-10-05 07:30:00', true),
  ('the-us-oxblood-edit-american-autumn-tailoring',        'style',     timestamp '2026-10-12 07:30:00', true),
  ('the-fit-file-us-0-16-uk-4-20',                         'craft',     timestamp '2026-10-14 07:30:00', true)
) as v(slug, category, published_at, publish)
where a.slug = v.slug
  and (
    a.category is distinct from v.category
    or a.created_at::date is distinct from v.published_at::date
    or (v.publish and a.status = 'draft')
  );

-- ----------------------------------------------------------------------------
-- Backfill for rows that predate Dark Elegance: restores the 16:9 cover and the
-- missing plates on any legacy article (including rows whose body still says
-- "Edit this article in the admin").
-- ----------------------------------------------------------------------------
update articles a
set
  cover_image = case
    when a.cover_image is null
      or btrim(a.cover_image) = ''
      or (a.cover_image not like '%16x9%' and a.cover_image not like 'http%')
    then v.cover_image
    else a.cover_image
  end,
  content_html = case
    when a.content_html is null
      or btrim(a.content_html) = ''
      or a.content_html ilike '%Edit this article in the admin%'
      then coalesce('<p>' || btrim(a.excerpt) || '</p>', '') || v.plates
    when position(split_part(v.plates, '</figure>', 1) in a.content_html) = 0
      then a.content_html || v.plates
    else a.content_html
  end,
  meta_title = coalesce(nullif(btrim(a.meta_title), ''), a.title || ' | The Oxblood Edit'),
  meta_description = coalesce(nullif(btrim(a.meta_description), ''), btrim(coalesce(a.excerpt, '')))
from (values
('how-to-dress-like-the-villainess-dark-romance-outfits', '/images/editorial/villainess-hero-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/villainess-hero-16x9.jpg" alt="A woman seen from behind in a floor-length black velvet cape lined with oxblood satin, standing in a candlelit Georgian gallery" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · The long gallery, nine o''clock. Velvet cut to the floor, oxblood satin lining let slip one inch past the hem</figcaption></figure><figure class="plate plate--2 aspect-video"><img src="/images/editorial/villainess-detail-16x9.jpg" alt="Detail of oxblood silk satin against black chantilly lace with an antique gold signet ring resting on the fabric" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · The three anchor textures: bias-cut oxblood satin, Chantilly lace, antique gold hardware worn matte</figcaption></figure>'),
('the-3-piece-british-autumn-formula', '/images/editorial/british-autumn-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/british-autumn-16x9.jpg" alt="A woman in a longline charcoal wool coat and oxblood loafers crossing wet slate paving in an autumn London square" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · London, late October. The longline coat, the fine merino neck, the oxblood horsebit — three pieces, no fourth</figcaption></figure><figure class="plate plate--2 aspect-video"><img src="/images/editorial/british-layers-16x9.jpg" alt="Layered black wool cape over a merino turtleneck and ivory silk blouse with oxblood leather gloves and an antique gold brooch" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · The layering test, read at the wrist: matte wool, fine gauge knit, liquid silk, one brass fastening</figcaption></figure>'),
('vamp-romantic-capsule-wardrobe', '/images/editorial/capsule-wardrobe-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/capsule-wardrobe-16x9.jpg" alt="Twelve curated garments in jet black wool, oxblood velvet and ivory silk on an antique valet stand in a candlelit panelled room" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Twelve pieces on one stand: the chromatic spine is jet, oxblood, parchment and antique gold</figcaption></figure><figure class="plate plate--2 aspect-video"><img src="/images/editorial/fibre-label-atelier-16x9.jpg" alt="A heritage tailoring atelier with bolts of double-faced wool, cashmere and silk, shears and tape on a worn oak bench" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · Inside the label: 75% wool minimum, 320gsm and up, and a lining dyed to the same oxblood</figcaption></figure>'),
('smudged-kohl-oxblood-lips-tutorial', '/images/editorial/beauty-kohl-lips-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/beauty-kohl-lips-16x9.jpg" alt="Close-up of smudged charcoal kohl eyes and velvet-matte oxblood lips lit by a single candle flame" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Kohl on the tightline only; the lip pressed in with a fingertip and left unlined</figcaption></figure>'),
('dark-elegance-dining-room-ideas', '/images/editorial/dining-room-interiors-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/dining-room-interiors-16x9.jpg" alt="A dark dining room with oxblood limewashed walls, a smoked oak table, brass taper candlesticks and parchment linen" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Dining after sundown: oxblood limewash, smoked oak, unlacquered brass at staggered heights</figcaption></figure>'),
('the-british-layering-code-wool-merino-silk', '/images/editorial/british-layers-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/british-layers-16x9.jpg" alt="Layered black wool cape over a merino turtleneck and ivory silk blouse with oxblood leather gloves and an antique gold brooch" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · The layering test, read at the wrist: matte wool, fine gauge knit, liquid silk, one brass fastening</figcaption></figure><figure class="plate plate--2 aspect-video"><img src="/images/editorial/british-autumn-16x9.jpg" alt="A woman in a longline charcoal wool coat and oxblood loafers crossing wet slate paving in an autumn London square" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate II · London, late October. The longline coat, the fine merino neck, the oxblood horsebit — three pieces, no fourth</figcaption></figure>'),
('reading-the-fibre-label-in-a-dark-atelier', '/images/editorial/fibre-label-atelier-16x9.jpg', '<figure class="plate plate--1 aspect-video"><img src="/images/editorial/fibre-label-atelier-16x9.jpg" alt="A heritage tailoring atelier with bolts of double-faced wool, cashmere and silk, shears and tape on a worn oak bench" width="1920" height="1080" loading="lazy" decoding="async" class="aspect-video" /><figcaption>Plate I · Inside the label: 75% wool minimum, 320gsm and up, and a lining dyed to the same oxblood</figcaption></figure>')
) as v(slug, cover_image, plates)
where a.slug = v.slug;
