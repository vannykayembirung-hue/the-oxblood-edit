import Link from "next/link";
import type { Metadata } from "next";
import WaxSeal from "@/components/WaxSeal";
import {
  CLARA_VANCE,
  EDITORIAL_STANDARDS_LAST_UPDATED,
  REVIEWED_BY,
  buildAuthorJsonLd
} from "@/lib/editorial-desk";
import { EDITORIAL_CATEGORIES, PILLAR_ARTICLES } from "@/lib/editorial-taxonomy";

export const metadata: Metadata = {
  title: "Editorial Standards, Testing and Corrections — The Oxblood Edit",
  description:
    "Who writes The Oxblood Edit, how every piece is bought, worn and measured before it is recommended, and how corrections, advertising and AI are handled.",
  alternates: { canonical: "/editorial-standards" }
};

const PILLARS = [
  {
    title: "Experience — the desk owns and wears what it recommends",
    lines: [
      "Every piece in a formula is bought by the desk, worn in the weather it was bought for, and returned when it fails. Where a garment is borrowed from a brand for photography, the story says so.",
      "The fit file in pillar IX is measured flat on the desk's own garments, twenty-four hours after a wear, across US 0–16 and UK 4–20."
    ]
  },
  {
    title: "Expertise — the person behind the byline",
    lines: [
      `${CLARA_VANCE.name}, ${CLARA_VANCE.role}, writes and signs every pillar formula.`,
      ...CLARA_VANCE.credentials
    ]
  },
  {
    title: "Authoritativeness — nine pillars, kept current",
    lines: [
      "The journal is organised as nine pillar stories, each with a named author, a named market (UK, US, or both) and a publication date. Pillars are reviewed each season; the review date appears in the byline block of every story.",
      "Nothing is published to a schedule that requires invention. If a story is not ready to be worn-tested, it is not published."
    ]
  },
  {
    title: "Trust — money, corrections and conduct",
    lines: [
      "Affiliate links are labelled where they appear, not only in the footer, and carry rel=\"sponsored\". We do not accept payment for placement and we do not run sponsored reviews.",
      "Corrections are published, not quietly made: a substantive change to a story updates its date and is logged on this page.",
      "AI assists with research sorting and scheduling; it does not write verdicts, does not choose pieces, and does not stand in for a fit test. No story is published under a byline that has not been through the desk."
    ]
  }
];

const AD_POLICY = [
  {
    label: "FTC (US)",
    body: "Affiliate relationships are disclosed clearly and conspicuously near the links, in language a reader understands, per the FTC's Endorsement Guides (16 CFR Part 255) and the native advertising guidance on deceptive formats."
  },
  {
    label: "ASA / CAP (UK)",
    body: "Affiliate content is marketing communication and is identified as such: affiliate blocks carry an \"Affiliate ad\" label and a plain-language disclosure, so the commercial nature of the content is obvious before the reader clicks (CAP Code rules 2.1 and 2.3)."
  },
  {
    label: "UK GDPR / PECR",
    body: "Email is sent on opt-in consent only, with the wording and its version stored against the subscriber record, double opt-in on every new address, and withdrawal honoured in one click."
  }
];

export default function EditorialStandardsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Editorial Standards, Testing and Corrections",
        url: "/editorial-standards",
        dateModified: EDITORIAL_STANDARDS_LAST_UPDATED,
        author: buildAuthorJsonLd(),
        reviewedBy: { "@type": "Organization", name: REVIEWED_BY.name }
      },
      buildAuthorJsonLd()
    ]
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="px-[6%] pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <WaxSeal size={44} />
            <p className="eyebrow">E-E-A-T · Experience, Expertise, Authority, Trust</p>
          </div>
          <h1 className="text-4xl sm:text-5xl mb-5">Editorial Standards</h1>
          <p className="text-xl text-parchment/78 max-w-3xl">
            Who writes the journal, how a piece earns a recommendation, and what happens when the
            desk gets something wrong. Reviewed {EDITORIAL_STANDARDS_LAST_UPDATED}.
          </p>
        </div>
      </section>

      {/* The desk */}
      <section className="px-[6%] py-6">
        <div className="max-w-4xl mx-auto velvet-card velvet-card--rule p-7 sm:p-9">
          <div className="flex flex-col sm:flex-row gap-7 items-start">
            <WaxSeal size={96} className="shrink-0" />
            <div>
              <p className="eyebrow mb-2">The signature</p>
              <h2 className="text-2xl sm:text-3xl mb-2">{CLARA_VANCE.name}</h2>
              <p className="text-lg italic text-gold/90 mb-4">{CLARA_VANCE.role}</p>
              {CLARA_VANCE.longBio.map((paragraph) => (
                <p key={paragraph} className="text-lg text-parchment/78 mb-4">
                  {paragraph}
                </p>
              ))}
              <p className="font-cinzel text-[0.66rem] tracking-[0.26em] uppercase text-parchment/60">
                {CLARA_VANCE.based}
              </p>
              <p className="text-base text-parchment/65 mt-3">
                Reviewed for fit and compliance by <strong>{REVIEWED_BY.name}</strong>. Write to{" "}
                <span className="text-gold">{CLARA_VANCE.contactEmail}</span>.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-px bg-gold/25 border border-gold/25 mt-8">
            <div className="bg-velvet p-6">
              <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-3">
                Expertise
              </p>
              <ul className="space-y-2 text-base text-parchment/75">
                {CLARA_VANCE.expertise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-velvet p-6">
              <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-3">
                Credentials
              </p>
              <ul className="space-y-2 text-base text-parchment/75">
                {CLARA_VANCE.credentials.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-velvet p-6">
              <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-3">
                Sections
              </p>
              <ul className="space-y-2 text-base text-parchment/75">
                {EDITORIAL_CATEGORIES.map((category) => (
                  <li key={category.key}>
                    <span className="text-parchment">{category.label}</span> — {category.blurb}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The four pillars of the argument */}
      <section className="px-[6%] py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {PILLARS.map((block) => (
            <article key={block.title} className="velvet-card p-7">
              <h2 className="text-xl mb-3">{block.title}</h2>
              <ul className="space-y-2.5">
                {block.lines.map((line) => (
                  <li key={line} className="text-lg text-parchment/72 flex gap-3">
                    <span className="text-oxblood mt-0.5 select-none">✦</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Advertising and consent rules */}
      <section className="px-[6%] py-8">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-3">Advertising, affiliate and consent compliance</p>
          <div className="grid sm:grid-cols-3 gap-px bg-gold/25 border border-gold/25">
            {AD_POLICY.map((rule) => (
              <div key={rule.label} className="bg-velvet p-6">
                <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-3">
                  {rule.label}
                </p>
                <p className="text-base text-parchment/75">{rule.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The run of pillars */}
      <section className="px-[6%] py-8">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-3">The nine pillars</p>
          <h2 className="text-2xl mb-6">What the journal actually is, in order</h2>
          <div className="velvet-inset p-6 overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead>
                <tr className="font-cinzel text-[0.62rem] tracking-[0.24em] uppercase text-gold/85">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Pillar</th>
                  <th className="py-2 pr-4">Section</th>
                  <th className="py-2 pr-4">Market</th>
                  <th className="py-2">Published</th>
                </tr>
              </thead>
              <tbody>
                {PILLAR_ARTICLES.map((pillar, index) => (
                  <tr key={pillar.slug} className="border-t border-gold/15">
                    <td className="py-2.5 pr-4 font-cinzel text-gold/85">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/journal/${pillar.slug}`}
                        className="text-parchment/85 hover:text-gold no-underline"
                      >
                        {pillar.title}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-parchment/70">
                      {EDITORIAL_CATEGORIES.find((c) => c.key === pillar.category)?.label ??
                        pillar.category}
                    </td>
                    <td className="py-2.5 pr-4 text-parchment/70">{pillar.market}</td>
                    <td className="py-2.5 text-parchment/70">
                      {new Date(pillar.publishedAt).toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Corrections */}
      <section className="px-[6%] py-8">
        <div className="max-w-4xl mx-auto velvet-card p-7">
          <p className="eyebrow mb-3">Corrections log</p>
          <h2 className="text-xl mb-3">2026</h2>
          <ul className="space-y-3 text-lg text-parchment/75">
            <li>
              <strong className="text-parchment">14 October 2026</strong> — the nine pillar stories
              were re-dated onto a staggered weekly schedule and their sections corrected to the
              house taxonomy (Style, Capsule Wardrobe, Beauty, Interiors, Craft &amp; Fit). No
              verdicts were changed.
            </li>
            <li>
              <strong className="text-parchment">14 October 2026</strong> — author schema moved from
              an anonymous Organization to a named Person, so every story now carries the byline of
              the editor who wrote it.
            </li>
          </ul>
          <p className="text-base text-parchment/60 mt-5">
            Spotted an error? Write to {CLARA_VANCE.contactEmail} with the story and the sentence.
            Substantive corrections are logged here and the story&rsquo;s review date is updated.
          </p>
        </div>
      </section>

      <div className="px-[6%] mt-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/privacy" className="cta-bar">
            Privacy notice · What the desk does with your address
          </Link>
        </div>
      </div>
    </div>
  );
}
