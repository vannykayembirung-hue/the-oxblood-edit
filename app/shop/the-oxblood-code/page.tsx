import { getProductBySlug } from "@/lib/db";
import { isSafeHttpUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Oxblood Code — Signature Digital Guide",
  description: "A 78-page dark-romantic wardrobe system for timeless, intentional dressing."
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
    summary: "How to calibrate oxblood (#6E1423), espresso, charcoal, and antique gold for cool and warm undertones."
  },
  {
    number: "II",
    title: "The 12 Core Silhouettes",
    summary: "Exact garment specifications, fabric weight benchmarks (GSM), and tailoring checkpoints for US 0–16 & UK 4–20."
  },
  {
    number: "III",
    title: "36 Day-to-Candlelight Formulas",
    summary: "Visual outfit matrices pairing structured British wool outerwear with bias-cut silk and leather footwear."
  },
  {
    number: "IV",
    title: "The US & UK Sourcing Directory",
    summary: "Curated retail and second-hand archival search terms across three transparent budget tiers."
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
    offers: {
      "@type": "Offer",
      price: String(product?.price ?? 27),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <section className="px-[8%] py-16 max-w-5xl mx-auto min-h-[65vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
        THE SIGNATURE DIGITAL EDITION
      </p>
      <h1 className="text-4xl sm:text-6xl mb-4">{product?.name || "The Oxblood Code"}</h1>
      <p className="text-2xl text-nearblack/85 max-w-3xl mb-8">
        {product?.description ||
          "A dark-romantic wardrobe system for timeless, intentional dressing."}
      </p>

      {/* Main Offer Box */}
      <div className="bg-white p-8 sm:p-10 border-t-4 border-oxblood shadow-sm my-8 grid md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-3">
          <p className="font-cinzel text-xs uppercase tracking-widest text-nearblack/70 mb-3">
            Included in this digital edition:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-xl mb-6">
            {deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 bg-nearblack text-cream p-6 border-t-4 border-gold">
          <p className="font-cinzel text-xs tracking-widest uppercase text-gold mb-1">
            INSTANT DIGITAL DOWNLOAD
          </p>
          <h2 className="text-4xl mb-4">${product?.price ?? 27} USD</h2>
          {url ? (
            <a
              className="btn-gold w-full text-center"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              GET THE GUIDE ON GUMROAD
            </a>
          ) : (
            <div className="border-l-2 border-gold pl-3 text-sm text-[#d8cdb9]">
              <strong>Admin setup note:</strong> Add your live Gumroad URL in{" "}
              <a href="/admin?tab=product" className="underline text-gold">
                Admin Product settings
              </a>{" "}
              to activate instant checkout.
            </div>
          )}
        </div>
      </div>

      {/* Chromatic Spine Swatches */}
      <div className="my-14">
        <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
          THE CHROMATIC SPINE
        </p>
        <h2 className="text-3xl mb-6">Four tones. Zero visual noise.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PALETTE_SWATCHES.map((swatch) => (
            <div key={swatch.hex} className="bg-white p-4 border border-nearblack/15">
              <div
                className="h-20 w-full mb-3 border border-nearblack/20"
                style={{ backgroundColor: swatch.hex }}
              />
              <p className="font-cinzel text-sm font-semibold">{swatch.name}</p>
              <p className="font-mono text-xs text-nearblack/65">{swatch.hex}</p>
              <p className="text-sm text-oxblood mt-1">{swatch.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Architecture */}
      <div className="my-14">
        <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
          INSIDE THE EDITION
        </p>
        <h2 className="text-3xl mb-6">Syllabus of the 78-page guide</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {CHAPTERS.map((ch) => (
            <div key={ch.number} className="bg-white/75 p-6 border-t-2 border-gold">
              <p className="font-cinzel text-xs tracking-widest text-oxblood uppercase mb-1">
                Chapter {ch.number}
              </p>
              <h3 className="text-xl mb-2">{ch.title}</h3>
              <p className="text-lg text-nearblack/80">{ch.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
