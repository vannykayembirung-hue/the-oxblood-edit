import Link from "next/link";
import { getPublishedArticles, getProductBySlug, getAffiliateLinks } from "@/lib/db";
import WaxSeal from "@/components/WaxSeal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Oxblood Edit — Dark Romance Fashion US & UK",
  description:
    "Vamp romantic fashion, British autumn formulas, dark beauty and moody interiors. True elegance does not shout.",
  alternates: { canonical: "/" }
};

export default async function Home() {
  const [articles, product, affiliateLinks] = await Promise.all([
    getPublishedArticles(3),
    getProductBySlug("the-oxblood-code"),
    getAffiliateLinks()
  ]);

  const guideHref =
    product?.gumroad_url && product.gumroad_url !== "__GUMROAD_URL__"
      ? product.gumroad_url
      : "/shop/the-oxblood-code";

  return (
    <div>
      {/* Hero — dark velvet ground, oxblood halo, 16:9 lead photograph */}
      <section className="px-[6%] pt-16 pb-14 sm:pt-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div>
            <div className="flex items-center gap-4 mb-7">
              <WaxSeal size={54} />
              <p className="eyebrow">Dark Elegance · US &amp; UK</p>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] leading-[1.08] mb-6">
              True elegance
              <br />
              does not shout.
            </h1>
            <p className="text-xl sm:text-2xl text-parchment/75 max-w-xl mb-3">
              A considered edit of vamp-romantic fashion, dark beauty and moody interiors — oxblood,
              black velvet, antique gold, candlelight.
            </p>
            <p className="font-cinzel text-[0.68rem] tracking-[0.3em] uppercase text-gold/80 mb-9">
              Her uniform. Her lip. Her book.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={guideHref} className="btn-oxblood">
                Discover The Oxblood Code
              </Link>
              <Link href="/quiz" className="btn-ghost">
                Which Villainess Are You?
              </Link>
            </div>
          </div>

          <figure className="plate w-full">
            <span className="frame-16x9 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/editorial/villainess-hero-16x9.jpg"
                alt="A woman seen from behind in a floor-length black velvet cape lined with oxblood satin, in a candlelit Georgian gallery"
                width={1920}
                height={1080}
                fetchPriority="high"
              />
            </span>
            <figcaption>Plate I · The long gallery, nine o&rsquo;clock — velvet cut to the floor</figcaption>
          </figure>
        </div>
      </section>

      <Link href="/journal" className="cta-bar">
        The Journal · Stories For The Darker Half Of The Year
      </Link>

      {/* Signature Guide */}
      <section className="px-[6%] py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <figure className="plate w-full order-2 lg:order-1">
            <span className="frame-16x9 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/editorial/capsule-wardrobe-16x9.jpg"
                alt="Twelve curated garments in jet black wool, oxblood velvet and ivory silk on an antique valet stand"
                width={1920}
                height={1080}
                loading="lazy"
              />
            </span>
            <figcaption>Plate II · Twelve pieces, one chromatic spine</figcaption>
          </figure>

          <div className="order-1 lg:order-2">
            <p className="eyebrow mb-3">Seasonal System</p>
            <h2 className="text-3xl sm:text-4xl mb-4">The signature guide</h2>
            <p className="text-xl text-parchment/80 mb-5">
              {product?.description ||
                "Build a wardrobe around oxblood, black velvet, antique gold and timeless silhouettes."}
            </p>
            <p className="text-lg text-parchment/70 mb-7">
              <strong className="text-parchment font-cinzel text-sm tracking-[0.18em] uppercase">
                {product?.name || "The Oxblood Code"}
              </strong>
              <span className="text-gold mx-2">·</span>${product?.price ?? 27} USD
              <span className="text-gold mx-2">·</span>78 pages
            </p>
            <Link href="/shop/the-oxblood-code" className="btn-oxblood">
              Explore The Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Journal Stories */}
      <section className="px-[6%] py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-9">
            <div>
              <p className="eyebrow mb-2">From the journal</p>
              <h2 className="text-3xl sm:text-4xl">Stories in candlelight</h2>
            </div>
            <Link
              href="/journal"
              className="font-cinzel text-[0.68rem] tracking-[0.24em] uppercase text-gold hover:text-parchment no-underline"
            >
              View All Stories →
            </Link>
          </div>

          {articles.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {articles.map((a) => (
                <article key={a.slug} className="velvet-card velvet-card--rule flex flex-col">
                  {a.cover_image && (
                    <Link href={`/journal/${a.slug}`} className="frame-16x9 border-0 border-b border-gold/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.cover_image}
                        alt={a.title}
                        width={1920}
                        height={1080}
                        loading="lazy"
                      />
                    </Link>
                  )}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <p className="font-cinzel text-[0.62rem] tracking-[0.24em] uppercase text-gold/85 mb-3">
                        {a.category}
                      </p>
                      <h3 className="text-xl mb-3 leading-snug">
                        <Link
                          href={`/journal/${a.slug}`}
                          className="no-underline hover:text-gold transition-colors"
                        >
                          {a.title}
                        </Link>
                      </h3>
                      <p className="text-lg text-parchment/70 mb-5">{a.excerpt}</p>
                    </div>
                    <Link
                      href={`/journal/${a.slug}`}
                      className="font-cinzel text-[0.66rem] tracking-[0.22em] uppercase text-gold no-underline hover:text-parchment transition-colors"
                    >
                      Read article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="velvet-card p-8">
              <p className="text-lg text-parchment/75">
                New editorial stories are being prepared. Visit the Journal soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* The Reading — quiz */}
      <section className="px-[6%] py-16">
        <div className="max-w-5xl mx-auto velvet-card p-8 sm:p-12 grid md:grid-cols-[auto_1fr] gap-9 items-center">
          <div className="flex justify-center">
            <WaxSeal size={132} />
          </div>
          <div>
            <p className="eyebrow mb-3">Which Villainess Are You?</p>
            <h2 className="text-3xl sm:text-4xl mb-3">Six questions. One verdict.</h2>
            <p className="text-xl text-parchment/78 mb-6">
              The Velvet Widow, the Library Siren, the Crimson Heiress, or the Thorned Muse. Answer
              for the woman people describe at the party, and take the wardrobe formula that follows.
            </p>
            <Link href="/quiz" className="btn-oxblood">
              Begin the Reading
            </Link>
          </div>
        </div>
      </section>

      {/* Curated Affiliate Edit */}
      {affiliateLinks.length > 0 && (
        <section className="px-[6%] py-14 border-t border-gold/15">
          <div className="max-w-6xl mx-auto">
            <p className="eyebrow mb-3">The Curated Edit</p>
            <h2 className="text-3xl mb-8">Key pieces for US &amp; UK wardrobes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {affiliateLinks.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="velvet-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="font-cinzel text-[0.62rem] uppercase tracking-[0.24em] text-parchment/55 mb-2">
                      {item.merchant}
                    </p>
                    <h3 className="text-lg mb-3 leading-snug">{item.name}</h3>
                    <p className="text-base text-gold font-semibold mb-5">
                      {[
                        item.price_us && `US ${item.price_us}`,
                        item.price_uk && `UK ${item.price_uk}`
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <a
                    href={`/api/affiliate/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-cinzel text-[0.66rem] tracking-[0.22em] uppercase text-parchment/80 hover:text-gold no-underline transition-colors"
                  >
                    Shop Piece ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
