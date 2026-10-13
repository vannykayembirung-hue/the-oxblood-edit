import Link from "next/link";
import { getPublishedArticles, getProductBySlug, getAffiliateLinks } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      {/* Hero */}
      <section className="bg-nearblack text-cream px-[8%] pt-24 pb-28">
        <p className="text-gold font-cinzel tracking-[0.22em] text-xs uppercase mb-4">
          DARK ELEGANCE · US &amp; UK
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl max-w-4xl leading-[1.12] mb-6">
          True elegance does not shout.
        </h1>
        <p className="text-xl sm:text-2xl max-w-2xl text-[#d8cdb9] mb-8">
          A considered edit of vamp-romantic fashion, dark beauty and moody interiors.
        </p>
        <Link className="btn-gold" href="/shop/the-oxblood-code">
          DISCOVER THE OXBLOOD CODE
        </Link>
      </section>

      {/* Signature Guide */}
      <section className="px-[8%] py-16 border-b border-nearblack/10">
        <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
          SEASONAL SYSTEM
        </p>
        <h2 className="text-3xl mb-3">The signature guide</h2>
        <p className="text-xl max-w-2xl mb-4">
          {product?.description ||
            "Build a wardrobe around oxblood, black velvet, antique gold and timeless silhouettes."}
        </p>
        <p className="text-lg mb-6">
          <strong>{product?.name || "The Oxblood Code"}</strong> · ${product?.price ?? 27} USD
        </p>
        <Link className="btn-gold" href={guideHref}>
          EXPLORE THE GUIDE
        </Link>
      </section>

      {/* Latest Journal Stories */}
      <section className="px-[8%] py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <h2 className="text-3xl">From the journal</h2>
          <Link
            href="/journal"
            className="font-cinzel text-xs tracking-widest uppercase text-oxblood hover:underline"
          >
            View All Stories →
          </Link>
        </div>

        {articles.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((a) => (
              <article
                key={a.slug}
                className="border-t-2 border-gold pt-5 flex flex-col justify-between bg-white/50 p-6"
              >
                <div>
                  <p className="uppercase font-cinzel text-xs tracking-[0.16em] text-oxblood mb-2">
                    {a.category}
                  </p>
                  <h3 className="text-xl mb-3">
                    <Link href={`/journal/${a.slug}`} className="no-underline hover:text-oxblood">
                      {a.title}
                    </Link>
                  </h3>
                  <p className="text-lg text-nearblack/80 mb-4">{a.excerpt}</p>
                </div>
                <Link
                  href={`/journal/${a.slug}`}
                  className="font-cinzel text-xs tracking-wider uppercase text-oxblood no-underline hover:underline"
                >
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-lg">
            New editorial stories are being prepared. Visit the Journal soon.
          </p>
        )}
      </section>

      {/* Curated Affiliate Edit */}
      {affiliateLinks.length > 0 && (
        <section className="px-[8%] py-14 bg-white/40 border-t border-nearblack/10">
          <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
            THE CURATED EDIT
          </p>
          <h2 className="text-3xl mb-6">Key pieces for US &amp; UK wardrobes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {affiliateLinks.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 border-t-2 border-oxblood flex flex-col justify-between"
              >
                <div>
                  <p className="font-cinzel text-xs uppercase tracking-widest text-nearblack/60 mb-1">
                    {item.merchant}
                  </p>
                  <h3 className="text-lg mb-2">{item.name}</h3>
                  <p className="text-base text-oxblood font-semibold mb-4">
                    {[item.price_us && `US ${item.price_us}`, item.price_uk && `UK ${item.price_uk}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <a
                  href={`/api/affiliate/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-cinzel text-xs tracking-widest uppercase text-nearblack hover:text-oxblood"
                >
                  Shop Piece ↗
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
