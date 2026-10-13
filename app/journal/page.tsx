import Link from "next/link";
import { getPublishedArticles } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal — The Oxblood Edit",
  description: "Fashion, dark beauty rituals, and moody interiors for intentional elegance."
};

export default async function JournalPage() {
  const articles = await getPublishedArticles();

  return (
    <section className="px-[8%] py-14 min-h-[60vh] max-w-5xl mx-auto">
      <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
        EDITORIAL ARCHIVE
      </p>
      <h1 className="text-4xl sm:text-5xl mb-3">Journal</h1>
      <p className="text-xl text-nearblack/80 mb-10">
        Fashion, beauty and interiors for a darker kind of elegance.
      </p>

      {articles.length ? (
        <div className="divide-y divide-gold/60">
          {articles.map((a) => (
            <article key={a.slug} className="py-7">
              <p className="font-cinzel text-xs uppercase tracking-[0.16em] text-oxblood mb-2">
                {a.category}
              </p>
              <h2 className="text-2xl sm:text-3xl mb-2">
                <Link href={`/journal/${a.slug}`} className="no-underline hover:text-oxblood">
                  {a.title}
                </Link>
              </h2>
              {a.excerpt && <p className="text-xl text-nearblack/80 mb-4">{a.excerpt}</p>}
              <Link
                href={`/journal/${a.slug}`}
                className="font-cinzel text-xs tracking-widest uppercase text-oxblood no-underline hover:underline"
              >
                Read story →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-lg">
          Editorial stories will appear here when published in the database.
        </p>
      )}
    </section>
  );
}
