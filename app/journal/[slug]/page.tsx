import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles, getAffiliateLinks } from "@/lib/db";
import { sanitizeEditorialHtml } from "@/lib/sanitize";
import WaxSeal from "@/components/WaxSeal";

export const dynamic = "force-dynamic";

const FALLBACK_COVER = "/images/editorial/villainess-hero-16x9.jpg";

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: "Article Not Found — The Oxblood Edit" };
  }
  const title = article.meta_title || `${article.title} — The Oxblood Edit`;
  const description =
    article.meta_description ||
    article.excerpt ||
    "Dark romance fashion, beauty and interiors from The Oxblood Edit.";

  return {
    title,
    description,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.created_at,
      url: `/journal/${article.slug}`,
      images: [
        {
          url: article.cover_image || FALLBACK_COVER,
          width: 1920,
          height: 1080,
          alt: article.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function ArticlePage({
  params
}: {
  params: { slug: string };
}) {
  const [article, allArticles, affiliateLinks] = await Promise.all([
    getArticleBySlug(params.slug),
    getPublishedArticles(),
    getAffiliateLinks()
  ]);

  if (!article) {
    notFound();
  }

  const safeHtml = sanitizeEditorialHtml(article.content_html);
  const plainWords = safeHtml.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(2, Math.ceil(plainWords / 180));
  const formattedDate = new Date(article.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const relatedArticles = allArticles.filter((a) => a.slug !== article.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description || article.excerpt || "",
    image: [article.cover_image || FALLBACK_COVER],
    datePublished: article.created_at,
    dateModified: article.created_at,
    articleSection: article.category,
    author: { "@type": "Organization", name: "The Oxblood Edit" },
    publisher: { "@type": "Organization", name: "The Oxblood Edit" }
  };

  const coverImage = article.cover_image || FALLBACK_COVER;

  return (
    <article className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Masthead band */}
      <header className="px-[6%] pt-14 pb-10 border-b border-gold/20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/journal"
            className="font-cinzel text-[0.66rem] tracking-[0.24em] uppercase text-gold no-underline hover:text-parchment inline-block mb-7"
          >
            ← Back to Journal
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <span className="font-cinzel text-[0.62rem] uppercase tracking-[0.26em] text-gold/85 border border-gold/35 px-2.5 py-1">
              {article.category}
            </span>
            <span className="text-gold/40">·</span>
            <span className="text-parchment/60">{formattedDate}</span>
            <span className="text-gold/40">·</span>
            <span className="text-parchment/60">{readingMinutes} min read</span>
          </div>

          <h1 className="text-3xl sm:text-5xl leading-[1.14] mb-5">{article.title}</h1>

          {article.excerpt && (
            <p className="text-xl sm:text-2xl text-parchment/75 italic pb-7">
              {article.excerpt}
            </p>
          )}

          <figure className="plate w-full">
            <span className="frame-16x9 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={article.title}
                width={1920}
                height={1080}
                fetchPriority="high"
              />
            </span>
            <figcaption>Plate 0 · The cover, photographed at 16:9 for candlelight</figcaption>
          </figure>
        </div>
      </header>

      {/* Body */}
      <div className="px-[6%] pt-12">
        <div className="max-w-3xl mx-auto">
          <div className="editorial-prose" dangerouslySetInnerHTML={{ __html: safeHtml }} />

          <div className="flex items-center gap-5 mt-14 pt-8 border-t border-gold/20">
            <WaxSeal size={62} />
            <p className="font-cinzel text-[0.66rem] tracking-[0.26em] uppercase text-parchment/60">
              Set in Cinzel &amp; Cormorant · The Oxblood Edit
              <br />
              <span className="text-gold/80">True elegance does not shout.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Signature Guide Callout */}
      <div className="px-[6%] mt-14">
        <div className="max-w-4xl mx-auto velvet-card velvet-card--rule p-8 sm:p-10">
          <p className="eyebrow mb-3">The Complete System</p>
          <h2 className="text-2xl sm:text-3xl mb-3">
            Want all 12 dark-romance outfit formulas?
          </h2>
          <p className="text-xl text-parchment/75 mb-7 max-w-2xl">
            Explore <em>The Oxblood Code</em> — our 78-page digital wardrobe architecture for US
            0–16 and UK 4–20 with printable seasonal checklists.
          </p>
          <Link href="/shop/the-oxblood-code" className="btn-oxblood">
            Explore The Oxblood Code
          </Link>
        </div>
      </div>

      {/* Curated Affiliate Pieces */}
      {affiliateLinks.length > 0 && (
        <aside className="px-[6%] mt-14">
          <div className="max-w-4xl mx-auto pt-9 border-t border-gold/20">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <div>
                <p className="eyebrow mb-2">Shop the edit</p>
                <h2 className="text-2xl">Curated pieces from this formula</h2>
              </div>
              <Link href="/disclosure" className="text-sm text-parchment/55 hover:text-gold underline underline-offset-4">
                Affiliate disclosure
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {affiliateLinks.slice(0, 3).map((item) => (
                <div key={item.id} className="velvet-card p-5 flex flex-col justify-between">
                  <div>
                    <p className="font-cinzel text-[0.6rem] uppercase tracking-[0.22em] text-parchment/55">
                      {item.merchant}
                    </p>
                    <p className="font-semibold text-base my-2 leading-snug">{item.name}</p>
                    <p className="text-sm text-gold font-semibold mb-4">
                      {[item.price_us && `US ${item.price_us}`, item.price_uk && `UK ${item.price_uk}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <a
                    href={`/api/affiliate/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-cinzel text-[0.64rem] uppercase tracking-[0.22em] text-parchment/80 hover:text-gold no-underline transition-colors"
                  >
                    View Piece ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <section className="px-[6%] mt-16">
          <div className="max-w-4xl mx-auto pt-9 border-t border-gold/20">
            <p className="eyebrow mb-2">Continue reading</p>
            <h2 className="text-2xl mb-6">More from the Journal</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <div key={rel.slug} className="velvet-card flex">
                  <Link
                    href={`/journal/${rel.slug}`}
                    className="frame-16x9 w-2/5 shrink-0 border-0 border-r border-gold/20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.cover_image ?? FALLBACK_COVER}
                      alt={rel.title}
                      width={1920}
                      height={1080}
                      loading="lazy"
                    />
                  </Link>
                  <div className="p-5">
                    <p className="font-cinzel text-[0.6rem] uppercase tracking-[0.22em] text-gold/85 mb-1.5">
                      {rel.category}
                    </p>
                    <h3 className="text-lg mb-2 leading-snug">
                      <Link
                        href={`/journal/${rel.slug}`}
                        className="no-underline hover:text-gold transition-colors"
                      >
                        {rel.title}
                      </Link>
                    </h3>
                    {rel.excerpt && (
                      <p className="text-base text-parchment/65 mb-3 line-clamp-3">{rel.excerpt}</p>
                    )}
                    <Link
                      href={`/journal/${rel.slug}`}
                      className="font-cinzel text-[0.62rem] uppercase tracking-[0.2em] text-parchment/70 no-underline hover:text-gold transition-colors"
                    >
                      Read story →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="px-[6%] mt-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/quiz" className="cta-bar">
            Which Villainess Are You? · Take The Six-Question Reading
          </Link>
        </div>
      </div>
    </article>
  );
}
