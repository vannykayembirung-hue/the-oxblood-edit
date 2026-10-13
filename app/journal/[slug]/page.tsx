import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles, getAffiliateLinks } from "@/lib/db";
import { sanitizeEditorialHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

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
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.created_at,
      ...(article.cover_image ? { images: [{ url: article.cover_image }] } : {})
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

  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description || article.excerpt || "",
    datePublished: article.created_at,
    articleSection: article.category,
    author: {
      "@type": "Organization",
      name: "The Oxblood Edit"
    },
    publisher: {
      "@type": "Organization",
      name: "The Oxblood Edit"
    }
  };

  return (
    <article className="px-[8%] py-14 max-w-4xl mx-auto min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/journal"
        className="font-cinzel text-xs tracking-widest uppercase text-oxblood no-underline hover:underline inline-block mb-6"
      >
        ← Back to Journal
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="uppercase font-cinzel text-xs tracking-[0.18em] text-oxblood">
          {article.category}
        </span>
        <span className="text-nearblack/40">·</span>
        <span className="text-sm text-nearblack/70">{formattedDate}</span>
        <span className="text-nearblack/40">·</span>
        <span className="text-sm text-nearblack/70">{readingMinutes} min read</span>
      </div>

      <h1 className="text-3xl sm:text-5xl leading-tight mb-4">{article.title}</h1>

      {article.excerpt && (
        <p className="text-2xl text-nearblack/80 border-b border-gold/50 pb-6 mb-8">
          {article.excerpt}
        </p>
      )}

      {article.cover_image && (
        <div className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full max-h-[480px] object-cover border border-gold/40"
          />
        </div>
      )}

      <div
        className="editorial-prose"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* Signature Guide Embedded Callout */}
      <div className="my-12 bg-nearblack text-cream p-8 border-l-4 border-gold">
        <p className="font-cinzel text-xs tracking-[0.2em] text-gold uppercase mb-2">
          THE COMPLETE SYSTEM
        </p>
        <h2 className="text-2xl mb-2">Want all 12 dark-romance outfit formulas?</h2>
        <p className="text-lg text-[#d8cdb9] mb-5">
          Explore <em>The Oxblood Code</em> — our 78-page digital wardrobe architecture for US 0–16
          and UK 4–20 with printable seasonal checklists.
        </p>
        <Link href="/shop/the-oxblood-code" className="btn-gold">
          EXPLORE THE OXBLOOD CODE
        </Link>
      </div>

      {/* Curated Affiliate Pieces */}
      {affiliateLinks.length > 0 && (
        <aside className="mt-12 pt-8 border-t-2 border-gold">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-1">
                SHOP THE EDIT
              </p>
              <h2 className="text-2xl">Curated pieces from this formula</h2>
            </div>
            <Link
              href="/disclosure"
              className="text-xs text-nearblack/60 hover:text-oxblood underline"
            >
              Affiliate disclosure
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {affiliateLinks.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 border border-nearblack/15 flex flex-col justify-between"
              >
                <div>
                  <p className="font-cinzel text-[11px] uppercase tracking-wider text-nearblack/60">
                    {item.merchant}
                  </p>
                  <p className="font-semibold text-base my-1.5">{item.name}</p>
                  <p className="text-sm text-oxblood font-semibold mb-3">
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
                  className="font-cinzel text-xs uppercase tracking-wider text-nearblack hover:text-oxblood"
                >
                  View Piece ↗
                </a>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <section className="mt-14 pt-8 border-t border-nearblack/15">
          <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
            CONTINUE READING
          </p>
          <h2 className="text-2xl mb-5">More from the Journal</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {relatedArticles.map((rel) => (
              <div key={rel.slug} className="bg-white/60 p-5 border-t-2 border-oxblood">
                <p className="font-cinzel text-xs uppercase tracking-widest text-oxblood mb-1">
                  {rel.category}
                </p>
                <h3 className="text-xl mb-2">
                  <Link href={`/journal/${rel.slug}`} className="no-underline hover:text-oxblood">
                    {rel.title}
                  </Link>
                </h3>
                {rel.excerpt && <p className="text-base text-nearblack/75 mb-3">{rel.excerpt}</p>}
                <Link
                  href={`/journal/${rel.slug}`}
                  className="font-cinzel text-xs uppercase tracking-widest text-oxblood no-underline hover:underline"
                >
                  Read story →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
