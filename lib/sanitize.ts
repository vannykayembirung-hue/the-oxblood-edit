import sanitizeHtml from "sanitize-html";

/**
 * Dark Elegance editorial allowlist.
 *
 * `<figure>` and `<figcaption>` are first-class here: every article is edited
 * around 16:9 plates ("Plate I · …") and those captions must survive the round
 * trip through the CMS untouched.
 */
const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "hr",
  "blockquote",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "img",
  "figure",
  "figcaption",
  "span",
  "div",
  "code",
  "pre",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td"
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "name", "target", "rel", "title", "class"],
  img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding", "class"],
  // 16:9 editorial plates: figure + figcaption keep their styling hooks.
  figure: ["class"],
  figcaption: ["class"],
  "*": ["class"]
};

export function sanitizeEditorialHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return "";
  return sanitizeHtml(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"]
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal
              ? { target: "_blank", rel: "noopener noreferrer nofollow" }
              : {})
          }
        };
      },
      // Force every editorial image into the 16:9 plate treatment.
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          class: [attribs.class, "plate-img", "aspect-video"].filter(Boolean).join(" ")
        }
      })
    }
  });
}

export function isSafeHttpUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
