import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAffiliateLinks } from "@/lib/db";
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
  return {
    title: article.meta_title || `${article.title} — The Oxblood Edit`,
    description:
      article.meta_description ||
      article.excerpt ||
      "Dark romance fashion, beauty and interiors from The Oxblood Edit."
  };
}

export default async function ArticlePage({
  params
}: {
  params: { slug: string };
}) {
  const [article, affiliateLinks] = await Promise.all([
    getArticleBySlug(params.slug),
    getAffiliateLinks()
  ]);

  if (!article) {
    notFound();
  }

  const safeHtml = sanitizeEditorialHtml(article.content_html);

  return (
    <article className="px-[8%] py-14 max-w-4xl mx-auto min-h-[60vh]">
      <Link
        href="/journal"
        className="font-cinzel text-xs tracking-widest uppercase text-oxblood no-underline hover:underline inline-block mb-6"
      >
        ← Back to Journal
      </Link>

      <p className="uppercase font-cinzel text-xs tracking-[0.18em] text-oxblood mb-2">
        {article.category}
      </p>
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

      {affiliateLinks.length > 0 && (
        <aside className="mt-14 pt-8 border-t-2 border-gold">
          <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
            SHOP THE EDIT
          </p>
          <h2 className="text-2xl mb-4">Curated pieces from this formula</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {affiliateLinks.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white p-4 border border-nearblack/15">
                <p className="font-cinzel text-[11px] uppercase tracking-wider text-nearblack/60">
                  {item.merchant}
                </p>
                <p className="font-semibold text-base my-1">{item.name}</p>
                <p className="text-sm text-oxblood mb-3">
                  {[item.price_us && `US ${item.price_us}`, item.price_uk && `UK ${item.price_uk}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
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
    </article>
  );
}
