import Link from "next/link";
import { getPublishedArticles } from "@/lib/db";
import { EDITORIAL_CATEGORIES, getCategoryLabel } from "@/lib/editorial-taxonomy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal — The Oxblood Edit",
  description:
    "Fashion, dark beauty rituals, and moody interiors for intentional elegance. True elegance does not shout.",
  alternates: { canonical: "/journal" }
};

// Filter labels come from the house taxonomy so the journal, the CMS select and
// the structured data can never disagree about what a section is called.
const CATEGORIES = [
  { key: "all", label: "All Stories" },
  ...EDITORIAL_CATEGORIES.map((category) => ({ key: category.key, label: category.label }))
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

  const [lead, ...rest] = filteredArticles;

  return (
    <div className="pb-14">
      <section className="px-[6%] pt-16 pb-10">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow mb-3">Editorial Archive</p>
          <h1 className="text-4xl sm:text-6xl mb-4">Journal</h1>
          <p className="text-xl sm:text-2xl text-parchment/75 max-w-2xl">
            Fashion, beauty and interiors for a darker kind of elegance across the US &amp; UK.
            Every story photographed in candlelight, framed 16:9.
          </p>
        </div>
      </section>

      <section className="px-[6%]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 border-b border-gold/25">
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
                  className={`px-4 py-2 font-cinzel text-[0.66rem] tracking-[0.2em] uppercase no-underline border transition-colors ${
                    active
                      ? "bg-oxblood text-parchment border-gold/60"
                      : "bg-velvet text-parchment/75 border-gold/25 hover:border-gold hover:text-parchment"
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
              placeholder="Search the journal…"
              aria-label="Search the journal"
              className="border border-gold/30 bg-velvet px-3.5 py-2 text-base text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-oxblood text-parchment border border-gold/40 font-cinzel text-[0.66rem] tracking-[0.2em] uppercase cursor-pointer hover:brightness-110 transition-all"
            >
              Filter
            </button>
          </form>
        </div>
      </section>

      {lead ? (
        <section className="px-[6%] mb-12">
          <article className="max-w-5xl mx-auto velvet-card velvet-card--rule grid md:grid-cols-2 overflow-hidden">
            <Link href={`/journal/${lead.slug}`} className="frame-16x9 border-0 md:border-r md:border-gold/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lead.cover_image ?? "/images/editorial/villainess-hero-16x9.jpg"}
                alt={lead.title}
                width={1920}
                height={1080}
                fetchPriority="high"
              />
            </Link>
            <div className="p-7 sm:p-10 flex flex-col justify-center">
              <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-3">
                {getCategoryLabel(lead.category)} · Featured story
              </p>
              <h2 className="text-2xl sm:text-4xl mb-3 leading-tight">
                <Link href={`/journal/${lead.slug}`} className="no-underline hover:text-gold transition-colors">
                  {lead.title}
                </Link>
              </h2>
              {lead.excerpt && (
                <p className="text-xl text-parchment/75 mb-6">{lead.excerpt}</p>
              )}
              <Link
                href={`/journal/${lead.slug}`}
                className="font-cinzel text-[0.68rem] tracking-[0.24em] uppercase text-parchment border-b border-gold/50 pb-1 self-start no-underline hover:text-gold transition-colors"
              >
                Read story →
              </Link>
            </div>
          </article>
        </section>
      ) : (
        <section className="px-[6%]">
          <div className="max-w-5xl mx-auto velvet-card p-8 sm:p-10">
            <p className="text-xl mb-4">No editorial stories matched your current filter.</p>
            <Link
              href="/journal"
              className="font-cinzel text-[0.68rem] tracking-[0.24em] uppercase text-gold hover:text-parchment"
            >
              Reset Journal Filters →
            </Link>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="px-[6%]">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-7">
            {rest.map((a) => {
              const readMins = estimateReadingMinutes(a.content_html);
              const dateStr = new Date(a.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });
              return (
                <article key={a.slug} className="velvet-card flex flex-col">
                  <Link href={`/journal/${a.slug}`} className="frame-16x9 border-0 border-b border-gold/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.cover_image ?? "/images/editorial/villainess-hero-16x9.jpg"}
                      alt={a.title}
                      width={1920}
                      height={1080}
                      loading="lazy"
                    />
                  </Link>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-3 text-sm">
                        <span className="font-cinzel text-[0.62rem] uppercase tracking-[0.24em] text-gold/85">
                          {getCategoryLabel(a.category)}
                        </span>
                        <span className="text-gold/40">·</span>
                        <span className="text-parchment/55">{dateStr}</span>
                        <span className="text-gold/40">·</span>
                        <span className="text-parchment/55">{readMins} min read</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl mb-2.5 leading-snug">
                        <Link
                          href={`/journal/${a.slug}`}
                          className="no-underline hover:text-gold transition-colors"
                        >
                          {a.title}
                        </Link>
                      </h2>
                      {a.excerpt && <p className="text-lg text-parchment/70">{a.excerpt}</p>}
                    </div>
                    <Link
                      href={`/journal/${a.slug}`}
                      className="mt-5 font-cinzel text-[0.66rem] tracking-[0.22em] uppercase text-parchment/80 no-underline hover:text-gold transition-colors"
                    >
                      Read story →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="px-[6%] mt-14">
        <div className="max-w-5xl mx-auto">
          <Link href="/quiz" className="cta-bar">
            Which Villainess Are You? · Six Questions, One Verdict
          </Link>
        </div>
      </div>
    </div>
  );
}
