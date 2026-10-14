import Link from "next/link";
import WaxSeal from "@/components/WaxSeal";

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
              Write to the desk and we will tell you whether a link pays.
            </span>
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
