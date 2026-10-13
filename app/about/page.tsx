export const metadata = {
  title: "About — The Oxblood Edit",
  description: "A luxury editorial system for dark elegance: vamp-romantic fashion, dark beauty rituals and moody interiors."
};

export default function AboutPage() {
  return (
    <section className="px-[8%] py-16 max-w-4xl mx-auto min-h-[55vh]">
      <p className="font-cinzel text-xs tracking-[0.2em] text-oxblood uppercase mb-2">
        HOUSE MANIFESTO
      </p>
      <h1 className="text-4xl sm:text-5xl mb-6">About The Oxblood Edit</h1>
      <p className="text-2xl text-nearblack/90 mb-5">
        A luxury editorial system for dark elegance: vamp-romantic fashion, dark beauty rituals and moody interiors.
      </p>
      <p className="text-xl text-nearblack/80 mb-5">
        Our visual language is built around oxblood (#6E1423), jet black (#0B0A08), parchment cream (#EDE4D0) and antique gold (#C6A15B). Intentional, architectural, and never loud.
      </p>
      <p className="text-xl text-nearblack/80">
        Designed for readers across the US and UK, every formula pairs heritage tailoring with modern romantic silhouettes across three transparent budget tiers.
      </p>
    </section>
  );
}
