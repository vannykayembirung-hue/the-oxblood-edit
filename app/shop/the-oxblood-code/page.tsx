import Link from "next/link";
import { getAllProducts } from "@/lib/db";
import WaxSeal from "@/components/WaxSeal";
import ProductEdition, { buildProductsJsonLd } from "@/components/ProductEdition";
import { PRODUCT_LAYOUTS, isProductSlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Oxblood Code & The Villainess Wardrobe System — Digital Editions",
  description:
    "Two dark-elegance digital editions for UK & US wardrobes: The Oxblood Code, the 37-page Fall/Winter 2026 Lookbook & Style Guide ($27), and The Villainess Wardrobe System, four 38-page archetype dossiers ($19 · £15).",
  alternates: { canonical: "/shop/the-oxblood-code" },
  openGraph: {
    images: [
      {
        url: "/images/editorial/capsule-wardrobe-16x9.jpg",
        width: 1920,
        height: 1080,
        alt: "The Oxblood Code — twelve silhouettes on one stand"
      }
    ]
  }
};

export default async function ShopPage() {
  const products = await getAllProducts();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theoxbloodedit.com";
  const jsonLd = buildProductsJsonLd(products, siteUrl);

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-[6%] pt-14 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <WaxSeal size={44} />
            <p className="eyebrow">The House Editions · Instant Digital Download</p>
          </div>
          <h1 className="text-4xl sm:text-6xl mb-4 leading-[1.1]">Two editions. One wardrobe.</h1>
          <p className="text-xl sm:text-2xl text-parchment/78 max-w-3xl">
            The season&rsquo;s lookbook and the four archetype dossiers — print-ready PDFs, sold
            through Gumroad, written for UK &amp; US wardrobes.
          </p>
          <nav className="flex flex-wrap gap-3 mt-8" aria-label="Editions on this page">
            {products.map((product) =>
              isProductSlug(product.slug) ? (
                <a key={product.slug} href={`#${product.slug}`} className="btn-ghost">
                  Edition {PRODUCT_LAYOUTS[product.slug].edition} ·{" "}
                  {PRODUCT_LAYOUTS[product.slug].shortName}
                </a>
              ) : null
            )}
          </nav>
        </div>
      </section>

      {products.map((product, index) => (
        <section
          key={product.slug}
          className={`px-[6%] py-12 ${index > 0 ? "border-t border-gold/15" : ""}`}
        >
          <div className="max-w-5xl mx-auto">
            <ProductEdition product={product} priority={index === 0} />
          </div>
        </section>
      ))}

      <div className="px-[6%] mt-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/quiz" className="cta-bar">
            Not sure which suits you? · Take the six-question reading first
          </Link>
        </div>
      </div>
    </div>
  );
}
