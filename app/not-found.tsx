import Link from "next/link";
import WaxSeal from "@/components/WaxSeal";

export default function NotFound() {
  return (
    <section className="px-[6%] py-24 max-w-3xl mx-auto min-h-[60vh] text-center">
      <div className="flex justify-center mb-7">
        <WaxSeal size={92} />
      </div>
      <p className="eyebrow mb-3">404 · Page Not Found</p>
      <h1 className="text-4xl sm:text-5xl mb-4">This page has stepped into the shadows.</h1>
      <p className="text-xl text-parchment/72 mb-9">
        The editorial story or garment formula you are looking for may have been archived or moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/journal" className="btn-oxblood">
          Explore the Journal
        </Link>
        <Link href="/quiz" className="btn-ghost">
          Take the reading
        </Link>
      </div>
    </section>
  );
}
