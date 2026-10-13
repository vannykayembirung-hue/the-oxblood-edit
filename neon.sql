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

insert into products (name, slug, price, gumroad_url, what_inside)
values ('The Oxblood Code','the-oxblood-code',27,'__GUMROAD_URL__',
array['78 pages PDF','12 outfit formulas','Palette #6E1423','US 0-16 / UK 4-20','Printable checklist'])
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

insert into articles (slug, title, excerpt, status, category, content_html) values
('how-to-dress-like-the-villainess-dark-romance-outfits','How to Dress Like the Villainess: 7 Dark Romance Outfits','The oxblood satin, black lace and velvet formula. 3 budgets for US & UK.','draft','style','<h2>The 3 Key Pieces</h2><p>Edit this article in the admin.</p>'),
('the-3-piece-british-autumn-formula','The 3-Piece British Autumn Formula: Coat + Knit + Loafers','The coat + knit + loafers tested for US & UK fall.','draft','style','<h2>Formula</h2><p>Edit this article in the admin.</p>'),
('vamp-romantic-capsule-wardrobe','The 12-Piece Vamp Romantic Capsule Wardrobe','12 pieces for Fall/Winter 2026. Links to The Oxblood Code.','draft','capsule','<h2>The 12 Pieces</h2><p>Edit this article in the admin.</p>'),
('smudged-kohl-oxblood-lips-tutorial','Smudged Kohl & Oxblood Lips: Vamp Romantic Makeup Tutorial','US & UK products tutorial.','draft','beauty','<h2>Products</h2><p>Edit this article in the admin.</p>'),
('dark-elegance-dining-room-ideas','7 Dark Elegance Dining Room Ideas: Oxblood & Candlelight','Dark-elegance home decor inspiration.','draft','interiors','<h2>Ideas</h2><p>Edit this article in the admin.</p>')
on conflict (slug) do nothing;
