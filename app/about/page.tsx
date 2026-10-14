import Link from "next/link";
import WaxSeal from "@/components/WaxSeal";

export const metadata = {
  title: "About — The Oxblood Edit",
  description:
    "A luxury editorial system for dark elegance: vamp-romantic fashion, dark beauty rituals and moody interiors.",
  alternates: { canonical: "/about" }
};

const PRINCIPLES = [
  {
    title: "Restraint over costume",
    body: "Dark romance is a tension, not a theme party. One statement texture per frame; everything else matte, quiet and architectural."
  },
  {
    title: "Photographed by candlelight",
    body: "Every story is shot and cropped at a strict 16:9, because a wardrobe should be judged in the light it will actually be worn in."
  },
  {
    title: "Three honest budgets",
    body: "Heritage British wool, contemporary tailoring, or second-hand archival velvet — the formula holds at every tier, and we say which one you are paying for."
  }
];

export default function AboutPage() {
  return (
    <div className="pb-16">
      <section className="px-[6%] pt-16 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <WaxSeal size={44} />
            <p className="eyebrow">House Manifesto</p>
          </div>
          <h1 className="text-4xl sm:text-6xl mb-6 leading-[1.1]">About The Oxblood Edit</h1>
          <p className="text-2xl text-parchment/85 mb-5">
            A luxury editorial system for dark elegance: vamp-romantic fashion, dark beauty rituals
            and moody interiors.
          </p>
          <figure className="plate w-full my-9">
            <span className="frame-16x9 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/editorial/villainess-detail-16x9.jpg"
                alt="Detail of oxblood silk satin against black chantilly lace with an antique gold signet ring"
                width={1920}
                height={1080}
                loading="lazy"
              />
            </span>
            <figcaption>Plate I · The house detail: satin, lace, one gold signet</figcaption>
          </figure>
          <p className="text-xl text-parchment/78 mb-5">
            Our visual language is built around oxblood <span className="text-gold">#6E1423</span>,
            jet black <span className="text-gold">#0B0A08</span>, parchment cream{" "}
            <span className="text-gold">#EDE4D0</span> and antique gold{" "}
            <span className="text-gold">#C6A15B</span>. Intentional, architectural, and never loud.
          </p>
          <p className="text-xl text-parchment/78">
            Designed for readers across the US and UK, every formula pairs heritage tailoring with
            modern romantic silhouettes across three transparent budget tiers.
          </p>
        </div>
      </section>

      <section className="px-[6%] py-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-px bg-gold/25 border border-gold/25">
          {PRINCIPLES.map((principle, index) => (
            <div key={principle.title} className="bg-velvet p-6">
              <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-3">
                Principle {["I", "II", "III"][index]}
              </p>
              <h2 className="text-lg mb-2.5 leading-snug">{principle.title}</h2>
              <p className="text-base text-parchment/70">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-[6%] py-12">
        <div className="max-w-4xl mx-auto velvet-card p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center">
          <div className="flex-1">
            <p className="eyebrow mb-3">Her uniform. Her lip. Her book.</p>
            <h2 className="text-2xl sm:text-3xl mb-3">Which villainess are you?</h2>
            <p className="text-lg text-parchment/72">
              Six questions, one verdict, sealed in oxblood wax — and a wardrobe formula you can
              actually shop.
            </p>
          </div>
          <Link href="/quiz" className="btn-oxblood shrink-0">
            Begin the reading
          </Link>
        </div>
      </section>

      <div className="px-[6%] mt-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/shop/the-oxblood-code" className="cta-bar">
            The Oxblood Code · 78 Pages · $27 USD
          </Link>
        </div>
      </div>
    </div>
  );
}
