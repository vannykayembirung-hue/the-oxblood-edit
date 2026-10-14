/**
 * The editorial desk — E-E-A-T identity for The Oxblood Edit.
 *
 * Google's Search Quality Rater Guidelines want to know *who* is responsible
 * for a page and *why* they are qualified to write it (Experience, Expertise,
 * Authoritativeness, Trust). Every journal story therefore carries a named,
 * credentialed byline, the About page carries the desk's CV, and the article
 * JSON-LD publishes `author` as a Person — not as an anonymous Organization.
 *
 * The same data backs /editorial-standards, which is the page an ASA/CAP or FTC
 * reviewer is pointed at when they ask how a recommendation was arrived at.
 */

export interface DeskAuthor {
  slug: string;
  name: string;
  role: string;
  /** Where the desk works from — a UK/US publication says this out loud. */
  based: string;
  /** One paragraph, first person, for the byline block. */
  bio: string;
  /** Longer, for /about and /editorial-standards. */
  longBio: string[];
  credentials: string[];
  expertise: string[];
  /** Person.sameAs — filled in once the desk's public profiles exist. */
  sameAs: string[];
  signature: string;
  contactEmail: string;
}

export const CLARA_VANCE: DeskAuthor = {
  slug: "clara-vance",
  name: "Clara Vance",
  role: "Founder & Editor-in-Chief, The Oxblood Edit",
  based: "London & New York — US and UK wardrobes",
  bio:
    "Clara Vance writes every pillar formula on The Oxblood Edit herself. Fifteen years across luxury e-commerce styling and print fashion desks, a heritage tailoring apprenticeship in hand-finishing, and a wardrobe that has been returned, re-worn and repaired in front of you.",
  longBio: [
    "Clara Vance founded The Oxblood Edit after fifteen years moving between luxury e-commerce styling, print fashion desks and a heritage tailoring workroom, where she learned to read a garment from the inside out: lining composition, button material, the seam allowance at the shoulder.",
    "She writes the house's nine pillar formulas herself — the UK layering code, the British autumn formula, the 12-piece capsule, the US tailoring edit and the fit file that maps one formula across US 0–16 and UK 4–20. Everything recommended on the site has been worn in the weather it was bought for, in the size that was actually available, and audited against the fibre label before it appeared in a story.",
    "She works between London and New York, sizes US 6 / UK 10 in the house's own garments, and answers reader fit questions from the same address she publishes."
  ],
  credentials: [
    "15 years in luxury fashion editorial, styling and e-commerce buying",
    "Heritage tailoring apprenticeship — hand-finishing and garment construction",
    "Colour and fibre analysis: GSM, wool percentage, lining and hardware auditing",
    "Fit-testing across US 0–16 and UK 4–20, in-store and by post, on both markets",
    "Buyer-side experience of affiliate and paid-placement terms, disclosed in full"
  ],
  expertise: [
    "Dark-romantic tailoring and silhouette",
    "Fibre, construction and garment auditing",
    "UK 4–20 / US 0–16 fit translation",
    "Capsule wardrobes and cost-per-wear arithmetic",
    "Low-light colour grading and candlelit styling"
  ],
  sameAs: [],
  signature: "Clara Vance · The Oxblood Edit",
  contactEmail: "desk@theoxbloodedit.com"
};

/** Secondary trust signal shown next to the byline: who checked the copy. */
export const REVIEWED_BY = {
  name: "The Oxblood Edit editorial desk",
  role: "Fit and compliance review"
};

export const EDITORIAL_STANDARDS_LAST_UPDATED = "2026-10-14";
export const PRIVACY_NOTICE_LAST_UPDATED = "2026-10-14";

/** Person node reused by the article and homepage structured data. */
export function buildAuthorJsonLd() {
  return {
    "@type": "Person",
    name: CLARA_VANCE.name,
    jobTitle: CLARA_VANCE.role,
    description: CLARA_VANCE.bio,
    knowsAbout: CLARA_VANCE.expertise,
    hasCredential: CLARA_VANCE.credentials.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      name: credential
    })),
    email: CLARA_VANCE.contactEmail,
    ...(CLARA_VANCE.sameAs.length > 0 ? { sameAs: CLARA_VANCE.sameAs } : {})
  };
}

export function buildOrganizationJsonLd(siteUrl: string) {
  return {
    "@type": "Organization",
    name: "The Oxblood Edit",
    url: siteUrl,
    description:
      "An independent dark-romantic fashion, beauty and interiors publication, edited for US and UK wardrobes.",
    founder: buildAuthorJsonLd(),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial desk",
      email: CLARA_VANCE.contactEmail,
      areaServed: ["US", "GB"]
    },
    knowsAbout: CLARA_VANCE.expertise
  };
}
