"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { PRODUCT_SEEDS, PRODUCT_SLUGS, formatProductPrice } from "@/lib/products";

const buttonClass = "px-3 py-2 text-sm border border-oxblood/30 bg-white hover:bg-gold cursor-pointer disabled:opacity-50";

export function CatalogSyncButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={!enabled || pending} className={buttonClass} onClick={(event) => {
    if (!window.confirm("Restore the 9 seed articles, 2 products and 6 affiliate pieces? This replaces edits to these catalog entries, but preserves affiliate click counts and all contacts.")) event.preventDefault();
  }}>{pending ? "Synchronizing…" : "↻ Sync 9 Articles + 2 Products + 6 Affiliates to Neon"}</button>;
}

export function CopyPinterestUtmButton({ slug, category }: { slug: string; category: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = new URL(`/journal/${encodeURIComponent(slug)}`, origin);
    url.search = new URLSearchParams({ utm_source: "pinterest", utm_medium: "organic_pin", utm_campaign: category }).toString();
    try { await navigator.clipboard.writeText(url.toString()); setMessage("URL copied"); }
    catch { setMessage("Clipboard unavailable. Copy the URL below."); }
  }
  return <div><button type="button" className={buttonClass} onClick={copy}>📌 Copy Pinterest UTM</button>
    <p role="status" className="text-xs mt-1">{message}</p>
    {message.startsWith("Clipboard") && <input aria-label="Pinterest URL" readOnly onFocus={(e) => e.target.select()} value={`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/journal/${encodeURIComponent(slug)}?${new URLSearchParams({ utm_source: "pinterest", utm_medium: "organic_pin", utm_campaign: category })}`} />}
  </div>;
}

export function SubscriberCrmToolbar({ emails, latestArticle }: {
  emails: string[];
  latestArticle: { title: string; slug: string; excerpt: string | null } | null;
}) {
  const [message, setMessage] = useState("");
  const [composer, setComposer] = useState<string | null>(null);
  const [emailFallback, setEmailFallback] = useState(false);
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setMessage("Copied to clipboard."); }
    catch { setMessage("Clipboard unavailable — select and copy the text manually."); setEmailFallback(true); }
  }
  function openComposer() {
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    setComposer(`Subject: The Sunday Dispatch — ${latestArticle?.title || "Your next dark-elegance chapter"}\n\nDear reader,\n\nThis week at The Oxblood Edit:\n${latestArticle ? `${latestArticle.title}\n${latestArticle.excerpt || "A new note from the editorial desk."}\n${origin}/journal/${encodeURIComponent(latestArticle.slug)}` : `Explore the journal: ${origin}/journal`}\n\nBuild your wardrobe with our two instant-download editions:\n${PRODUCT_SLUGS.map((slug) => `${PRODUCT_SEEDS[slug].name} — ${formatProductPrice(slug, PRODUCT_SEEDS[slug].price)}\n${PRODUCT_SEEDS[slug].gumroad_url}`).join("\n\n")}\n\nUntil next Sunday,\nThe Oxblood Edit editorial desk\n\ndesk@theoxbloodedit.com\nYou received this because you opted into The Sunday Dispatch. Add Gumroad’s recipient-specific unsubscribe link here before sending.`);
  }
  return <section aria-label="Audience CRM tools" className="bg-white border border-nearblack/15 p-5 mb-6">
    <div className="flex flex-wrap gap-3">
      <a className={buttonClass} href="/api/admin/subscribers/export?format=crm">⬇ Export CSV for Gumroad / MailerLite</a>
      <button type="button" className={buttonClass} onClick={() => copy(emails.join("\n"))}>📋 Copy All Email Addresses</button>
      <button type="button" className={buttonClass} onClick={openComposer}>✉ Open Sunday Dispatch Composer</button>
    </div>
    <p className="text-xs mt-3">Export and copy include ALL contacts, irrespective of the segment filter or consent status. This is a CRM backup, not a send list: exclude pending and withdrawn contacts before importing into a campaign. The full consent CSV remains available below.</p>
    <a className="underline text-xs" href="/api/admin/subscribers/export">Download full consent records (with status)</a>
    <p role="status" className="text-sm mt-2">{message}</p>
    {emailFallback && <textarea aria-label="All email addresses" readOnly value={emails.join("\n")} onFocus={(e) => e.target.select()} className="w-full border p-3 mt-3" />}
    {composer !== null && <div className="mt-4">
      <label htmlFor="dispatch-composer" className="block font-semibold">Sunday Dispatch — review, then paste into Gumroad Emails</label>
      <textarea id="dispatch-composer" className="w-full border border-nearblack/30 p-4 mt-2 text-sm" rows={18} value={composer} onChange={(e) => setComposer(e.target.value)} />
      <div className="flex gap-3 mt-2"><button type="button" className={buttonClass} onClick={() => copy(composer)}>Copy email template</button><button type="button" className={buttonClass} onClick={() => setComposer(null)}>Close composer</button></div>
    </div>}
  </section>;
}
