import Link from "next/link";
import { getProductBySlug } from "@/lib/db";
import { isSafeHttpUrl } from "@/lib/sanitize";
import WaxSeal from "@/components/WaxSeal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Oxblood Code — Signature Digital Guide",
  description:
    "A 78-page dark-romantic wardrobe system for timeless, intentional dressing across US 0–16 and UK 4–20.",
  alternates: { canonical: "/shop/the-oxblood-code" }
};

const PALETTE_SWATCHES = [
  { hex: "#0B0A08", name: "Jet Black", role: "70% Structural Tailoring" },
  { hex: "#6E1423", name: "Deep Oxblood", role: "20% Romantic Depth" },
  { hex: "#EDE4D0", name: "Parchment Cream", role: "5% Silk & Contrast" },
  { hex: "#C6A15B", name: "Antique Gold", role: "5% Hardware & Accents" }
];

const CHAPTERS = [
  {
    number: "I",
    title: "The Chromatic Spine",
    summary:
      "How to calibrate oxblood (#6E1423), espresso, charcoal, and antique gold for cool and warm undertones."
  },
  {
    number: "II",
    title: "The 12 Core Silhouettes",
    summary:
      "Exact garment specifications, fabric weight benchmarks (GSM), and tailoring checkpoints for US 0–16 & UK 4–20."
  },
  {
    number: "III",
    title: "36 Day-to-Candlelight Formulas",
    summary:
      "Visual outfit matrices pairing structured British wool outerwear with bias-cut silk and leather footwear."
  },
  {
    number: "IV",
    title: "The US & UK Sourcing Directory",
    summary:
      "Curated retail and second-hand archival search terms across three transparent budget tiers."
  }
];

export default async function ProductPage() {
  const product = await getProductBySlug("the-oxblood-code");
  const rawUrl =
    product?.gumroad_url && product.gumroad_url !== "__GUMROAD_URL__"
      ? product.gumroad_url
      : null;
  const url = rawUrl && isSafeHttpUrl(rawUrl) ? rawUrl : null;

  const deliverables =
    product?.what_inside && product.what_inside.length > 0
      ? product.what_inside
      : [
          "78 pages PDF",
          "12 outfit formulas",
          "Palette #6E1423",
          "US 0-16 / UK 4-20",
          "Printable checklist"
        ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name || "The Oxblood Code",
    description:
      product?.description ||
      "A 78-page dark-romantic wardrobe system for timeless, intentional dressing.",
    image: ["/images/editorial/capsule-wardrobe-16x9.jpg"],
    offers: {
      "@type": "Offer",
      price: String(product?.price ?? 27),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <div className="pb-16">
      {/* Cover band — 16:9, oxblood halo */}
      <section className="px-[6%] pt-14 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <WaxSeal size={44} />
            <p className="eyebrow">The Signature Digital Edition</p>
          </div>
          <h1 className="text-4xl sm:text-6xl mb-4 leading-[1.1]">
            {product?.name || "The Oxblood Code"}
          </h1>
          <p className="text-xl sm:text-2xl text-parchment/78 max-w-3xl mb-9">
            {product?.description ||
              "A dark-romantic wardrobe system for timeless, intentional dressing."}
          </p>
          <figure className="plate w-full">
            <span className="frame-16x9 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/editorial/capsule-wardrobe-16x9.jpg"
                alt="Twelve curated garments in jet black wool, oxblood velvet and ivory silk arranged on an antique valet stand in candlelight"
                width={1920}
                height={1080}
                fetchPriority="high"
              />
            </span>
            <figcaption>Plate I · The twelve silhouettes, photographed on one stand</figcaption>
          </figure>
        </div>
      </section>

      {/* Offer */}
      <section className="px-[6%] py-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-6 items-stretch">
          <div className="md:col-span-3 velvet-card p-8 sm:p-10">
            <p className="font-cinzel text-[0.66rem] uppercase tracking-[0.26em] text-gold/85 mb-4">
              Included in this digital edition
            </p>
            <ul className="space-y-3 text-xl mb-8">
              {deliverables.map((item) => (
                <li key={item} className="flex gap-3 items-baseline">
                  <span className="text-gold select-none">✦</span>
                  <span className="text-parchment/85">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-parchment/55 italic">
              Delivered as a print-ready PDF, laid out for reading by lamplight at A5.
            </p>
          </div>

          <div className="md:col-span-2 velvet-card velvet-card--rule p-7 flex flex-col justify-between">
            <div>
              <p className="font-cinzel text-[0.64rem] tracking-[0.26em] uppercase text-gold mb-2">
                Instant Digital Download
              </p>
              <h2 className="text-4xl sm:text-5xl mb-1">${product?.price ?? 27}</h2>
              <p className="text-sm text-parchment/55 mb-7 uppercase font-cinzel tracking-[0.2em]">
                USD · single licence
              </p>
            </div>
            {url ? (
              <a
                className="btn-oxblood w-full text-center"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get the guide on Gumroad
              </a>
            ) : (
              <div className="space-y-4">
                <Link href="/journal" className="btn-oxblood w-full text-center">
                  Read the journal first
                </Link>
                <div className="velvet-inset border-l-2 border-gold/60 px-4 py-3 text-sm text-parchment/65">
                  <strong className="text-parchment">Admin setup note:</strong> Add your live Gumroad
                  URL in{" "}
                  <a href="/admin?tab=product" className="underline text-gold">
                    Admin Product settings
                  </a>{" "}
                  to activate instant checkout.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chromatic spine */}
      <section className="px-[6%] py-14">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow mb-3">The Chromatic Spine</p>
          <h2 className="text-3xl mb-8">Four tones. Zero visual noise.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PALETTE_SWATCHES.map((swatch) => (
              <div key={swatch.hex} className="velvet-card p-4">
                <div
                  className="h-24 w-full mb-4 border border-gold/30"
                  style={{ backgroundColor: swatch.hex }}
                />
                <p className="font-cinzel text-sm text-parchment">{swatch.name}</p>
                <p className="font-mono text-xs text-gold/75 mt-0.5">{swatch.hex}</p>
                <p className="text-sm text-parchment/60 mt-2">{swatch.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="px-[6%] pb-4">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow mb-3">Inside the Edition</p>
          <h2 className="text-3xl mb-8">Syllabus of the 78-page guide</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {CHAPTERS.map((ch) => (
              <div key={ch.number} className="velvet-card p-7">
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-cinzel text-2xl text-gold/85 leading-none">{ch.number}</span>
                  <span className="h-px flex-1 bg-gold/25" />
                </div>
                <h3 className="text-xl mb-2.5">{ch.title}</h3>
                <p className="text-lg text-parchment/72">{ch.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-[6%] mt-14">
        <div className="max-w-5xl mx-auto">
          <Link href="/quiz" className="cta-bar">
            Not sure it suits you? · Take the six-question reading first
          </Link>
        </div>
      </div>
    </div>
  );
}
