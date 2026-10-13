import Link from "next/link";

export default function NotFound() {
  return (
    <section className="px-[8%] py-24 max-w-3xl mx-auto min-h-[60vh] text-center">
      <p className="font-cinzel text-xs tracking-[0.24em] text-oxblood uppercase mb-3">
        404 · PAGE NOT FOUND
      </p>
      <h1 className="text-4xl sm:text-5xl mb-4">This page has stepped into the shadows.</h1>
      <p className="text-xl text-nearblack/80 mb-8">
        The editorial story or garment formula you are looking for may have been archived or moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/journal" className="btn-gold">
          EXPLORE THE JOURNAL
        </Link>
        <Link
          href="/shop/the-oxblood-code"
          className="px-6 py-3.5 border border-nearblack font-cinzel text-xs tracking-widest uppercase no-underline hover:bg-nearblack hover:text-cream transition-colors"
        >
          THE OXBLOOD CODE
        </Link>
      </div>
    </section>
  );
}
