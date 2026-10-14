import Link from "next/link";
import type { Metadata } from "next";
import VillainessQuiz from "@/components/VillainessQuiz";
import { ARCHETYPE_ORDER, ARCHETYPES } from "@/lib/villainess-quiz";
import WaxSeal from "@/components/WaxSeal";

export const metadata: Metadata = {
  title: "Which Villainess Are You? — Six Questions, One Verdict | The Oxblood Edit",
  description:
    "Six questions, one verdict. Take The Oxblood Edit's reading and be sealed as The Velvet Widow, The Library Siren, The Crimson Heiress or The Thorned Muse.",
  openGraph: {
    title: "Which Villainess Are You? · The Oxblood Edit",
    description:
      "Six questions. One verdict. Four archetypes of dark elegance, each with its uniform, its lip and its book.",
    type: "website",
    images: [
      {
        url: "/images/editorial/villainess-hero-16x9.jpg",
        width: 1920,
        height: 1080,
        alt: "A woman in a black velvet cape with oxblood lining in a candlelit gallery"
      }
    ]
  }
};

export default function VillainessQuizPage() {
  return (
    <div>
      <section className="relative px-[6%] pt-16 pb-12 sm:pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-7">
            <WaxSeal size={104} />
          </div>
          <p className="eyebrow mb-4">WHICH VILLAINESS ARE YOU?</p>
          <h1 className="text-4xl sm:text-6xl mb-5">Six questions. One verdict.</h1>
          <p className="text-xl sm:text-2xl text-parchment/75 max-w-2xl mx-auto">
            True elegance does not shout, and neither does this reading. Answer for the woman
            people describe at the party — not the one who attends it.
          </p>
          <p className="font-cinzel text-[0.68rem] tracking-[0.3em] uppercase text-gold/70 mt-7">
            Her uniform. Her lip. Her book.
          </p>
        </div>
      </section>

      <section className="px-[6%] pb-14">
        <div className="max-w-3xl mx-auto">
          <VillainessQuiz />
        </div>
      </section>

      <section className="px-[6%] pb-16">
        <div className="max-w-5xl mx-auto">
          <hr className="hairline mb-10" />
          <p className="eyebrow mb-3 text-center">THE FOUR VERDICTS</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {ARCHETYPE_ORDER.map((key) => {
              const archetype = ARCHETYPES[key];
              return (
                <article key={key} className="velvet-card p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                      <p className="font-cinzel text-[0.66rem] tracking-[0.26em] uppercase text-gold">
                        Archetype {archetype.roman}
                      </p>
                      <div className="flex gap-1.5">
                        {archetype.palette.map((swatch) => (
                          <span
                            key={swatch.hex}
                            title={`${swatch.name} ${swatch.hex}`}
                            className="inline-block h-3 w-3 border border-gold/40"
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                    </div>
                    <h2 className="text-2xl mb-1">{archetype.name}</h2>
                    <p className="italic text-lg text-parchment/70 mb-4">{archetype.epithet}</p>
                    <p className="text-lg text-parchment/80">{archetype.motto}</p>
                  </div>
                  <Link
                    href={`/journal/${archetype.articleSlug}`}
                    className="font-cinzel text-[0.68rem] tracking-[0.22em] uppercase text-gold no-underline hover:text-parchment mt-6 inline-block"
                  >
                    {archetype.articleLabel} →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Link href="/shop/the-oxblood-code" className="cta-bar">
        THE OXBLOOD CODE · 78 PAGES · US 0–16 / UK 4–20
      </Link>
    </div>
  );
}
