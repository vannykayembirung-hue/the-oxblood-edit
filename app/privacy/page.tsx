import Link from "next/link";
import type { Metadata } from "next";
import WaxSeal from "@/components/WaxSeal";
import { CLARA_VANCE, PRIVACY_NOTICE_LAST_UPDATED } from "@/lib/editorial-desk";
import { NEWSLETTER_NAME, NEWSLETTER_RETENTION } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Privacy Notice — The Oxblood Edit",
  description:
    "How The Oxblood Edit collects, uses and deletes personal data under the UK GDPR and PECR: consent basis, double opt-in, retention, and your rights.",
  alternates: { canonical: "/privacy" }
};

const SECTIONS = [
  {
    number: "I",
    title: "Who is responsible for your data",
    body: [
      "The Oxblood Edit is the data controller for the personal data described in this notice. The editorial desk — and only the desk — decides why and how that data is used."
    ],
    detail: `Write to ${CLARA_VANCE.contactEmail} for anything in this notice: a copy of your data, a correction, an erasure request, or a complaint.`
  },
  {
    number: "II",
    title: "What we collect, and why",
    body: [
      "Email address — only when you type it into a capture form and tick the consent box, so the desk can send you the archetype dossier you asked for and the weekly Sunday Dispatch.",
      "Consent record — the exact wording you agreed to, its version number, the page the opt-in happened on, the time, and a salted hash of your IP address. This exists for one purpose: to prove what you agreed to, and to prove it stopped when you withdrew.",
      "Aggregate click counts — when a reader opens a piece from the curated edit, the desk counts the click against that garment. No profile is built, no reader is identified and the count is never joined to an email address."
    ]
  },
  {
    number: "III",
    title: "Lawful basis",
    body: [
      "The dispatch is sent on the basis of your consent (UK GDPR Article 6(1)(a)), collected by a positive opt-in. Under PECR, marketing email requires that consent — so there is no pre-ticked box, no bundled consent, and no soft opt-in.",
      "Aggregate click counts run on legitimate interests (Article 6(1)(f)): knowing which pieces readers open is how the edit stays useful, and the counting is done in a way that never identifies an individual."
    ]
  },
  {
    number: "IV",
    title: "Double opt-in",
    body: [
      "A new address is stored as pending, not subscribed. Nothing is sent until you open the confirmation link. If you never confirm, the row stays pending and no dispatch reaches you.",
      "Because the dossier is a free document you asked for, it is delivered at the point of the request — the desk does not hold a free download hostage until you agree to marketing."
    ]
  },
  {
    number: "V",
    title: "What we never do",
    body: [
      "We do not sell, rent or share your address. We do not run third-party advertising or behavioural ad profiling on this site. We do not add you to any list you did not join.",
      "Editorial recommendations are never bought: a merchant cannot pay to be recommended, and no recommendation changes because a link pays a commission. See the affiliate disclosure for the money side of that sentence."
    ]
  },
  {
    number: "VI",
    title: "Cookies and storage",
    body: [
      "The public site sets no cookies and no tracking pixels. The only cookie in the whole property is the session cookie on /admin, which keeps the editor signed in and expires when the session does.",
      "Images are served from this domain and carry no embedded trackers."
    ]
  },
  {
    number: "VII",
    title: "How long we keep it",
    body: [
      NEWSLETTER_RETENTION,
      "Aggregate click counts are numeric totals with no personal data attached, and are kept indefinitely so the edit can be audited across seasons."
    ]
  },
  {
    number: "VIII",
    title: "Where your data is held",
    body: [
      "The list lives in a PostgreSQL database hosted by Neon. Neon operates in US regions; where data leaves the UK, transfers are covered by the UK International Data Transfer Addendum to the EU Standard Contractual Clauses.",
      "Access is limited to the editorial desk, protected by credentials + rate limiting, and the mailing list is never exported to a third party except to the mail service that sends the dispatch — which acts as a processor under contract."
    ]
  },
  {
    number: "IX",
    title: "Your rights",
    body: [
      "You may access, correct, erase, restrict or object to the processing of your data, receive it in a portable format, and withdraw consent at any time. Withdrawing consent is not a negotiation — it takes one click and no reason is required.",
      "The desk answers every request within one calendar month. If you are in the UK and unhappy with the answer, you may complain to the Information Commissioner's Office at ico.org.uk or on 0303 123 1113.",
      "If you are in the United States, you may ask to know what is held, ask for a copy, request deletion, or ask the desk to stop writing to you — all through the same address, with the same timescale. Your personal information is never sold or shared for cross-context behavioural advertising, as those terms are defined by the CCPA/CPRA."
    ]
  },
  {
    number: "X",
    title: "Age",
    body: [
      "The Sunday Dispatch is written for adults. The desk does not knowingly collect data from anyone under 16; if a reader believes a child has subscribed, write to the desk and the row is removed."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <div className="pb-16">
      <section className="px-[6%] pt-16 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <WaxSeal size={44} />
            <p className="eyebrow">Data &amp; Consent</p>
          </div>
          <h1 className="text-4xl sm:text-5xl mb-5">Privacy Notice</h1>
          <p className="text-xl text-parchment/78">
            Written to be read, not skimmed: what the desk collects, why, for how long, and how to
            make it stop. Last updated {PRIVACY_NOTICE_LAST_UPDATED}.
          </p>
          <p className="text-sm text-parchment/55 mt-5">
            {NEWSLETTER_NAME} · consent version newsletter-consent/2026-10-14 · UK GDPR, PECR and
            Data Protection Act 2018
          </p>
        </div>
      </section>

      <section className="px-[6%] py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {SECTIONS.map((section) => (
            <article key={section.number} className="velvet-card p-7">
              <div className="flex gap-6">
                <p className="font-cinzel text-2xl text-gold/85 leading-none shrink-0">
                  {section.number}
                </p>
                <div>
                  <h2 className="text-xl mb-3">{section.title}</h2>
                  <div className="space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-lg text-parchment/72">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.detail && (
                    <p className="text-base text-gold/85 mt-3 break-words">{section.detail}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-[6%] py-10">
        <div className="max-w-3xl mx-auto velvet-inset p-7">
          <p className="eyebrow mb-3">Withdraw in one click</p>
          <p className="text-lg text-parchment/75 mb-5">
            Every dispatch carries an unsubscribe link. If you no longer have the email, the desk
            will still act on a written request within one calendar month.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/unsubscribe" className="btn-ghost">
              Unsubscribe
            </Link>
            <Link href="/editorial-standards" className="btn-ghost">
              Editorial standards
            </Link>
          </div>
        </div>
      </section>

      <div className="px-[6%] mt-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/disclosure" className="cta-bar">
            How the desk makes money · Affiliate disclosure
          </Link>
        </div>
      </div>
    </div>
  );
}
