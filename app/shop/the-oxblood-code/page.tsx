import { getProductBySlug } from "@/lib/db";
import { isSafeHttpUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Oxblood Code — Signature Digital Guide",
  description: "A 78-page dark-romantic wardrobe system for timeless, intentional dressing."
};

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

  return (
    <section className="px-[8%] py-16 max-w-4xl mx-auto min-h-[60vh]">
      <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
        THE SIGNATURE GUIDE
      </p>
      <h1 className="text-4xl sm:text-6xl mb-4">{product?.name || "The Oxblood Code"}</h1>
      <p className="text-2xl text-nearblack/85 mb-6">
        {product?.description ||
          "A dark-romantic wardrobe system for timeless, intentional dressing."}
      </p>

      <div className="bg-white p-8 border-t-4 border-oxblood shadow-sm my-8">
        <h2 className="text-3xl mb-4">${product?.price ?? 27} USD</h2>
        <p className="font-cinzel text-xs uppercase tracking-widest text-nearblack/70 mb-3">
          What is inside the edition:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xl mb-6">
          {deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {url ? (
          <a
            className="btn-gold"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            GET THE GUIDE ON GUMROAD
          </a>
        ) : (
          <div className="border-l-4 border-gold bg-cream/50 p-4 text-base">
            <strong>Setup note:</strong> Add your live Gumroad checkout URL in the{" "}
            <a href="/admin?tab=product" className="underline text-oxblood">
              Admin Product settings
            </a>{" "}
            before accepting public purchases.
          </div>
        )}
      </div>
    </section>
  );
}
