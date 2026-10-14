import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  hasDatabaseUrl,
  getAllArticles,
  getArticleById,
  getProductBySlug,
  getAffiliateLinks
} from "@/lib/db";
import {
  logoutAction,
  saveArticleAction,
  toggleArticleStatusAction,
  deleteArticleAction,
  saveProductAction,
  saveAffiliateLinkAction,
  deleteAffiliateLinkAction
} from "@/app/admin/actions";
import ImageUploadField from "@/components/ImageUploadField";

export const dynamic = "force-dynamic";

const NOTICE_MESSAGES: Record<string, string> = {
  "article-saved": "Article saved and published paths revalidated.",
  "status-updated": "Article publication status updated.",
  "article-deleted": "Article removed from the catalog.",
  "product-saved": "Signature guide product details updated.",
  "affiliate-saved": "Affiliate piece saved.",
  "affiliate-deleted": "Affiliate piece removed."
};

const ERROR_MESSAGES: Record<string, string> = {
  "missing-title": "Article title is required.",
  "invalid-gumroad-url": "Gumroad URL must be a valid http:// or https:// URL.",
  "invalid-affiliate": "Please provide a name, merchant, and valid http(s) URL."
};

export default async function AdminDashboard({
  searchParams
}: {
  searchParams?: {
    tab?: string;
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

  const [articles, product, affiliateLinks] = await Promise.all([
    getAllArticles(),
    getProductBySlug("the-oxblood-code"),
    getAffiliateLinks()
  ]);

  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;
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

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="bg-white p-6 border-t-4 border-gold shadow-sm">
          <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
            Published Stories
          </p>
          <strong className="text-4xl font-cinzel block mt-2">{publishedCount}</strong>
        </div>
        <div className="bg-white p-6 border-t-4 border-oxblood shadow-sm">
          <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
            Drafts in Queue
          </p>
          <strong className="text-4xl font-cinzel block mt-2">{draftCount}</strong>
        </div>
        <div className="bg-white p-6 border-t-4 border-nearblack shadow-sm">
          <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
            Affiliate Pieces
          </p>
          <strong className="text-4xl font-cinzel block mt-2">{affiliateLinks.length}</strong>
        </div>
        <div className="bg-white p-6 border-t-4 border-gold shadow-sm">
          <p className="font-cinzel text-xs tracking-widest text-nearblack/70 uppercase">
            Tracked Outbound Clicks
          </p>
          <strong className="text-4xl font-cinzel block mt-2">{totalClicks}</strong>
        </div>
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
          Signature Guide Product
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
      </div>

      {/* TAB 1: ARTICLES LIST */}
      {activeTab === "articles" && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl">Editorial Stories</h2>
              <p className="text-nearblack/75">
                Publish, unpublish, edit, or delete journal articles.
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
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nearblack/10">
                {articles.map((article) => {
                  const isPublished = article.status === "published";
                  return (
                    <tr key={article.id} className="hover:bg-cream/30">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-lg leading-snug">{article.title}</p>
                        <p className="text-sm text-nearblack/60 font-mono">/journal/{article.slug}</p>
                        {article.excerpt && (
                          <p className="text-sm text-nearblack/75 mt-1 line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-cinzel text-xs uppercase tracking-widest px-2.5 py-1 bg-cream border border-gold/50">
                          {article.category}
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
                    <td colSpan={4} className="py-8 text-center text-nearblack/70">
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
                  <option value="style">Style</option>
                  <option value="capsule">Capsule Wardrobe</option>
                  <option value="beauty">Beauty</option>
                  <option value="interiors">Interiors</option>
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

      {/* TAB 3: SIGNATURE GUIDE PRODUCT */}
      {activeTab === "product" && (
        <div className="mt-8 bg-white p-8 border-t-4 border-gold shadow-sm max-w-3xl">
          <h2 className="text-2xl mb-1">Signature Guide Product Settings</h2>
          <p className="text-nearblack/75 mb-6">
            Configure the pricing, Gumroad checkout link, and deliverables for{" "}
            <strong>The Oxblood Code</strong>.
          </p>

          <form action={saveProductAction} className="grid gap-5">
            <input type="hidden" name="slug" value={product?.slug || "the-oxblood-code"} />

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  Product Name
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={product?.name || "The Oxblood Code"}
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                  Price (USD)
                </span>
                <input
                  type="number"
                  name="price"
                  min={0}
                  step={1}
                  required
                  defaultValue={product?.price ?? 27}
                  className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                Gumroad Checkout URL
              </span>
              <input
                type="url"
                name="gumroad_url"
                defaultValue={
                  product?.gumroad_url && product.gumroad_url !== "__GUMROAD_URL__"
                    ? product.gumroad_url
                    : ""
                }
                placeholder="https://yourstore.gumroad.com/l/the-oxblood-code"
                className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
              />
              <span className="block text-xs text-nearblack/65 mt-1">
                Leave empty until your live Gumroad product page is ready.
              </span>
            </label>

            <label className="block">
              <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                Product Description
              </span>
              <textarea
                name="description"
                rows={3}
                defaultValue={
                  product?.description ||
                  "A dark-romantic wardrobe system for timeless, intentional dressing."
                }
                className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="block font-cinzel text-xs tracking-widest uppercase mb-1.5">
                What&rsquo;s Inside (One deliverable per line)
              </span>
              <textarea
                name="what_inside"
                rows={6}
                defaultValue={(
                  product?.what_inside || [
                    "78 pages PDF",
                    "12 outfit formulas",
                    "Palette #6E1423",
                    "US 0-16 / UK 4-20",
                    "Printable checklist"
                  ]
                ).join("\n")}
                className="w-full border border-nearblack/25 bg-cream/30 px-3.5 py-2.5 text-base focus:border-oxblood focus:outline-none"
              />
            </label>

            <div>
              <button type="submit" className="btn-gold border-0 cursor-pointer">
                UPDATE PRODUCT GUIDE
              </button>
            </div>
          </form>
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
    </div>
  );
}
