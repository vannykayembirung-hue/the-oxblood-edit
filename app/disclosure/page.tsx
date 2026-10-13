export const metadata = {
  title: "Affiliate Disclosure — The Oxblood Edit",
  description: "Transparency and affiliate relationship disclosure for The Oxblood Edit."
};

export default function DisclosurePage() {
  return (
    <section className="px-[8%] py-16 max-w-4xl mx-auto min-h-[55vh]">
      <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
        TRANSPARENCY
      </p>
      <h1 className="text-4xl sm:text-5xl mb-6">Affiliate Disclosure</h1>
      <p className="text-xl text-nearblack/85 mb-4">
        The Oxblood Edit is an independent editorial publication. Some links featured in our journal stories and curated edits are affiliate links. If you choose to make a purchase through those links, we may earn a small commission at no additional cost to you.
      </p>
      <p className="text-xl text-nearblack/80">
        Every garment, beauty product, and interior piece is selected solely on editorial merit, material quality, and alignment with our dark-romantic aesthetic across US and UK retailers.
      </p>
    </section>
  );
}
