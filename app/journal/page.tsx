import Link from "next/link";
import { getPublishedArticles } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal — The Oxblood Edit",
  description: "Fashion, dark beauty rituals, and moody interiors for intentional elegance."
};

const CATEGORIES = [
  { key: "all", label: "All Stories" },
  { key: "style", label: "Style" },
  { key: "capsule", label: "Capsule" },
  { key: "beauty", label: "Beauty" },
  { key: "interiors", label: "Interiors" }
];

function estimateReadingMinutes(html: string | null): number {
  if (!html) return 3;
  const plainText = html.replace(/<[^>]+>/g, " ").trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;
  return Math.max(2, Math.ceil(words / 180));
}

export default async function JournalPage({
  searchParams
}: {
  searchParams?: { category?: string; q?: string };
}) {
  const allArticles = await getPublishedArticles();
  const selectedCategory = (searchParams?.category || "all").toLowerCase();
  const searchQuery = (searchParams?.q || "").trim().toLowerCase();

  const filteredArticles = allArticles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" || article.category.toLowerCase() === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesQuery;
  });

  return (
    <section className="px-[8%] py-14 min-h-[65vh] max-w-5xl mx-auto">
      <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
        EDITORIAL ARCHIVE
      </p>
      <h1 className="text-4xl sm:text-5xl mb-3">Journal</h1>
      <p className="text-xl text-nearblack/80 mb-8">
        Fashion, beauty and interiors for a darker kind of elegance across the US &amp; UK.
      </p>

      {/* Category Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-nearblack/15">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            const href =
              cat.key === "all"
                ? searchQuery
                  ? `/journal?q=${encodeURIComponent(searchQuery)}`
                  : "/journal"
                : searchQuery
                  ? `/journal?category=${cat.key}&q=${encodeURIComponent(searchQuery)}`
                  : `/journal?category=${cat.key}`;
            return (
              <Link
                key={cat.key}
                href={href}
                className={`px-3.5 py-2 font-cinzel text-xs tracking-widest uppercase no-underline transition-colors ${
                  active
                    ? "bg-oxblood text-cream"
                    : "bg-white/80 text-nearblack hover:bg-nearblack hover:text-cream"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        <form action="/journal" method="GET" className="flex items-center gap-2">
          {selectedCategory !== "all" && (
            <input type="hidden" name="category" value={selectedCategory} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={searchParams?.q || ""}
            placeholder="Search journal..."
            className="border border-nearblack/25 bg-white/80 px-3 py-1.5 text-base focus:border-oxblood focus:outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-nearblack text-cream font-cinzel text-xs tracking-widest uppercase cursor-pointer border-0 hover:bg-oxblood transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {filteredArticles.length ? (
        <div className="divide-y divide-gold/60">
          {filteredArticles.map((a) => {
            const readMins = estimateReadingMinutes(a.content_html);
            const dateStr = new Date(a.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });
            return (
              <article key={a.slug} className="py-7">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-cinzel text-xs uppercase tracking-[0.16em] text-oxblood">
                    {a.category}
                  </span>
                  <span className="text-nearblack/40">·</span>
                  <span className="text-sm text-nearblack/65">{dateStr}</span>
                  <span className="text-nearblack/40">·</span>
                  <span className="text-sm text-nearblack/65">{readMins} min read</span>
                </div>
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
            );
          })}
        </div>
      ) : (
        <div className="bg-white/60 p-8 border-t-2 border-gold">
          <p className="text-xl mb-3">No editorial stories matched your current filter.</p>
          <Link
            href="/journal"
            className="font-cinzel text-xs tracking-widest uppercase text-oxblood hover:underline"
          >
            Reset Journal Filters →
          </Link>
        </div>
      )}
    </section>
  );
}
