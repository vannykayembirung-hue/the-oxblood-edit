import type { ProductRecord } from "@/lib/db";
import {
  PRODUCT_LAYOUTS,
  PRODUCT_SEEDS,
  formatProductPrice,
  isProductSlug,
  resolveGumroadUrl
} from "@/lib/products";

/**
 * One Gumroad digital edition, in the house layout:
 *
 *   1. a full-width 16:9 plate with its Cinzel caption;
 *   2. a two-column grid — what is included (left) and the instant-download
 *      price card with the Gumroad button (right).
 *
 * Used for every product on `/shop/the-oxblood-code` and on the homepage.
 */
export default function ProductEdition({
  product,
  headingLevel = "h2",
  priority = false
}: {
  product: ProductRecord;
  headingLevel?: "h1" | "h2";
  /** Eager-load the plate (first edition above the fold). */
  priority?: boolean;
}) {
  if (!isProductSlug(product.slug)) return null;

  const slug = product.slug;
  const layout = PRODUCT_LAYOUTS[slug];
  const seed = PRODUCT_SEEDS[slug];
  const checkoutUrl = resolveGumroadUrl(slug, product.gumroad_url);
  const deliverables = product.what_inside.length > 0 ? product.what_inside : seed.what_inside;
  const description = product.description || seed.description;
  const name = product.name || seed.name;
  const Heading = headingLevel;

  return (
    <article id={slug} className="scroll-mt-24">
      <header className="mb-7">
        <p className="eyebrow mb-3">Edition {layout.edition} · Digital Edition</p>
        <Heading className="text-3xl sm:text-4xl leading-[1.15] mb-4">{name}</Heading>
        <p className="text-xl text-parchment/78 max-w-3xl">{description}</p>
      </header>

      {/* Plate — full-width 16:9 */}
      <figure className="m-0 w-full">
        <div className="relative w-full overflow-hidden aspect-[16/9] border border-gold/30 bg-[#0E0C0A]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layout.plate.src}
            alt={layout.plate.alt}
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover"
            {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          />
        </div>
        <figcaption className="mt-3 pt-3 border-t border-gold/20 font-cinzel text-[0.68rem] sm:text-[0.72rem] tracking-[0.18em] uppercase text-parchment/60">
          {layout.plate.caption}
        </figcaption>
      </figure>

      {/* Offer — included (left) · instant download (right) */}
      <div className="grid md:grid-cols-[1.45fr_1fr] gap-6 mt-6">
        <div className="bg-[#120F0D] border border-gold/25 p-8 flex flex-col">
          <h3 className="font-cinzel text-[0.7rem] tracking-[0.26em] uppercase text-gold mb-5">
            INCLUDED IN THIS DIGITAL EDITION
          </h3>
          <ul className="space-y-3 text-xl mb-8">
            {deliverables.map((item) => (
              <li key={item} className="flex gap-3 items-baseline">
                <span className="text-gold select-none" aria-hidden="true">
                  ✦
                </span>
                <span className="text-parchment/85">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-auto text-base text-parchment/55 italic">{layout.deliveryNote}</p>
        </div>

        <div className="bg-[#120F0D] border border-gold/30 border-t-2 border-t-gold p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-cinzel text-[0.7rem] tracking-[0.26em] uppercase text-gold mb-4">
              INSTANT DIGITAL DOWNLOAD
            </h3>
            <p className="font-cormorant text-5xl sm:text-6xl leading-none text-parchment mb-3">
              {formatProductPrice(slug, product.price)}
            </p>
            <p className="font-cinzel text-[0.66rem] tracking-[0.22em] uppercase text-parchment/55 mb-8">
              {layout.licence}
            </p>
          </div>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#6E1423] border border-gold text-parchment font-cinzel text-[0.72rem] tracking-[0.24em] uppercase no-underline px-5 py-4 transition hover:brightness-125 focus-visible:brightness-125"
          >
            GET THE GUIDE ON GUMROAD
            <span className="sr-only"> — {layout.shortName} (opens Gumroad in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/** schema.org Product entries for the editions rendered on a page. */
export function buildProductsJsonLd(products: ProductRecord[], siteUrl: string) {
  return products
    .filter((product) => isProductSlug(product.slug))
    .map((product) => {
      const slug = product.slug as keyof typeof PRODUCT_LAYOUTS;
      const layout = PRODUCT_LAYOUTS[slug];
      const offers = [
        {
          "@type": "Offer",
          price: String(product.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: resolveGumroadUrl(slug, product.gumroad_url)
        },
        ...(layout.priceGbp != null
          ? [
              {
                "@type": "Offer",
                price: String(layout.priceGbp),
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
                url: resolveGumroadUrl(slug, product.gumroad_url)
              }
            ]
          : [])
      ];
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description ?? PRODUCT_SEEDS[slug].description,
        image: [`${siteUrl}${layout.plate.src}`],
        brand: { "@type": "Brand", name: "The Oxblood Edit" },
        offers
      };
    });
}
