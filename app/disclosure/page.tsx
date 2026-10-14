import Link from "next/link";
import WaxSeal from "@/components/WaxSeal";
import { CLARA_VANCE } from "@/lib/editorial-desk";

export const metadata = {
  title: "Affiliate Disclosure — The Oxblood Edit",
  description:
    "Transparency and affiliate relationship disclosure for The Oxblood Edit.",
  alternates: { canonical: "/disclosure" }
};

const CLAUSES = [
  {
    number: "I",
    title: "Commissioned links",
    body: "The Oxblood Edit is an independent editorial publication. Some links featured in our journal stories and curated edits are affiliate links. If you choose to make a purchase through those links, we may earn a small commission at no additional cost to you."
  },
  {
    number: "II",
    title: "Selection is editorial first",
    body: "Every garment, beauty product, and interior piece is selected solely on editorial merit, material quality, and alignment with our dark-romantic aesthetic across US and UK retailers."
  },
  {
    number: "III",
    title: "What we do not do",
    body: "We do not accept payment for placement, we do not write sponsored reviews, and we do not raise a price because a link earns us a commission. Click tracking is limited to counting which pieces are opened; no personal profile is built or sold."
  },
  {
    number: "IV",
    title: "The ad is labelled where the ad sits (UK — ASA/CAP)",
    body: "Affiliate content is marketing communication under the CAP Code. Every affiliate block therefore carries an \"Affiliate ad\" label and a plain-language disclosure immediately above the links, and outbound affiliate links are marked rel=\"sponsored\". A reader never has to reach the footer to learn that a recommendation can pay the desk — CAP rules 2.1 and 2.3, applied literally."
  },
  {
    number: "V",
    title: "Clear and conspicuous, in American terms (US — FTC)",
    body: "For readers in the United States the same disclosure is made in the language the FTC's Endorsement Guides ask for (16 CFR Part 255) and in line with its native advertising guidance: the commercial relationship is disclosed before the link, not after it, and never as a bare \"affiliate\" tag with no explanation. The desk does not accept money for a verdict, and no merchant sees a story before it is published."
  },
  {
    number: "VI",
    title: "Email, consent and what we know about you",
    body: "The desk writes to you only if you ticked the consent box: the exact wording, its version, the page it happened on and the time are stored against your address (UK GDPR Article 6(1)(a) and PECR). Every new address is double opt-in and every dispatch carries a one-click unsubscribe. Nothing is sold, rented or shared, and no reader-level profile exists to sell."
  },
  {
    number: "VII",
    title: "Prices, currencies and availability",
    body: "Prices are quoted in USD and GBP at the time of publication and are the desk's best record of what the merchant showed. Merchants set and change the final price, and sales move stock: the number on the shelf always wins. A commission never depends on what you pay."
  }
];

export default function DisclosurePage() {
  return (
    <div className="pb-16">
      <section className="px-[6%] pt-16 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <WaxSeal size={44} />
            <p className="eyebrow">Transparency</p>
          </div>
          <h1 className="text-4xl sm:text-5xl mb-5">Affiliate Disclosure</h1>
          <p className="text-xl text-parchment/78">
            Written plainly, because trust is the only asset a fashion publication cannot buy back.
          </p>
          <p className="text-sm text-parchment/55 mt-4">
            Reviewed by {CLARA_VANCE.name} · 14 October 2026 · read alongside the{" "}
            <Link href="/editorial-standards" className="text-gold underline underline-offset-4">
              editorial standards
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" className="text-gold underline underline-offset-4">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="px-[6%] py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {CLAUSES.map((clause) => (
            <article key={clause.number} className="velvet-card p-7 flex gap-6">
              <p className="font-cinzel text-2xl text-gold/85 leading-none shrink-0">
                {clause.number}
              </p>
              <div>
                <h2 className="text-xl mb-2">{clause.title}</h2>
                <p className="text-lg text-parchment/72">{clause.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-[6%] py-10">
        <div className="max-w-3xl mx-auto velvet-inset p-7">
          <p className="text-lg text-parchment/70 mb-1">
            Questions about a specific recommendation?{" "}
            <span className="text-gold">
              Write to {CLARA_VANCE.contactEmail} and we will tell you whether a link pays.
            </span>
          </p>
          <p className="text-base text-parchment/60 mt-3">
            Unhappy with a labelled advert? UK readers can take it to the Advertising Standards
            Authority at asa.org.uk; US readers can raise it with the FTC at reportfraud.ftc.gov. The
            desk would rather hear from you first.
          </p>
        </div>
      </section>

      <div className="px-[6%] mt-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/journal" className="cta-bar">
            Back to the journal
          </Link>
        </div>
      </div>
    </div>
  );
}
