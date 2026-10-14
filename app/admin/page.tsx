import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  hasDatabaseUrl,
  getAllArticles,
  getArticleById,
  getAllProducts,
  getAffiliateLinks,
  getSubscribers,
  getSubscriberStats
} from "@/lib/db";
import { ARCHETYPES } from "@/lib/villainess-quiz";
import {
  PRODUCT_LAYOUTS,
  PRODUCT_SEEDS,
  formatProductPrice,
  isProductSlug
} from "@/lib/products";
import { isArchetypeKey } from "@/lib/newsletter";
import { EDITORIAL_CATEGORIES, getCategoryLabel } from "@/lib/editorial-taxonomy";
import {
  syncCatalogAction,
  addSubscriberAdminAction,
  logoutAction,
  saveArticleAction,
  toggleArticleStatusAction,
  deleteArticleAction,
  saveProductAction,
  saveAffiliateLinkAction,
  deleteAffiliateLinkAction,
  updateSubscriberStatusAction,
  deleteSubscriberAction
} from "@/app/admin/actions";
import ImageUploadField from "@/components/ImageUploadField";

import { CRM_SEGMENTS, contactSegment } from "@/lib/admin-crm";
import { auditArticle } from "@/lib/admin-seo";
import { CatalogSyncButton, CopyPinterestUtmButton, SubscriberCrmToolbar } from "@/components/AdminCrmTools";

export const dynamic = "force-dynamic";

const NOTICE_MESSAGES: Record<string, string> = {
  "catalog-synced": "Neon upgraded: 9 complete articles, 2 Gumroad products and 6 affiliate pieces. Clicks and CRM contacts preserved.",
  "subscriber-added": "VIP contact added as pending. Existing contacts and consent states are unchanged.",
  "article-saved": "Article saved and published paths revalidated.",
  "status-updated": "Article publication status updated.",
  "article-deleted": "Article removed from the catalog.",
  "product-saved": "Product details and Gumroad link updated across the site.",
  "affiliate-saved": "Affiliate piece saved.",
  "affiliate-deleted": "Affiliate piece removed.",
  "subscriber-confirmed": "Subscriber marked as confirmed (double opt-in recorded).",
  "subscriber-pending": "Subscriber returned to pending — no dispatch will be sent until they confirm.",
  "subscriber-unsubscribed": "Consent withdrawn. The subscriber is now suppressed from every send.",
  "subscriber-erased": "Subscriber erased from the list."
};

const ERROR_MESSAGES: Record<string, string> = {
  "sync-failed": "Neon synchronization failed. Check DATABASE_URL and the database schema. No partial catalog update was applied.",
  "invalid-subscriber": "Provide a valid email, archetype and source (100 characters maximum).",
  "missing-title": "Article title is required.",
  "invalid-gumroad-url": "Gumroad URL must be a valid http:// or https:// URL.",
  "unknown-product": "Unknown product — only the two Gumroad editions can be edited here.",
  "invalid-affiliate": "Please provide a name, merchant, and valid http(s) URL."
};

export default async function AdminDashboard({
  searchParams
}: {
  searchParams?: {
    tab?: string;
    segment?: string;
    product?: string;
    edit?: string;
    editAffiliate?: string;
    notice?: string;
    error?: string;
  };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [articles, products, affiliateLinks, subscribers, subscriberStats] = await Promise.all([
    getAllArticles(),
    getAllProducts(),
    getAffiliateLinks(),
    getSubscribers(),
    getSubscriberStats()
  ]);

  const publishedCount = articles.filter((a) => a.status === "published").length;
  const audits = new Map(articles.map((article) => [article.id, auditArticle(article)]));
  const published = articles.filter((a) => a.status === "published");
  const totalWords = published.reduce((sum, a) => sum + audits.get(a.id)!.words, 0);
  const totalFigures = published.reduce((sum, a) => sum + audits.get(a.id)!.figures, 0);
  const averageSeo = articles.length ? Math.round([...audits.values()].reduce((sum, a) => sum + a.score, 0) / articles.length) : 0;
  const quizCount = subscribers.filter((s) => s.source === "villainess-quiz" || contactSegment(s.archetype) !== "dispatch").length;
  const segments = ["widow", "siren", "heiress", "muse", "dispatch"] as const;
  const segment = segments.find((value) => value === searchParams?.segment);
  const inSegment = (archetype: string | null, key: string) => contactSegment(archetype) === key;
  const filteredSubscribers = segment ? subscribers.filter((s) => inSegment(s.archetype, segment)) : subscribers;
  const latestArticle = [...published].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
  const leaderboard = [...affiliateLinks].sort((a, b) => b.clicks - a.clicks);
  const maxClicks = Math.max(1, ...leaderboard.map((a) => a.clicks));
  const totalClicks = affiliateLinks.reduce((sum, item) => sum + (item.clicks || 0), 0);

  const activeTab = searchParams?.tab || (searchParams?.edit ? "editor" : "articles");
  const editingArticle = searchParams?.edit
    ? await getArticleById(searchParams.edit)
    : null;
  const editingAffiliate = searchParams?.editAffiliate
    ? affiliateLinks.find((a) => a.id === searchParams.editAffiliate) || null
    : null;

  const noticeText = searchParams?.notice ? NOTICE_MESSAGES[searchParams.notice] : null;
  const errorText = searchParams?.error ? ERROR_MESSAGES[searchParams.error] : null;

  return (
    <div className="px-[6%] py-12 min-h-screen bg-cream text-nearblack max-w-7xl mx-auto">
      {/* Top header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-nearblack/15">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-cinzel text-xs tracking-[0.2em] uppercase text-oxblood">
              The Oxblood Edit · CMS
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 font-cinzel tracking-wider uppercase ${
                hasDatabaseUrl
                  ? "bg-oxblood text-cream"
                  : "bg-gold/30 text-nearblack border border-gold"
              }`}
            >
              {hasDatabaseUrl ? "Neon PostgreSQL" : "Local Store Mode"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl">Editorial Command Center</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-nearblack/75">
            Signed in as <strong>{session.user.email}</strong>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-nearblack px-4 py-2 font-cinzel text-xs tracking-widest uppercase hover:bg-nearblack hover:text-cream transition-colors cursor-pointer bg-transparent"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Notices & Errors */}
      {noticeText && (
        <div className="mt-6 border-l-4 border-gold bg-white px-4 py-3 text-nearblack shadow-sm">
          {noticeText}
        </div>
      )}
      {errorText && (
        <div className="mt-6 border-l-4 border-oxblood bg-oxblood/10 px-4 py-3 text-oxblood font-medium">
          {errorText}
        </div>
      )}

      <section className={`mt-6 p-5 border ${articles.length < 9 ? "border-oxblood bg-oxblood/10" : "border-gold bg-white"}`} aria-label="Catalog synchronization">
        {articles.length < 9 && <p role="alert" className="font-semibold mb-3">Incomplete catalog: {articles.length}/9 pillar articles. Upgrade in one click.</p>}
        <form action={syncCatalogAction}><CatalogSyncButton enabled={hasDatabaseUrl} /></form>
        <p className="text-xs mt-3">Restores the seeded editorial entries and staggered publication dates. Replaces edits to these entries; keeps click counts and contacts. {!hasDatabaseUrl && "Configure DATABASE_URL to enable Neon synchronization."}</p>
      </section>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-8">
        {[
          { label: "Published chapters", value: publishedCount, detail: `${totalWords.toLocaleString("en-GB")} words · ${totalFigures} 16:9 figures` },
          { label: "Average SEO health", value: `${averageSeo}%`, detail: "Editorial completeness heuristic, not a Google score" },
          { label: "Gumroad products", value: products.length, detail: "$27 · $19 / £15 editions" },
          { label: "UK / US affiliate pieces", value: affiliateLinks.length, detail: "£ GBP / $ USD" },
          { label: "Affiliate outbound clicks", value: totalClicks, detail: "Includes tracked test clicks" },
          { label: "CRM contacts", value: subscriberStats.total, detail: `${quizCount} Quiz · ${subscribers.length - quizCount} Dispatch` }
        ].map((kpi) => <div key={kpi.label} className="bg-white p-4 border-t-4 border-oxblood shadow-sm">
          <p className="font-cinzel text-xs uppercase text-nearblack/70">{kpi.label}</p>
          <strong className="text-3xl block mt-2">{kpi.value}</strong>
          <p className="text-xs mt-2 text-nearblack/70">{kpi.detail}</p>
        </div>)}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mt-8 border-b border-nearblack/15 pb-3">
        <Link
          href="/admin?tab=articles"
          className={`px-4 py-2.5 font-cinzel text-xs tracking-widest uppercase no-underline transition-colors ${
            activeTab === "articles"
              ? "bg-nearblack text-cream"
              : "bg-white text-nearblack hover:bg-nearblack/10"
          }`}
        >
          Articles ({articles.length})
        </Link>
        <Link
          href="/admin?tab=editor"
          className={`px-4 py-2.5 font-cinzel text-xs tracking-widest uppercase no-underline transition-colors ${
            activeTab === "editor"
              ? "bg-oxblood text-cream"
              : "bg-white text-nearblack hover:bg-nearblack/10"
          }`}
        >
          {editingArticle ? "Edit Article" : "+ New Article"}
        </Link>
        <Link
          href="/admin?tab=product"
          className={`px-4 py-2.5 font-cinzel text-xs tracking-widest uppercase no-underline transition-colors ${
            activeTab === "product"
              ? "bg-nearblack text-cream"
              : "bg-white text-nearblack hover:bg-nearblack/10"
          }`}
        >
          Gumroad Products ({products.length})
        </Link>
        <Link
          href="/admin?tab=affiliates"
          className={`px-4 py-2.5 font-cinzel text-xs tracking-widest uppercase no-underline transition-colors ${
            activeTab === "affiliates"
              ? "bg-nearblack text-cream"
              : "bg-white text-nearblack hover:bg-nearblack/10"
          }`}
        >
          Affiliate Curation ({affiliateLinks.length})
        </Link>
        <Link
          href="/admin?tab=subscribers"
          className={`px-4 py-2.5 font-cinzel text-xs tracking-widest uppercase no-underline transition-colors ${
            activeTab === "subscribers"
              ? "bg-nearblack text-cream"
              : "bg-white text-nearblack hover:bg-nearblack/10"
          }`}
        >
          Subscribers ({subscriberStats.total})
        </Link>
      </div>

      {/* TAB 1: ARTICLES LIST */}
      {activeTab === "articles" && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl">Editorial Stories</h2>
              <p className="text-nearblack/75">
                Publish, unpublish, edit, or delete journal articles. SEO audit: title, slug, cover, metadata length (20–65 / 80–160), 300+ words, 2+ 16:9 figures, 2+ internal links, headings and image alt text (10 points each).
              </p>
            </div>
            <Link href="/admin?tab=editor" className="btn-gold">
              + WRITE NEW ARTICLE
            </Link>
          </div>

          <div className="bg-white border border-nearblack/15 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nearblack/15 bg-nearblack text-cream font-cinzel text-xs tracking-wider uppercase">
                  <th className="py-3.5 px-4">Title &amp; Slug</th>
                  <th className="py-3.5 px-4">SEO Audit</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nearblack/10">
                {articles.map((article) => {
                  const isPublished = article.status === "published";
                  const audit = audits.get(article.id)!;
                  return (
                    <tr key={article.id} className="hover:bg-cream/30">
                      <td className="py-4 px-4">
                        {article.cover_image && <img src={article.cover_image} alt={article.title} loading="lazy" className="aspect-video w-40 object-cover mb-3" />}
                        <p className="font-semibold text-lg leading-snug">{article.title}</p>
                        <p className="text-sm text-nearblack/60 font-mono">/journal/{article.slug}</p>
                        {article.excerpt && (
                          <p className="text-sm text-nearblack/75 mt-1 line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <strong className="text-oxblood">{audit.score}%</strong>
                        <p>{audit.words} words</p><p>{audit.figures} figures 16:9</p><p>{audit.internalLinks} internal links</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-cinzel text-xs uppercase tracking-widest px-2.5 py-1 bg-cream border border-gold/50">
                          {getCategoryLabel(article.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block font-cinzel text-xs uppercase tracking-widest px-2.5 py-1 ${
                            isPublished
                              ? "bg-gold/25 text-nearblack border border-gold"
                              : "bg-oxblood/15 text-oxblood border border-oxblood/30"
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <CopyPinterestUtmButton slug={article.slug} category={article.category} />
                          <form action={toggleArticleStatusAction}>
                            <input type="hidden" name="id" value={article.id} />
                            <input type="hidden" name="slug" value={article.slug} />
                            <input
                              type="hidden"
                              name="next_status"
                              value={isPublished ? "draft" : "published"}
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 font-cinzel text-xs tracking-wider uppercase border border-nearblack/30 bg-cream/60 hover:bg-nearblack hover:text-cream transition-colors cursor-pointer"
                            >
                              {isPublished ? "Unpublish" : "Publish"}
                            </button>
                          </form>

                          <Link
                            href={`/admin?tab=editor&edit=${article.id}`}
                            className="px-3 py-1.5 font-cinzel text-xs tracking-wider uppercase border border-nearblack/30 bg-white hover:bg-gold hover:text-nearblack no-underline"
                          >
                            Edit
                          </Link>

                          {isPublished && (
                            <Link
                              href={`/journal/${article.slug}`}
                              className="px-3 py-1.5 font-cinzel text-xs tracking-wider uppercase border border-nearblack/30 bg-white hover:bg-cream no-underline"
                            >
                              View
                            </Link>
                          )}

                          <form action={deleteArticleAction}>
                            <input type="hidden" name="id" value={article.id} />
                            <input type="hidden" name="slug" value={article.slug} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 font-cinzel text-xs tracking-wider uppercase border border-oxblood/40 text-oxblood bg-white hover:bg-oxblood hover:text-cream transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-nearblack/70">
                      No editorial articles yet. Click &ldquo;+ Write New Article&rdquo; to create your first story.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ARTICLE EDITOR */}
      {activeTab === "editor" && (
        <div className="mt-8 bg-white p-8 border-t-4 border-oxblood shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl">
                {editingArticle ? `Editing: ${editingArticle.title}` : "Create New Editorial Story"}
              </h2>
              <p className="text-nearblack/70 text-sm">
                HTML content is automatically sanitized on save to prevent XSS vulnerabilities.
              </p>
            </div>
            <Link
              href="/admin?tab=articles"
              className="font-cinzel text-xs tracking-widest uppercase text-oxblood hover:underline"
            >
              ← Back to Articles
            </Link>
          </div>

          <form action={saveArticleAction} className="grid gap-5">
            {editingArticle && <input type="hidden" name="id" value={editingArticle.id} />}

            <div className="grid md:grid-cols-2 gap-5">
              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  Article Title *
                </span>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingArticle?.title || ""}
                  placeholder="e.g. The Oxblood Velvet Evening Coat Formula"
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  URL Slug (auto-generated if left blank)
                </span>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingArticle?.slug || ""}
                  placeholder="the-oxblood-velvet-evening-coat-formula"
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base font-mono focus:border-oxblood focus:outline-none"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  Editorial Category
                </span>
                <select
                  name="category"
                  defaultValue={editingArticle?.category || "style"}
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                >
                  {EDITORIAL_CATEGORIES.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label} — {category.blurb}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  Publication Status
                </span>
                <select
                  name="status"
                  defaultValue={editingArticle?.status || "draft"}
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                >
                  <option value="published">Published (Live on Journal)</option>
                  <option value="draft">Draft (Hidden from public)</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                Editorial Excerpt / Dek
              </span>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={editingArticle?.excerpt || ""}
                placeholder="A concise summary displayed on the homepage and journal listing..."
                className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
              />
            </label>

            <ImageUploadField
              name="cover_image"
              defaultValue={editingArticle?.cover_image || ""}
              label="Cover Image (URL or Direct Upload)"
            />

            <div className="grid md:grid-cols-2 gap-5">
              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  SEO Meta Title
                </span>
                <input
                  type="text"
                  name="meta_title"
                  defaultValue={editingArticle?.meta_title || ""}
                  placeholder="Optional custom <title> for search engines"
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  SEO Meta Description
                </span>
                <input
                  type="text"
                  name="meta_description"
                  defaultValue={editingArticle?.meta_description || ""}
                  placeholder="Optional custom meta description (150-160 chars)"
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                Article Body (HTML)
              </span>
              <textarea
                name="content_html"
                rows={12}
                defaultValue={
                  editingArticle?.content_html ||
                  "<h2>Section Heading</h2>\n<p>Write your editorial story here...</p>"
                }
                className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-3 text-base font-mono focus:border-oxblood focus:outline-none"
              />
              <span className="block text-xs text-nearblack/65 mt-1">
                Allowed tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;,
                &lt;blockquote&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a href=&quot;...&quot;&gt;, &lt;img src=&quot;...&quot;&gt;.
              </span>
            </label>

            <div className="flex items-center gap-4 pt-2">
              <button type="submit" className="btn-gold border-0 cursor-pointer">
                {editingArticle ? "SAVE ARTICLE CHANGES" : "CREATE & SAVE ARTICLE"}
              </button>
              <Link
                href="/admin?tab=articles"
                className="px-5 py-3 font-cinzel text-xs tracking-widest uppercase border border-nearblack/30 no-underline hover:bg-cream"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: GUMROAD PRODUCTS — one independent form per edition */}
      {activeTab === "product" && (
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl mb-1">Gumroad Digital Editions</h2>
            <p className="text-nearblack/75 max-w-3xl">
              Each edition saves on its own: name, USD price, Gumroad checkout link, description and
              deliverables. Changes appear on <code>/</code>, <code>/shop/the-oxblood-code</code> and
              the journal callouts.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {products.map((product) => {
              if (!isProductSlug(product.slug)) return null;
              const slug = product.slug;
              const layout = PRODUCT_LAYOUTS[slug];
              const seed = PRODUCT_SEEDS[slug];
              const justSaved =
                searchParams?.notice === "product-saved" && searchParams?.product === slug;
              const currentUrl =
                product.gumroad_url && product.gumroad_url !== "__GUMROAD_URL__"
                  ? product.gumroad_url
                  : "";
              const fieldId = (name: string) => `${slug}-${name}`;

              return (
                <section
                  key={slug}
                  id={`product-${slug}`}
                  className={`bg-white p-7 border-t-4 shadow-sm ${
                    justSaved ? "border-oxblood ring-2 ring-gold/60" : "border-gold"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <p className="font-cinzel text-xs tracking-[0.2em] uppercase text-oxblood">
                      Edition {layout.edition}
                    </p>
                    <span className="font-cinzel text-xs tracking-wider uppercase px-2 py-0.5 bg-cream border border-gold/50">
                      {formatProductPrice(slug, product.price)}
                    </span>
                  </div>
                  <h3 className="text-xl mb-1 leading-snug">{layout.shortName}</h3>
                  <p className="text-sm text-nearblack/60 font-mono mb-5">slug: {slug}</p>

                  <form action={saveProductAction} className="grid gap-4">
                    <input type="hidden" name="slug" value={slug} />

                    <label className="block" htmlFor={fieldId("name")}>
                      <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                        Product Name
                      </span>
                      <input
                        id={fieldId("name")}
                        type="text"
                        name="name"
                        required
                        defaultValue={product.name || seed.name}
                        className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                      />
                    </label>

                    <label className="block" htmlFor={fieldId("price")}>
                      <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                        Price (USD)
                      </span>
                      <input
                        id={fieldId("price")}
                        type="number"
                        name="price"
                        min={0}
                        step={1}
                        required
                        defaultValue={product.price ?? seed.price}
                        className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                      />
                      {layout.priceGbp != null && (
                        <span className="block text-xs text-nearblack/65 mt-1">
                          Shown with its GBP companion price: £{layout.priceGbp}.
                        </span>
                      )}
                    </label>

                    <label className="block" htmlFor={fieldId("gumroad_url")}>
                      <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                        Gumroad Checkout URL
                      </span>
                      <input
                        id={fieldId("gumroad_url")}
                        type="url"
                        name="gumroad_url"
                        defaultValue={currentUrl}
                        placeholder={seed.gumroad_url}
                        className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                      />
                      <span className="block text-xs text-nearblack/65 mt-1 break-all">
                        Leave empty to use the house link: {seed.gumroad_url}
                      </span>
                    </label>

                    <label className="block" htmlFor={fieldId("description")}>
                      <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                        Product Description
                      </span>
                      <textarea
                        id={fieldId("description")}
                        name="description"
                        rows={5}
                        defaultValue={product.description || seed.description}
                        className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                      />
                    </label>

                    <label className="block" htmlFor={fieldId("what_inside")}>
                      <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                        What&rsquo;s Inside (One deliverable per line)
                      </span>
                      <textarea
                        id={fieldId("what_inside")}
                        name="what_inside"
                        rows={7}
                        defaultValue={(product.what_inside.length > 0
                          ? product.what_inside
                          : seed.what_inside
                        ).join("\n")}
                        className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-4">
                      <button type="submit" className="btn-gold border-0 cursor-pointer">
                        UPDATE EDITION {layout.edition}
                      </button>
                      <a
                        href={`/shop/the-oxblood-code#${slug}`}
                        className="font-cinzel text-xs tracking-widest uppercase text-oxblood underline"
                      >
                        View on site
                      </a>
                    </div>
                  </form>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: AFFILIATE LINKS CURATION */}
      {activeTab === "affiliates" && (
        <div className="mt-8 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <h2 className="text-2xl mb-1">Curated Affiliate Pieces</h2>
            <p className="text-nearblack/75 mb-4">
              Outbound clicks are tracked via <code className="text-xs">/api/affiliate/[id]</code>.
            </p>

            <section aria-label="UK and US affiliate leaderboard" className="bg-white border border-gold p-5 mb-5">
              <h3 className="text-xl mb-3">UK (£) / US ($) Click Leaderboard</h3>
              <p className="text-xs mb-3">Illustrative editorial plates and indicative prices. Seed links point to merchant homepages; replace with approved affiliate product URLs before promotion.</p>
              {leaderboard.map((item) => <div key={item.id} className="mb-4">
                <div className="flex justify-between gap-3 text-sm"><span>{item.name} · {item.price_uk} / {item.price_us}</span><strong>{item.clicks} clicks</strong></div>
                <div role="progressbar" aria-label={`${item.name} clicks relative to leader`} aria-valuemin={0} aria-valuemax={maxClicks} aria-valuenow={item.clicks} className="bg-cream h-3 mt-2">
                  <div className="bg-oxblood h-3" style={{ width: `${item.clicks / maxClicks * 100}%` }} />
                </div>
              </div>)}
              {leaderboard.length === 0 && <p>No affiliate pieces yet.</p>}
            </section>
            <div className="bg-white border border-nearblack/15 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-nearblack/15 bg-nearblack text-cream font-cinzel text-xs tracking-wider uppercase">
                    <th className="py-3 px-4">Piece &amp; Merchant</th>
                    <th className="py-3 px-4">US / UK Price</th>
                    <th className="py-3 px-4">Clicks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nearblack/10">
                  {affiliateLinks.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/30">
                      <td className="py-3.5 px-4">
                        {item.image && <img src={item.image} alt={item.name} loading="lazy" className="aspect-video w-32 object-cover mb-2" />}
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs uppercase tracking-wider text-oxblood">
                          {item.merchant}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        {item.price_us || "—"} / {item.price_uk || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-cinzel font-semibold">{item.clicks}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <a href={`/api/affiliate/${item.id}`} target="_blank" rel="noopener noreferrer" className="text-xs underline" title="Records a tracked outbound click">Test ↗</a>
                          <Link
                            href={`/admin?tab=affiliates&editAffiliate=${item.id}`}
                            className="px-2.5 py-1 font-cinzel text-xs uppercase border border-nearblack/30 bg-white hover:bg-gold no-underline"
                          >
                            Edit
                          </Link>
                          <form action={deleteAffiliateLinkAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="px-2.5 py-1 font-cinzel text-xs uppercase border border-oxblood/40 text-oxblood bg-white hover:bg-oxblood hover:text-cream cursor-pointer"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {affiliateLinks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-nearblack/70">
                        No affiliate links added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 border-t-4 border-oxblood shadow-sm h-fit">
            <h3 className="text-xl mb-4">
              {editingAffiliate ? "Edit Affiliate Piece" : "Add Affiliate Piece"}
            </h3>
            <form action={saveAffiliateLinkAction} className="grid gap-4">
              {editingAffiliate && (
                <input type="hidden" name="id" value={editingAffiliate.id} />
              )}

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1">
                  Garment / Product Name *
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingAffiliate?.name || ""}
                  placeholder="e.g. Oxblood Silk Bias Midi Skirt"
                  className="w-full border border-nearblack/25 bg-cream/30 px-3 py-2 text-base"
                />
              </label>

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1">
                  Merchant / House *
                </span>
                <input
                  type="text"
                  name="merchant"
                  required
                  defaultValue={editingAffiliate?.merchant || ""}
                  placeholder="e.g. Net-a-Porter / Selfridges"
                  className="w-full border border-nearblack/25 bg-cream/30 px-3 py-2 text-base"
                />
              </label>

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1">
                  Destination Affiliate URL *
                </span>
                <input
                  type="url"
                  name="url"
                  required
                  defaultValue={editingAffiliate?.url || ""}
                  placeholder="https://..."
                  className="w-full border border-nearblack/25 bg-cream/30 px-3 py-2 text-base"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block font-cinzel text-xs tracking-widest uppercase mb-1">
                    US Price
                  </span>
                  <input
                    type="text"
                    name="price_us"
                    defaultValue={editingAffiliate?.price_us || ""}
                    placeholder="$298"
                    className="w-full border border-nearblack/25 bg-cream/30 px-3 py-2 text-base"
                  />
                </label>

                <label className="block">
                  <span className="block font-cinzel text-xs tracking-widest uppercase mb-1">
                    UK Price
                  </span>
                  <input
                    type="text"
                    name="price_uk"
                    defaultValue={editingAffiliate?.price_uk || ""}
                    placeholder="£248"
                    className="w-full border border-nearblack/25 bg-cream/30 px-3 py-2 text-base"
                  />
                </label>
              </div>

              <ImageUploadField
                name="image"
                defaultValue={editingAffiliate?.image || ""}
                label="Product Image (Optional)"
              />

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-gold border-0 cursor-pointer">
                  {editingAffiliate ? "SAVE CHANGES" : "ADD AFFILIATE PIECE"}
                </button>
                {editingAffiliate && (
                  <Link
                    href="/admin?tab=affiliates"
                    className="text-xs font-cinzel uppercase tracking-wider text-oxblood"
                  >
                    Cancel
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: NEWSLETTER SUBSCRIBERS */}
      {activeTab === "subscribers" && (
        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl">Dispatch Subscribers</h2>
              <p className="text-nearblack/75 max-w-2xl">
                Every row is a consent record: the wording shown, its version, the surface it came
                from and the moment of opt-in. Double opt-in stays <em>pending</em> until the
                confirmation link is opened.
              </p>
            </div>
          </div>
          <SubscriberCrmToolbar emails={subscribers.map((s) => s.email)} latestArticle={latestArticle ? { title: latestArticle.title, slug: latestArticle.slug, excerpt: latestArticle.excerpt } : null} />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
            {segments.map((key) => <Link key={key} href={`/admin?tab=subscribers${segment === key ? "" : `&segment=${key}`}`} aria-current={segment === key ? "page" : undefined} className={`p-4 border no-underline ${segment === key ? "bg-oxblood text-cream border-oxblood" : "bg-white border-gold text-nearblack"}`}>
              <span className="block uppercase text-xs">{CRM_SEGMENTS[key] ? ARCHETYPES[CRM_SEGMENTS[key]!].name : "Dispatch"}</span>
              <strong className="text-2xl">{subscribers.filter((s) => inSegment(s.archetype, key)).length}</strong>
            </Link>)}
          </div>
          <p className="text-sm mb-4">{segment ? `Filtered by ${segment}` : "All contacts"} · {filteredSubscribers.length} contacts <Link href="/admin?tab=subscribers" className="underline ml-3">Clear filter</Link></p>
          <form action={addSubscriberAdminAction} className="bg-white border border-nearblack/15 p-5 mb-7">
            <h3 className="text-xl mb-3">Add a VIP contact</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <label>Email<input type="email" name="email" required maxLength={254} className="block w-full border p-2" /></label>
              <label>Archetype<select name="archetype" defaultValue="dispatch" className="block w-full border p-2">{segments.map((key) => <option key={key} value={key}>{key}</option>)}</select></label>
              <label>Source<input name="source" required maxLength={100} defaultValue="admin-vip" className="block w-full border p-2" /></label>
            </div>
            <p className="text-xs my-3">Added as pending, with no newsletter consent asserted. Duplicate emails leave the existing contact untouched.</p>
            <button type="submit" className="btn-gold">Add VIP contact</button>
          </form>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
            <div className="bg-white p-5 border-t-4 border-nearblack shadow-sm">
              <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
                Total
              </p>
              <strong className="text-3xl font-cinzel block mt-2">{subscriberStats.total}</strong>
            </div>
            <div className="bg-white p-5 border-t-4 border-gold shadow-sm">
              <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
                Confirmed
              </p>
              <strong className="text-3xl font-cinzel block mt-2">
                {subscriberStats.confirmed}
              </strong>
            </div>
            <div className="bg-white p-5 border-t-4 border-gold/50 shadow-sm">
              <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
                Pending
              </p>
              <strong className="text-3xl font-cinzel block mt-2">{subscriberStats.pending}</strong>
            </div>
            <div className="bg-white p-5 border-t-4 border-oxblood shadow-sm">
              <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
                Withdrawn
              </p>
              <strong className="text-3xl font-cinzel block mt-2">
                {subscriberStats.unsubscribed}
              </strong>
            </div>
            <div className="bg-white p-5 border-t-4 border-nearblack/40 shadow-sm">
              <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
                Last 7 days
              </p>
              <strong className="text-3xl font-cinzel block mt-2">
                {subscriberStats.last7Days}
              </strong>
            </div>
          </div>

          {subscriberStats.byArchetype.length > 0 && (
            <div className="bg-white border border-nearblack/15 shadow-sm p-5 mb-7">
              <p className="font-cinzel text-xs tracking-widest uppercase text-nearblack/70 mb-3">
                Dossiers requested by archetype
              </p>
              <div className="flex flex-wrap gap-2.5">
                {subscriberStats.byArchetype.map((row) => (
                  <span
                    key={row.archetype}
                    className="font-cinzel text-xs uppercase tracking-widest px-3 py-1.5 bg-cream border border-gold/50"
                  >
                    {isArchetypeKey(row.archetype)
                      ? ARCHETYPES[row.archetype].name
                      : row.archetype}{" "}
                    · {row.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-nearblack/15 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nearblack/15 bg-nearblack text-cream font-cinzel text-xs tracking-wider uppercase">
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Dossier</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nearblack/10">
                {filteredSubscribers.map((subscriber) => {
                  const isConfirmed = subscriber.status === "confirmed";
                  const isWithdrawn = subscriber.status === "unsubscribed";
                  return (
                    <tr key={subscriber.id} className="hover:bg-cream/30">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold break-all">{subscriber.email}</p>
                        {subscriber.ip_hash && (
                          <p className="text-xs text-nearblack/50 font-mono">
                            consent ip hash {subscriber.ip_hash.slice(0, 12)}…
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        {subscriber.archetype && isArchetypeKey(subscriber.archetype)
                          ? ARCHETYPES[subscriber.archetype].name
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-mono">{subscriber.source}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block font-cinzel text-xs uppercase tracking-widest px-2.5 py-1 ${
                            isConfirmed
                              ? "bg-gold/25 text-nearblack border border-gold"
                              : isWithdrawn
                                ? "bg-nearblack/10 text-nearblack/70 border border-nearblack/25"
                                : "bg-oxblood/15 text-oxblood border border-oxblood/30"
                          }`}
                        >
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-nearblack/75">
                        <p>{new Date(subscriber.consented_at).toLocaleString("en-GB")}</p>
                        <p className="text-xs font-mono text-nearblack/55">
                          {subscriber.consent_version}
                        </p>
                        {subscriber.confirmed_at && (
                          <p className="text-xs text-nearblack/55">
                            confirmed {new Date(subscriber.confirmed_at).toLocaleDateString("en-GB")}
                          </p>
                        )}
                        {subscriber.unsubscribed_at && (
                          <p className="text-xs text-oxblood/80">
                            withdrawn{" "}
                            {new Date(subscriber.unsubscribed_at).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {!isConfirmed && (
                            <form action={updateSubscriberStatusAction}>
                              <input type="hidden" name="id" value={subscriber.id} />
                              <input type="hidden" name="status" value="confirmed" />
                              <button
                                type="submit"
                                className="px-2.5 py-1 font-cinzel text-xs uppercase border border-nearblack/30 bg-white hover:bg-gold cursor-pointer"
                              >
                                Confirm
                              </button>
                            </form>
                          )}
                          {!isWithdrawn && (
                            <form action={updateSubscriberStatusAction}>
                              <input type="hidden" name="id" value={subscriber.id} />
                              <input type="hidden" name="status" value="unsubscribed" />
                              <button
                                type="submit"
                                className="px-2.5 py-1 font-cinzel text-xs uppercase border border-nearblack/30 bg-white hover:bg-cream cursor-pointer"
                              >
                                Suppress
                              </button>
                            </form>
                          )}
                          <form action={deleteSubscriberAction}>
                            <input type="hidden" name="id" value={subscriber.id} />
                            <button
                              type="submit"
                              className="px-2.5 py-1 font-cinzel text-xs uppercase border border-oxblood/40 text-oxblood bg-white hover:bg-oxblood hover:text-cream cursor-pointer"
                            >
                              Erase
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-nearblack/70">
                      No contacts in this segment. Clear the filter or add a VIP contact.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-nearblack/65 mt-5 max-w-3xl">
            UK GDPR: consent is the lawful basis (Art. 6(1)(a)). <strong>Suppress</strong> keeps the
            withdrawal on record so no further send reaches that address; <strong>Erase</strong>{" "}
            removes the record entirely for a right-to-erasure request. The public notice is at{" "}
            <a href="/privacy" className="text-oxblood underline">
              /privacy
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
