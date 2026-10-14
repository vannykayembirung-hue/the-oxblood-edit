import { ARCHETYPES, type Archetype, type ArchetypeKey } from "@/lib/villainess-quiz";

/**
 * Newsletter capture — consent, validation and the archetype dossier payload.
 *
 * Everything a UK GDPR / PECR reviewer asks for lives here as data rather than
 * as copy buried in a component:
 *
 *  - the *exact* consent wording and its version number are stored against the
 *    subscriber row (`consent_text`, `consent_version`, `consented_at`), so the
 *    desk can evidence what a reader agreed to and when;
 *  - consent is a positive opt-in only — there is no pre-ticked box, and the API
 *    rejects a request that does not assert `consent: true`;
 *  - the lawful basis is consent (UK GDPR Art. 6(1)(a)), the purpose is limited
 *    to the Sunday Dispatch and the archetype dossier, and the withdrawal route
 *    is published in every footer.
 */

export const NEWSLETTER_NAME = "The Sunday Dispatch";
export const NEWSLETTER_CONSENT_VERSION = "newsletter-consent/2026-10-14";

/** Rendered verbatim next to the opt-in — stored verbatim on the subscriber row. */
export const NEWSLETTER_CONSENT_TEXT =
  "I agree to The Oxblood Edit emailing me the archetype dossier download link and The Sunday Dispatch (roughly one email a week). I can withdraw at any time with the unsubscribe link in every email or by writing to desk@theoxbloodedit.com. The desk never sells or shares my address.";

export const NEWSLETTER_PURPOSE =
  "Sending the requested archetype dossier and the weekly Sunday Dispatch. No other purpose, no third parties.";

export const NEWSLETTER_RETENTION =
  "Kept until you withdraw consent, then deleted within 30 days — the desk keeps only a hashed suppression record.";

export const SUBSCRIBE_SOURCES = [
  "villainess-quiz",
  "homepage",
  "footer",
  "journal",
  "shop"
] as const;

export type SubscribeSource = (typeof SUBSCRIBE_SOURCES)[number];

export interface DossierPayload {
  archetype: ArchetypeKey;
  archetypeName: string;
  roman: string;
  title: string;
  dek: string;
  chapters: Archetype["dossier"]["chapters"];
  keyPieces: Archetype["dossier"]["keyPieces"];
  care: string;
  uniform: string;
  lip: string;
  book: string;
  palette: Archetype["palette"];
  formula: string[];
  articleSlug: string;
  articleLabel: string;
}

export function isArchetypeKey(value: unknown): value is ArchetypeKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(ARCHETYPES, value);
}

export function resolveArchetype(value: unknown): ArchetypeKey | null {
  return isArchetypeKey(value) ? value : null;
}

export function buildDossierPayload(key: ArchetypeKey): DossierPayload {
  const archetype = ARCHETYPES[key];
  return {
    archetype: archetype.key,
    archetypeName: archetype.name,
    roman: archetype.roman,
    title: archetype.dossier.title,
    dek: archetype.dossier.dek,
    chapters: archetype.dossier.chapters,
    keyPieces: archetype.dossier.keyPieces,
    care: archetype.dossier.care,
    uniform: archetype.uniform,
    lip: archetype.lip,
    book: archetype.book,
    palette: archetype.palette,
    formula: archetype.formula,
    articleSlug: archetype.articleSlug,
    articleLabel: archetype.articleLabel
  };
}

/** Pragmatic RFC-5322-ish check: one @, no spaces, a dotted TLD, sane lengths. */
const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

export function normalizeEmail(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

/**
 * For the confirmation copy in the UI — never to render a full address back.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  const visible = local.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(2, Math.min(local.length - 1, 6)))}@${domain}`;
}
