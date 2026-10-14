import sanitizeHtml from "sanitize-html";
import type { ArticleRecord } from "@/lib/db";

/** Editorial completeness heuristic, not a Google ranking or E-E-A-T score. */
export function auditArticle(article: ArticleRecord) {
  const html = article.content_html || "";
  const text = sanitizeHtml(html.replace(/<\/(?:p|h[1-6]|li|td|th|figcaption|blockquote)>|<br\s*\/?>/gi, " "), { allowedTags: [], allowedAttributes: {} }).replace(/&(?:#x[0-9a-f]+|#\d+|[a-z]+);/gi, " ");
  const words = text.match(/[\p{L}\p{N}]+(?:['’–-][\p{L}\p{N}]+)*/gu)?.length || 0;
  const figures = (html.match(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi) || []).filter(
    (figure) => /\baspect-video\b/i.test(figure) ||
      /<img\b(?=[^>]*\bwidth=["']1920["'])(?=[^>]*\bheight=["']1080["'])/i.test(figure)
  ).length;
  const internalLinks = (html.match(/<a\b[^>]*\bhref=["']\/[^/][^"']*["']/gi) || []).length;
  const checks = [
    !!article.title.trim(), !!article.slug, !!article.cover_image,
    (article.meta_title?.length || 0) >= 20 && (article.meta_title?.length || 0) <= 65,
    (article.meta_description?.length || 0) >= 80 && (article.meta_description?.length || 0) <= 160,
    words >= 300, figures >= 2, internalLinks >= 2,
    /<h2\b/i.test(html), /<img\b[^>]*\balt=["'][^"']+["']/i.test(html)
  ];
  return { words, figures, internalLinks, score: checks.filter(Boolean).length * 10 };
}
